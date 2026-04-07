import numpy as np
from api_utils.preprocessing import preprocess_input

def run_inference(user_input, model, scaler_model, indexers):
    preprocessed_data = preprocess_input(user_input, scaler_model, indexers)

    if not preprocessed_data:
        return {
            "subsector_emissions": {},
            "monthly_emissions": [0.0] * 12,
            "total_emissions": 0.0,
        }

    response = {
        "subsector_emissions": {},
        "monthly_emissions": [0.0] * 12,
        "total_emissions": 0.0
    }

    subsectors = list(preprocessed_data.keys())
    stacked_sequences = np.stack([preprocessed_data[subsector] for subsector in subsectors], axis=0)

    cat_input = stacked_sequences[:, :, :4]      # First 4 are categorical
    num_input = stacked_sequences[:, :, 4:]      # Remaining 6 are numerical

    predictions = model.predict([cat_input, num_input], verbose=0)

    for idx, subsector in enumerate(subsectors):
        emissions = np.expm1(predictions[idx]).tolist()  # Inverse of log1p

        total = sum(emissions)
        response["subsector_emissions"][subsector] = {
            "monthly_emissions": emissions,
            "total_emissions": total
        }

        # Aggregate monthly emissions
        response["monthly_emissions"] = [sum(x) for x in zip(response["monthly_emissions"], emissions)]
        response["total_emissions"] += total

    return response