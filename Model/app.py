# =========================
# IMPORTS
# =========================
import os
import sys
from concurrent.futures import ThreadPoolExecutor
from flask import Flask, request, jsonify
from flask_cors import CORS

# =========================
# PATH + ENV SETUP
# =========================
sys.path.append(os.path.dirname(os.path.abspath(__file__)))


def _load_local_env_file():
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    if not os.path.exists(env_path):
        return

    try:
        with open(env_path, "r", encoding="utf-8") as env_file:
            for raw_line in env_file:
                line = raw_line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue

                key, value = line.split("=", 1)
                key = key.strip()
                value = value.strip().strip('"').strip("'")
                os.environ.setdefault(key, value)
    except Exception as env_error:
        print("Warning: failed to load .env file:", env_error)


_load_local_env_file()

# Model & Inference
from api_utils.model_loader import load_model, load_scaler, load_indexers
from api_utils.inference import run_inference
from api_utils.explainable_inference import run_explainable_inference
from api_utils.llm import generate_or_get_xai_llm_insights

# =========================
# GAS TRANSLATION LAYER
# =========================
# API / DB → MODEL
API_TO_MODEL_GAS = {
    "co2": "co2",
    "ch4": "ch4",
    "n2o": "nox"   # 🔥 key mapping
}

# MODEL → API
MODEL_TO_API_GAS = {
    "co2": "co2",
    "ch4": "ch4",
    "nox": "n2o"
}

# =========================
# FLASK APP
# =========================
app = Flask(__name__)
CORS(app)

# Shared thread pool for model inference tasks.
INFERENCE_EXECUTOR = ThreadPoolExecutor(max_workers=4)


def _compute_gas_total(user_input, api_gas):
    temp_input = dict(user_input)
    temp_input["gas"] = API_TO_MODEL_GAS[api_gas]
    res = run_inference(temp_input, MODEL, SCALER, INDEXERS)
    return api_gas, float(res["total_emissions"])

# =========================
# LOAD MODEL ASSETS (FIXED)
# =========================
print("🚀 Initializing API Server...")
try:
    MODEL = load_model()
    SCALER = load_scaler()
    INDEXERS = load_indexers()
    print("✅ Model, scaler, indexers loaded successfully")
except Exception as e:
    print("❌ FATAL ERROR loading assets:", e)
    exit(1)

# =========================
# HEALTH
# =========================
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "online", "message": "GHG API running"})

# =========================
# PREDICTION
# =========================
@app.route("/api/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        print(f"\n📩 Received Request: {data}")

        required = ["country", "sector", "gas"]
        if not all(k in data for k in required):
            return jsonify({"error": "Missing required fields"}), 400

        api_gas = data["gas"].lower()
        if api_gas not in API_TO_MODEL_GAS:
            return jsonify({"error": "Invalid gas type"}), 400

        model_gas = API_TO_MODEL_GAS[api_gas]

        user_input = {
            "country": data["country"],
            "sector": data["sector"],
            "gas": model_gas,
            "year": int(data.get("year", 2025)),
            "month": int(data.get("month", 1)),
            "lat": data.get("lat"),
            "lon": data.get("lon")
        }

        # ---- MAIN + EXPLAINABILITY (ASYNC) ----
        results_future = INFERENCE_EXECUTOR.submit(
            run_inference, user_input, MODEL, SCALER, INDEXERS
        )
        prediction_explanation_future = INFERENCE_EXECUTOR.submit(
            run_explainable_inference, user_input, MODEL, SCALER, INDEXERS
        )
        results = results_future.result()
        explanation = prediction_explanation_future.result()

        llm_future = INFERENCE_EXECUTOR.submit(
            generate_or_get_xai_llm_insights,
            user_input,
            {
                "total_emissions": float(results["total_emissions"]),
                "monthly_trends": [float(x) for x in results["monthly_emissions"]],
                "subsector_breakdown": [
                    {
                        "name": sub,
                        "total": float(details["total_emissions"]),
                        "monthly": [float(x) for x in details["monthly_emissions"]],
                    }
                    for sub, details in results["subsector_emissions"].items()
                ],
            },
            explanation,
        )

        # ---- GAS COMPOSITION ----
        api_gases = ["co2", "ch4", "n2o"]
        gas_totals = {api_gas: float(results["total_emissions"])}

        gas_futures = {
            g: INFERENCE_EXECUTOR.submit(_compute_gas_total, user_input, g)
            for g in api_gases
            if g != api_gas
        }

        for g, future in gas_futures.items():
            try:
                _, total = future.result()
                gas_totals[g] = total
            except Exception:
                gas_totals[g] = 0.0

        grand_total = sum(gas_totals.values())

        gas_ratios = {
            g: round((v / grand_total) * 100, 2) if grand_total > 0 else 0
            for g, v in gas_totals.items()
        }

        response = {
            "status": "success",
            "meta": {
                "country": user_input["country"],
                "sector": user_input["sector"],
                "year": user_input["year"],
                "requested_gas": api_gas
            },
            "data": {
                "total_emissions": float(results["total_emissions"]),
                "monthly_trends": [float(x) for x in results["monthly_emissions"]],
                "subsector_breakdown": [],
                "gas_composition": {
                    "ratios": gas_ratios,
                    "absolute_totals": gas_totals,
                    "total_combined": grand_total
                }
            }
        }

        for sub, details in results["subsector_emissions"].items():
            response["data"]["subsector_breakdown"].append({
                "name": sub,
                "total": float(details["total_emissions"]),
                "monthly": [float(x) for x in details["monthly_emissions"]]
            })

        try:
            llm_result = llm_future.result()
        except Exception as llm_error:
            print("LLM insight generation error:", llm_error)
            llm_result = {"insight_text": None}
        response["data"]["llm_insights"] = llm_result.get("insight_text")

        return jsonify(response)

    except Exception as e:
        print("❌ Predict Error:", e)
        return jsonify({"status": "error", "message": str(e)}), 500

# =========================
# EXPLAINABILITY
# =========================
@app.route("/api/explain", methods=["POST"])
def explain():
    try:
        data = request.json

        api_gas = data["gas"].lower()
        if api_gas not in API_TO_MODEL_GAS:
            return jsonify({"error": "Invalid gas type"}), 400

        user_input = {
            "country": data["country"],
            "sector": data["sector"],
            "gas": API_TO_MODEL_GAS[api_gas],
            "year": int(data.get("year", 2025)),
            "month": int(data.get("month", 1)),
            "lat": data.get("lat"),
            "lon": data.get("lon")
        }

        explanation_future = INFERENCE_EXECUTOR.submit(
            run_explainable_inference, user_input, MODEL, SCALER, INDEXERS
        )
        explanation = explanation_future.result()

        return jsonify({
            "status": "success",
            "meta": {**data, "gas": api_gas},
            "data": explanation
        })

    except Exception as e:
        print("❌ Explain Error:", e)
        return jsonify({"status": "error", "message": str(e)}), 500




# =========================
# MAIN
# =========================
if __name__ == "__main__":
    print("🚀 Server running at http://127.0.0.1:5000")
    app.run(debug=True, port=5000)
