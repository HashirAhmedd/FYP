import requests
import pandas as pd
import json

# === CONFIGURATION ===
BASE_URL = "http://127.0.0.1:8000"
HEADERS = {"Content-Type": "application/json"}

# Common Test Case
TEST_COUNTRY = "PAK"
TEST_SECTOR = "transportation"
TEST_YEAR = 2026
TEST_GAS = "co2"  # Used for single prediction/explanation

def print_header(title):
    print("\n" + "#" * 60)
    print(f"   {title}")
    print("#" * 60)

def test_prediction():
    """TEST 1: Standard Prediction Endpoint"""
    endpoint = f"{BASE_URL}/prediction"
    payload = {
        "country": TEST_COUNTRY,
        "sector": TEST_SECTOR,
        "gas": TEST_GAS,
        "year": TEST_YEAR
    }
    
    print_header(f"1. TESTING PREDICTION ROUTE ({TEST_GAS.upper()})")
    try:
        response = requests.post(endpoint, json=payload, headers=HEADERS)
        response.raise_for_status()
        res_json = response.json()
        
        if res_json.get("success"):
            data = res_json.get("data", {})
            total = data.get("total_emissions", 0)
            monthly = data.get("monthly_emissions", [])
            
            print(f"✅ Success! Prediction received.")
            print(f"📍 Context: {TEST_COUNTRY} | {TEST_SECTOR} | {TEST_YEAR}")
            print(f"📉 Total Emissions: {total:,.2f}")
            print(f"📅 Monthly Pattern (First 3 months): {[round(x, 2) for x in monthly[:3]]}...")
        else:
            print(f"❌ API Error: {res_json.get('error')}")

    except Exception as e:
        print(f"❌ Request Failed: {e}")

def test_explanation():
    """TEST 2: XAI / Explanation Endpoint"""
    endpoint = f"{BASE_URL}/explanation"
    payload = {
        "country": TEST_COUNTRY,
        "sector": TEST_SECTOR,
        "gas": TEST_GAS,
        "year": TEST_YEAR
    }

    print_header("2. TESTING EXPLANATION ROUTE (XAI)")
    try:
        response = requests.post(endpoint, json=payload, headers=HEADERS)
        response.raise_for_status()
        res_json = response.json()

        if res_json.get("success"):
            data = res_json.get("data", {})
            
            # 1. Numerical Attributions (Year, Lat, Lon, etc.)
            num_attr = data.get("overall_numerical_attribution", {})
            print("✅ Success! Feature Importance received.\n")
            
            print("--- Numerical Feature Importance ---")
            if num_attr:
                df_num = pd.DataFrame(list(num_attr.items()), columns=["Feature", "Importance"])
                df_num["Importance"] = df_num["Importance"].apply(lambda x: f"{x:.4f}")
                print(df_num.to_string(index=False))
            else:
                print("No numerical attribution data returned.")

            # 2. Categorical Attributions (Just a summary to avoid massive output)
            cat_attr = data.get("overall_categorical_attribution", {})
            print(f"\n--- Categorical Feature Importance ---")
            print(f"Received attribution data for {len(cat_attr)} subsectors.")
            if cat_attr:
                first_subsector = list(cat_attr.keys())[0]
                print(f"Example ({first_subsector}): {cat_attr[first_subsector]}")

        else:
            print(f"❌ API Error: {res_json.get('error')}")

    except Exception as e:
        print(f"❌ Request Failed: {e}")

def test_gas_ratios():
    """TEST 3: Gas Ratios Endpoint"""
    endpoint = f"{BASE_URL}/gas-ratios"
    # Note: 'gas' is not needed in payload, loop happens on server
    payload = {
        "country": TEST_COUNTRY,
        "sector": TEST_SECTOR,
        "year": TEST_YEAR
    }

    print_header("3. TESTING GAS RATIOS ROUTE")
    try:
        response = requests.post(endpoint, json=payload, headers=HEADERS)
        response.raise_for_status()
        res_json = response.json()

        if res_json.get("success"):
            data = res_json.get("data", {})
            ratios = data.get("ratios", {})
            absolutes = data.get("absolute_emissions", {})
            grand_total = data.get("grand_total", 0)

            # Format Table
            table_data = []
            # Dynamically get keys to match server response (co2 vs CO2)
            available_gases = sorted(ratios.keys())
            
            for gas in available_gases:
                ratio_val = ratios.get(gas, 0)
                emission_val = absolutes.get(gas, 0)
                table_data.append({
                    "Gas": gas.upper(),
                    "Ratio": f"{ratio_val:.4f}",
                    "Percentage": f"{ratio_val:.2%}",
                    "Total Emission": f"{emission_val:,.2f}"
                })

            df = pd.DataFrame(table_data)
            print("✅ Success! Ratios calculated.\n")
            print(df.to_string(index=False))
            print("-" * 40)
            print(f"GRAND TOTAL:      {grand_total:,.2f}")
        else:
            print(f"❌ API Error: {res_json.get('error')}")

    except Exception as e:
        print(f"❌ Request Failed: {e}")

if __name__ == "__main__":
    try:
        # Check if server is up first
        requests.get(f"{BASE_URL}/")
        
        # Run Tests
        test_prediction()
        test_explanation()
        test_gas_ratios()
        
        print("\n" + "="*60)
        print("🎉 ALL TESTS COMPLETED")
        print("="*60)
        
    except requests.exceptions.ConnectionError:
        print(f"\n❌ CRITICAL ERROR: Could not connect to {BASE_URL}")
        print("Please ensure 'python app.py' is running in a separate terminal.")