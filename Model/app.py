# =========================
# IMPORTS
# =========================
import os
import sys
import copy
from flask import Flask, request, jsonify
from flask_cors import CORS

# Model & Inference
from api_utils.model_loader import load_model, load_scaler, load_indexers
from api_utils.inference import run_inference

# =========================
# PATH SETUP
# =========================
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

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

        # ---- MAIN INFERENCE ----
        results = run_inference(user_input, MODEL, SCALER, INDEXERS)

        # ---- GAS COMPOSITION ----
        api_gases = ["co2", "ch4", "n2o"]
        gas_totals = {}
        grand_total = 0.0

        for g in api_gases:
            temp_input = copy.deepcopy(user_input)
            temp_input["gas"] = API_TO_MODEL_GAS[g]

            try:
                res = run_inference(temp_input, MODEL, SCALER, INDEXERS)
                gas_totals[g] = float(res["total_emissions"])
            except Exception:
                gas_totals[g] = 0.0

            grand_total += gas_totals[g]

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

        return jsonify(response)

    except Exception as e:
        print("❌ Predict Error:", e)
        return jsonify({"status": "error", "message": str(e)}), 500

# =========================
# EXPLAINABILITY
# =========================
# @app.route("/api/explain", methods=["POST"])
# def explain():
#     try:
#         data = request.json

#         api_gas = data["gas"].lower()
#         if api_gas not in API_TO_MODEL_GAS:
#             return jsonify({"error": "Invalid gas type"}), 400

#         user_input = {
#             "country": data["country"],
#             "sector": data["sector"],
#             "gas": API_TO_MODEL_GAS[api_gas],
#             "year": int(data.get("year", 2025)),
#             "month": int(data.get("month", 1)),
#             "lat": data.get("lat"),
#             "lon": data.get("lon")
#         }

#         explanation = run_xai_inference(
#             user_input, MODEL, SCALER, INDEXERS
#         )

#         return jsonify({
#             "status": "success",
#             "meta": {**data, "gas": api_gas},
#             "data": explanation
#         })

#     except Exception as e:
#         print("❌ Explain Error:", e)
#         return jsonify({"status": "error", "message": str(e)}), 500




# =========================
# MAIN
# =========================
if __name__ == "__main__":
    print("🚀 Server running at http://127.0.0.1:5000")
    app.run(debug=True, port=5000)
