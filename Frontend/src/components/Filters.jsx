import { useState } from "react";

export default function Filters({fetchHistoricalData}) {
  // Region data in full form
  const regions = {
    Pakistan: "PAK",
    India: "IND",
    Bangladesh: "BGD",
    Afghanistan: "AFG",
    "Sri Lanka": "LKA",
    Bhutan: "BTN",
    Nepal: "NPL",
    Maldives: "MDV",
  };

  const sectors = [
    "transportation",
    "manufacturing",
    "agriculture",
    "forestry-and-land-use",
    "mineral-extraction",
    "fossil-fuel-operations",
    "buildings",
    "power",
    "waste",
  ];

  const emissionTypes = ["CO₂", "CH₄", "N₂O"];

  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;
  const startYear = 2015;

  const yearOptions = [];
  for (let year = startYear; year <= previousYear; year++) {
    yearOptions.push(year);
  }

  // State for selected values
  const [selectedRegion, setSelectedRegion] = useState("Pakistan");
  const [selectedSector, setSelectedSector] = useState("Transportation");
  const [selectedEmissionType, setSelectedEmissionType] = useState("CO₂");
  const [startYearRange, setStartYearRange] = useState(2020);
  const [endYearRange, setEndYearRange] = useState(previousYear);

  // Format sector name for display
  const formatSectorName = (key) => {
    return key
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleFilterValues = async () => {
    const filtersObject = {
      country: (regions[selectedRegion]),
      sector_name: selectedSector,
      gas_name: selectedEmissionType
        .toLowerCase()
        .replace("₂", "2")
        .replace("₄", "4"),
      start_year: startYearRange,
      end_year: endYearRange,
    };
    fetchHistoricalData(filtersObject)
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 container mx-auto">
      {/* Header */}
      <h2 className="text-xl font-bold text-gray-900 mb-6">Filters</h2>

      {/* Filter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Region Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-600">
            Region
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-10 text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(regions).map(([countryName, code]) => (
                <option key={code} value={countryName}>
                  {countryName}
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

        {/* Sector Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-600">
            Sector
          </label>
          <div className="relative">
            <select
              value={selectedSector}
              onChange={(e) => {
                setSelectedSector(e.target.value);
              }}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-4 pr-10 text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {sectors.map((sector) => (
                <option key={sector} value={sector}>
                  {formatSectorName(sector)}
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

        {/* Emission Type Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-600">
            Emission Type
          </label>
          <div className="relative">
            <select
              value={selectedEmissionType}
              onChange={(e) => setSelectedEmissionType(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-4 pr-10 text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {emissionTypes.map((gas) => (
                <option key={gas} value={gas}>
                  {gas}
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

        {/* Start Year Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-600">
            Start Year
          </label>
          <div className="relative">
            <select
              value={startYearRange}
              onChange={(e) => setStartYearRange(Number(e.target.value))}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-4 pr-10 text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {yearOptions.map((year) => (
                <option key={`start-${year}`} value={year}>
                  {year}
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
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* End Year Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-600">
            End Year
          </label>
          <div className="relative">
            <select
              value={endYearRange}
              onChange={(e) => setEndYearRange(Number(e.target.value))}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-4 pr-10 text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {yearOptions
                .filter((year) => year >= startYearRange)
                .map((year) => (
                  <option key={`end-${year}`} value={year}>
                    {year}
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
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Summary of selected filters */}
      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <p className="text-sm text-gray-700">
          <span className="font-medium">Selected:</span> {selectedRegion} •{" "}
          {selectedSector === "All Sectors"
            ? "All Sectors"
            : formatSectorName(selectedSector)}{" "}
          • {selectedEmissionType} • {startYearRange}-{endYearRange}
        </p>
      </div>

      {/* Print Filters Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleFilterValues}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-sm cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            <span>Update Data</span>
          </div>
        </button>
      </div>
    </div>
  );
}
