import numpy as np
from api_utils.utils import get_month_duration, get_default_lat_lon, get_subsectors

def preprocess_input(user_input, scaler_model, indexers):
    country = user_input.get('country')
    sector = user_input.get('sector')
    gas = user_input.get('gas')
    year = user_input.get('year')
    lat = user_input.get('lat')
    lon = user_input.get('lon')

    if lat is None or lon is None:
        lat, lon = get_default_lat_lon(country)

    subsectors = get_subsectors(sector)

    results = {}

    # These encoded and scaled values are constant for every subsector/month in one request.
    iso3_country_index = indexers["iso3_country"].get(country, -1)
    sector_index = indexers["sector"].get(sector, -1)
    gas_index = indexers["gas"].get(gas, -1)

    base_features = np.array([[lat, lon, 0.0, year]], dtype=np.float64)
    means = scaler_model["means"]
    stds = scaler_model["stds"]


    for subsector in subsectors:
        subsector_index = indexers["subsector"].get(subsector, -1)
        sequence = []
        for month in range(1, 13):
            duration = get_month_duration(year, month)
            month_sin = np.sin(2 * np.pi * month / 12)
            month_cos = np.cos(2 * np.pi * month / 12)

            # Scale continuous features
            base_features[0, 2] = duration
            scaled_features = (base_features - means) / stds

            # Combine all features
            timestep = [
                iso3_country_index,
                sector_index,
                subsector_index,
                gas_index,
                *scaled_features[0],
                month_sin,
                month_cos
            ]

            sequence.append(timestep)
        results[subsector] = np.array(sequence)
        
    return results