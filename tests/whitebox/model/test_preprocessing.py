import numpy as np

from api_utils.preprocessing import preprocess_input
from api_utils.utils import get_default_lat_lon, get_subsectors


def build_indexers():
    subsectors = get_subsectors("transportation")
    return {
        "iso3_country": {"PAK": 4},
        "sector": {"transportation": 3},
        "subsector": {name: index for index, name in enumerate(subsectors)},
        "gas": {"co2": 1, "nox": 2},
    }


def build_scaler():
    return {
        "means": np.array([0.0, 0.0, 0.0, 0.0]),
        "stds": np.array([1.0, 1.0, 1.0, 1.0]),
    }


def test_preprocess_input_builds_yearly_sequences_for_each_subsector():
    results = preprocess_input(
        {
            "country": "PAK",
            "sector": "transportation",
            "gas": "co2",
            "year": 2025,
            "lat": 33.7,
            "lon": 73.1,
        },
        build_scaler(),
        build_indexers(),
    )

    subsectors = get_subsectors("transportation")

    assert set(results.keys()) == set(subsectors)
    assert results[subsectors[0]].shape == (12, 10)


def test_preprocess_input_uses_default_coordinates_when_missing():
    results = preprocess_input(
        {
            "country": "PAK",
            "sector": "transportation",
            "gas": "co2",
            "year": 2025,
            "lat": None,
            "lon": None,
        },
        build_scaler(),
        build_indexers(),
    )

    first_subsector = get_subsectors("transportation")[0]
    first_timestep = results[first_subsector][0]
    expected_lat, expected_lon = get_default_lat_lon("PAK")

    assert first_timestep[4] == expected_lat
    assert first_timestep[5] == expected_lon


def test_preprocess_input_returns_empty_result_for_unknown_sector():
    results = preprocess_input(
        {
            "country": "PAK",
            "sector": "unknown-sector",
            "gas": "co2",
            "year": 2025,
            "lat": 10.0,
            "lon": 20.0,
        },
        build_scaler(),
        build_indexers(),
    )

    assert results == {}
