import json

from api_utils.llm.cache import XAILLMInsightCache
from api_utils.llm.providers import generate_gemini_insights, generate_groq_insights


_CACHE = XAILLMInsightCache()


def _normalize_request(user_input):
    return {
        "country": str(user_input.get("country", "")).strip().lower(),
        "sector": str(user_input.get("sector", "")).strip().lower(),
        "gas": str(user_input.get("gas", "")).strip().lower(),
        "year": int(user_input.get("year", 0)),
    }


def _build_model_input(prediction_data, explanation_data):
    return json.dumps(
        {
            "prediction": prediction_data,
            "explainability": explanation_data,
        },
        sort_keys=True,
        default=str,
    )


def _is_valid_cached_doc(cached_doc, normalized_params):
    if not cached_doc or not cached_doc.get("insight_text"):
        return False

    cached_params = cached_doc.get("normalized_params")
    if not isinstance(cached_params, dict):
        return False

    required_keys = {"country", "sector", "gas", "year"}
    if set(cached_params.keys()) != required_keys:
        return False

    for key in required_keys:
        if cached_params.get(key) != normalized_params.get(key):
            return False

    return True


def generate_or_get_xai_llm_insights(user_input, prediction_data, explanation_data):
    normalized_params = _normalize_request(user_input)

    cached_by_params = _CACHE.get_by_normalized_params(normalized_params)
    if _is_valid_cached_doc(cached_by_params, normalized_params):
        return {
            "insight_text": cached_by_params.get("insight_text"),
            "provider_used": cached_by_params.get("provider_used"),
            "from_cache": True,
        }

    model_input = _build_model_input(prediction_data, explanation_data)
    cache_payload = {
        "params": normalized_params,
        "model_input": model_input,
    }
    cache_key = _CACHE.build_cache_key(cache_payload)

    insight_text = None
    provider_used = None

    try:
        insight_text = generate_gemini_insights(model_input)
        if insight_text:
            provider_used = "gemini"
    except Exception as gemini_error:
        print("Gemini insights error:", gemini_error)
        insight_text = None

    if not insight_text:
        try:
            insight_text = generate_groq_insights(model_input)
            if insight_text:
                provider_used = "groq"
        except Exception as groq_error:
            print("Groq insights error:", groq_error)
            insight_text = None

    if insight_text and provider_used:
        _CACHE.save(
            cache_key=cache_key,
            normalized_params=normalized_params,
            insight_text=insight_text,
            provider_used=provider_used,
        )

    return {
        "insight_text": insight_text,
        "provider_used": provider_used,
        "from_cache": False,
    }
