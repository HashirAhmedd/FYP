import numpy as np
from api_utils.preprocessing import preprocess_input
from api_utils.xai.numerical_yearly_ig import calculate_numerical_ig_breakdown
from api_utils.xai.categorical_yearly_ig import calculate_categorical_ig_breakdown


def run_explainable_inference(user_input, model, scaler_model, indexers):
    preprocessed_data = preprocess_input(user_input, scaler_model, indexers)

    numerical_monthly_igs = []
    numerical_yearly_igs = []
    categorical_monthly_igs = []
    categorical_yearly_igs = {}

    response = {}

    for subsector, sequence in preprocessed_data.items():
        sequence = np.expand_dims(sequence, axis=0)  # Shape: (1, 12, features)

        # input_seq shape: (1, 12, 10)
        cat_input = sequence[:, :, :4]      # First 4 are categorical
        num_input = sequence[:, :, 4:]      # Remaining 6 are numerical

        # === XAI for numerical features ===
        monthly_ig, yearly_ig = calculate_numerical_ig_breakdown(model, num_input, cat_input)
        numerical_monthly_igs.append(monthly_ig)
        numerical_yearly_igs.append(yearly_ig) 

        # === XAI for categorical features ===
        monthly_cat_ig, yearly_cat_ig = calculate_categorical_ig_breakdown(model, cat_input, num_input)
        categorical_monthly_igs.append(monthly_cat_ig)
        categorical_yearly_igs[subsector] = yearly_cat_ig

    overall_num_monthly_ig = sum(numerical_monthly_igs)
    overall_num_monthly_normalized = overall_num_monthly_ig.div(
        overall_num_monthly_ig.sum(axis=1).replace(0, 1),
        axis=0
    )

    overall_num_yearly_ig = sum(numerical_yearly_igs)  # Aggregate across subsectors
    overall_num_yearly_normalized = overall_num_yearly_ig / max(overall_num_yearly_ig.sum(), 1e-12)

    overall_cat_monthly_ig = {}
    for month in range(1, 13):
        month_values = {}
        for month_by_feature in categorical_monthly_igs:
            for feature, value in month_by_feature[month].items():
                month_values[feature] = month_values.get(feature, 0.0) + float(value)
        overall_cat_monthly_ig[str(month)] = month_values

    overall_cat_yearly_ig = {}
    if overall_cat_monthly_ig:
        feature_names = next(iter(overall_cat_monthly_ig.values())).keys()
        for feature in feature_names:
            yearly_value = np.mean([overall_cat_monthly_ig[str(month)][feature] for month in range(1, 13)])
            overall_cat_yearly_ig[feature] = float(yearly_value)

    response["overall_numerical_attribution"] = {
        "monthly": {
            str(month): {feature: float(value) for feature, value in row.items()}
            for month, row in overall_num_monthly_normalized.iterrows()
        },
        "yearly": {feature: float(value) for feature, value in overall_num_yearly_normalized.to_dict().items()}
    }

    response["overall_categorical_attribution"] = {
        "monthly": overall_cat_monthly_ig,
        "yearly": overall_cat_yearly_ig,
        "by_subsector_yearly": categorical_yearly_igs
    }

    return response