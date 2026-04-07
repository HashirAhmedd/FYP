import os

import requests


GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions"


def _build_prompt(model_input):
    return (
        f'''
        You are an expert Climate Policy Analyst and AI Interpretation Specialist focused on Pakistan.

Your task is to analyze:
1. A machine learning prediction of greenhouse gas (GHG) emissions
2. Explainable AI (XAI) outputs (feature attributions)
3. Aggregated emissions data (monthly and yearly across subsectors)

and generate structured, actionable insights.

----------------------------------------
INPUT DATA:
----------------------------------------

Prediction:
- Year
- Gas
- Sector
- Predicted Emission Value

XAI Output:
- Feature Attributions
(Shows contribution of each feature like latitude, longitude, duration, month, year, etc.)

Aggregated Data:
- Monthly Aggregated Emissions (All Subsectors)
- Yearly Aggregated Emissions (All Subsectors)
- Yearly Subsector Breakdown

----------------------------------------
INSTRUCTIONS:
----------------------------------------

Analyze the data deeply and generate insights that are:
- Specific to Pakistan (not generic global advice)
- If the country is not pakistan than tell the impact of that on pakistan
- Data-driven (must reference patterns from XAI + aggregates)
- Concise but impactful
- Written in a professional policy-analysis tone(but easy to understand for anyone)

----------------------------------------
OUTPUT FORMAT (STRICT):
----------------------------------------

1. Prediction Insight & Key Drivers
(Provide a short heading that summarizes the prediction outcome and trend)

- Write 3 to 5 bullet points explaining:
  • Why emissions are high/low/changing
  • Which features contributed most (from XAI)
  • Any seasonal/monthly patterns
  • Any sector/subsector influence
  • Any notable trends from yearly data

2. Policy Recommendations for Pakistan
(Provide a strong heading focused on reducing emissions in Pakistan)

- Write 3 to 5 bullet points suggesting:
  • Practical and realistic policies for Pakistan
  • Sector-specific interventions (e.g., energy, transport, industry)
  • Government-level actions (regulation, incentives, infrastructure)
  • Must align with observed data trends (NOT generic suggestions)

----------------------------------------
IMPORTANT RULES:
----------------------------------------

- Do NOT start or end with any extra info
- Do NOT repeat raw data
- Do NOT explain what XAI is
- Do NOT be generic (avoid statements like "reduce emissions globally")
- ALWAYS tie insights to the provided data
- Focus on clarity, impact, and real-world applicability
- Keep each bullet point 1–2 lines max

----------------------------------------
TONE:
----------------------------------------

Professional, analytical, and policy-focused (like a government advisory report)
        Data:\n{model_input}'''
    )


def generate_groq_insights(model_input):
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return None

    payload = {
        "model": os.getenv("GROQ_MODEL", "llama-3.1-8b-instant"),
        "messages": [{"role": "user", "content": _build_prompt(model_input)}],
        "temperature": 0.3,
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    response = requests.post(GROQ_ENDPOINT, json=payload, headers=headers, timeout=25)
    response.raise_for_status()
    body = response.json()

    return (
        body.get("choices", [{}])[0]
        .get("message", {})
        .get("content", "")
        .strip()
    ) or None


def generate_gemini_insights(model_input):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None

    model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    endpoint = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{model_name}:generateContent?key={api_key}"
    )

    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": _build_prompt(model_input),
                    }
                ]
            }
        ]
    }

    response = requests.post(endpoint, json=payload, timeout=25)
    response.raise_for_status()
    body = response.json()

    candidates = body.get("candidates", [])
    if not candidates:
        return None

    parts = candidates[0].get("content", {}).get("parts", [])
    if not parts:
        return None

    return (parts[0].get("text") or "").strip() or None
