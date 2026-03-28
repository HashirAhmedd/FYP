import { useState } from "react";

export default function ForecastsConfiguration({fetchPrediction}) {
  // Updated regions - using country names as keys and codes as values
  const regions = [
    { value: "PAK", label: "Pakistan" },
    { value: "IND", label: "India" },
    { value: "BGD", label: "Bangladesh" },
    { value: "AFG", label: "Afghanistan" },
    { value: "LKA", label: "Sri Lanka" },
    { value: "BTN", label: "Bhutan" },
    { value: "NPL", label: "Nepal" },
    { value: "MDV", label: "Maldives" },
  ];

  // Updated sectors
  const sectors = [
    { value: "transportation", label: "Transportation" },
    { value: "manufacturing", label: "Manufacturing" },
    { value: "agriculture", label: "Agriculture" },
    { value: "forestry-and-land-use", label: "Forestry and Land Use" },
    { value: "mineral-extraction", label: "Mineral Extraction" },
    { value: "fossil-fuel-operations", label: "Fossil Fuel Operations" },
    { value: "buildings", label: "Buildings" },
    { value: "power", label: "Power" },
    { value: "waste", label: "Waste" },
  ];

  const emissionTypes = [
    { value: "co2", label: "CO₂" },
    { value: "ch4", label: "CH₄" },
    { value: "n2o", label: "N₂O" },
  ];

  // Generate time options: current year to current year + 30
  const getTimeOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];

    for (let i = 0; i <= 30; i++) {
      const year = currentYear + i;
      years.push({
        value: year.toString(),
        label: year.toString(),
      });
    }

    return years;
  };

  const timeOptions = getTimeOptions();

  // State to track selected values
  const [selectedValues, setSelectedValues] = useState({
    region: "PAK",
    sector: "transportation",
    emissionType: "co2",
    forecastYear: new Date().getFullYear().toString(),
  });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const forecastConfiguration = {
      country: selectedValues.region,
      sector: selectedValues.sector,
      gas: selectedValues.emissionType,
      year: selectedValues.forecastYear,
      month: 1,
    };

    fetchPrediction(forecastConfiguration)

  };

  return (
    <div className="space-y-6">
      {/* Page Headers */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          AI - Powered Predictions
        </h1>
        <p className="text-gray-600 mt-2">
          Generate forecasts and explore scenario analysis
        </p>
      </div>

      {/* Configuration Card */}
      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Forecasts Configuration
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Configuration Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Region Select */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-600">
                Region
              </label>
              <div className="relative">
                <select
                  name="region"
                  value={selectedValues.region}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-300 rounded-lg py-3 pl-4 pr-10 text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                >
                  {regions.map((region) => (
                    <option key={region.value} value={region.value}>
                      {region.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Sector Select */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-600">
                Sector
              </label>
              <div className="relative">
                <select
                  name="sector"
                  value={selectedValues.sector}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-300 rounded-lg py-3 pl-4 pr-10 text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                >
                  {sectors.map((sector) => (
                    <option key={sector.value} value={sector.value}>
                      {sector.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Emission Type Select */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-600">
                Emission Type
              </label>
              <div className="relative">
                <select
                  name="emissionType"
                  value={selectedValues.emissionType}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-300 rounded-lg py-3 pl-4 pr-10 text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                >
                  {emissionTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Time Range Select */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-600">
                Forecast Year
              </label>
              <div className="relative">
                <select
                  name="forecastYear"
                  value={selectedValues.forecastYear}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-300 rounded-lg py-3 pl-4 pr-10 text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                >
                  {timeOptions.map((year) => (
                    <option key={year.value} value={year.value}>
                      {year.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="inline-flex items-center justify-center px-8 py-4 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 cursor-pointer"
            >
              <svg
                className="w-5 h-5 mr-3"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Generate forecasts
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
