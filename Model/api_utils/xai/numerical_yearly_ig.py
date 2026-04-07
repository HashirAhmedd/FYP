import numpy as np
import pandas as pd
from api_utils.xai.numerical_ig import compute_integrated_gradients_num_only


FEATURE_NAMES = ["lat", "lon", "duration", "start_year", "start_month_sin", "start_month_cos"]


def calculate_numerical_ig_breakdown(model, num_input, cat_input):
    baseline_num = np.zeros_like(num_input)

    ig_numerical = compute_integrated_gradients_num_only(
        model=model,
        cat_input=cat_input,
        num_input=num_input,
        baseline_num=baseline_num
    )

    ig_num = ig_numerical[0]  # Remove batch dimension

    monthly_df = pd.DataFrame(
        ig_num,
        columns=FEATURE_NAMES,
        index=range(1, 13)
    )

    monthly_abs_df = monthly_df.abs()
    yearly_ig = monthly_abs_df.sum(axis=0)

    return monthly_abs_df, yearly_ig

def calculate_yearly_numerical_ig(model, num_input, cat_input):
    _, yearly_ig = calculate_numerical_ig_breakdown(model, num_input, cat_input)
    return yearly_ig