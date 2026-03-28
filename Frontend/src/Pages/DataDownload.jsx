import { useState } from "react";
import { apiFetch } from "../utils/api";

const DataDownload = () => {
  const [loading, setLoading] = useState(false);
  const [downloadData, setDownloadData] = useState(null);
  const [error, setError] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    region: "All regions",
    gas: "All gases",
    startYear: "",
    endYear: "",
  });

  // Dropdown states
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [showGasDropdown, setShowGasDropdown] = useState(false);

  // Filter options
  const regionOptions = [
    "All regions",
    "PAK",
    "IND",
    "AFG",
    "BGD",
    "LKA",
    "NPL",
    "MDV",
    "BTN",
  ];
  const gasOptions = ["All gases", "co2", "ch4", "n2o"];

  // Year range options (2015-2024)
  const yearOptions = [];
  for (let year = 2015; year <= 2025; year++) {
    yearOptions.push(year.toString());
  }

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Validate year inputs
  const validateYears = () => {
    if (filters.startYear && filters.endYear) {
      if (parseInt(filters.startYear) > parseInt(filters.endYear)) {
        setError("Start year cannot be greater than end year");
        return false;
      }
    }
    setError(null);
    return true;
  };

  // Handle Get Data button click
  const handleGetData = async () => {
    if (!validateYears()) return;

    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      if (filters.region !== "All regions")
        params.append("region", filters.region.toLowerCase());
      if (filters.gas !== "All gases")
        params.append("gas", filters.gas.toLowerCase());
      if (filters.startYear) params.append("startYear", filters.startYear);
      if (filters.endYear) params.append("endYear", filters.endYear);

      console.log(params.toString());

      // Replace with your actual API endpoint
      const response = await apiFetch(
        `/api/v1/data/download?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();

      setDownloadData(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Download button click
  const handleDownload = (format) => {
    if (!downloadData || !downloadData.rows) return;

    let content, filename, type;
    const rows = downloadData.rows;
    const columns = downloadData.columns;

    switch (format) {
      case "csv":
        // Convert to CSV
        const csvHeaders = columns;
        const csvRows = rows.map((item) =>
          columns.map((col) => item[col] || "N/A"),
        );
        content = [csvHeaders, ...csvRows]
          .map((row) => row.join(","))
          .join("\n");
        filename = `emissions-data-${filters.region}-${filters.gas}-${filters.startYear}-${filters.endYear}.csv`;
        type = "text/csv";
        break;

      case "json":
        content = JSON.stringify(downloadData, null, 2);
        filename = `emissions-data-${filters.region}-${filters.gas}-${filters.startYear}-${filters.endYear}.json`;
        type = "application/json";
        break;

      case "excel":
        // For Excel, we'll create a CSV with .xls extension (simplified)
        const excelHeaders = columns;
        const excelRows = rows.map((item) =>
          columns.map((col) => item[col] || "N/A"),
        );
        content = [excelHeaders, ...excelRows]
          .map((row) => row.join("\t"))
          .join("\n");
        filename = `emissions-data-${filters.region}-${filters.gas}-${filters.startYear}-${filters.endYear}.xls`;
        type = "application/vnd.ms-excel";
        break;

      default:
        return;
    }

    // Create download link
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Format number for display
  const formatNumber = (num) => {
    if (num === null || num === undefined) return "N/A";
    if (typeof num === "number") {
      return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
    }
    return num;
  };

  return (
    <div
      className="min-h-screen bg-white p-8 font-sans"
      style={{ fontFamily: "Inter, Roboto, sans-serif" }}
    >
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1F1F1F] mb-2">
          Data Download
        </h1>
        <p className="text-[#6B6B6B] text-base">Download emission data</p>
      </div>

      {/* Filters Section */}
      <div className="bg-[#F7F7F9] rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-[#1F1F1F] mb-4">
          Select Filters
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Region Filter */}
          <div className="flex flex-col space-y-2 relative">
            <label className="text-sm text-[#6B6B6B] font-medium">Region</label>
            <div
              className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-[#E5E7EB] cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setShowRegionDropdown(!showRegionDropdown);
                setShowGasDropdown(false);
              }}
            >
              <span className="text-[#1F1F1F] text-sm">{filters.region}</span>
              <svg
                className="w-4 h-4 text-[#6B6B6B]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
            {showRegionDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E5E7EB] rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                {regionOptions.map((option) => (
                  <div
                    key={option}
                    className="px-4 py-2 hover:bg-[#F7F7F9] cursor-pointer text-sm text-[#1F1F1F]"
                    onClick={() => {
                      handleFilterChange("region", option);
                      setShowRegionDropdown(false);
                    }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Gas Filter */}
          <div className="flex flex-col space-y-2 relative">
            <label className="text-sm text-[#6B6B6B] font-medium">
              Emission Type (Gas)
            </label>
            <div
              className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-[#E5E7EB] cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setShowGasDropdown(!showGasDropdown);
                setShowRegionDropdown(false);
              }}
            >
              <span className="text-[#1F1F1F] text-sm">{filters.gas}</span>
              <svg
                className="w-4 h-4 text-[#6B6B6B]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
            {showGasDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E5E7EB] rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                {gasOptions.map((option) => (
                  <div
                    key={option}
                    className="px-4 py-2 hover:bg-[#F7F7F9] cursor-pointer text-sm text-[#1F1F1F]"
                    onClick={() => {
                      handleFilterChange("gas", option);
                      setShowGasDropdown(false);
                    }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Start Year */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-[#6B6B6B] font-medium">
              Start Year
            </label>
            <select
              value={filters.startYear}
              onChange={(e) => handleFilterChange("startYear", e.target.value)}
              className="bg-white rounded-lg px-4 py-3 border border-[#E5E7EB] text-[#1F1F1F] text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select start year</option>
              {yearOptions.map((year) => (
                <option key={`start-${year}`} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* End Year */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-[#6B6B6B] font-medium">
              End Year
            </label>
            <select
              value={filters.endYear}
              onChange={(e) => handleFilterChange("endYear", e.target.value)}
              className="bg-white rounded-lg px-4 py-3 border border-[#E5E7EB] text-[#1F1F1F] text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select end year</option>
              {yearOptions.map((year) => (
                <option key={`end-${year}`} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Get Data Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleGetData}
            disabled={loading}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:bg-green-300 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Fetching Data...</span>
              </>
            ) : (
              <span>Get Data</span>
            )}
          </button>
        </div>

        {/* Active Filters Display */}
        {(filters.region !== "All regions" ||
          filters.gas !== "All gases" ||
          filters.startYear ||
          filters.endYear) && (
          <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-[#6B6B6B]">Active filters:</span>
              {filters.region !== "All regions" && (
                <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  Region: {filters.region}
                  <button
                    className="ml-2 hover:text-green-900"
                    onClick={() => handleFilterChange("region", "All regions")}
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.gas !== "All gases" && (
                <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  Gas: {filters.gas}
                  <button
                    className="ml-2 hover:text-blue-900"
                    onClick={() => handleFilterChange("gas", "All gases")}
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.startYear && (
                <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                  From: {filters.startYear}
                  <button
                    className="ml-2 hover:text-purple-900"
                    onClick={() => handleFilterChange("startYear", "")}
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.endYear && (
                <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                  To: {filters.endYear}
                  <button
                    className="ml-2 hover:text-purple-900"
                    onClick={() => handleFilterChange("endYear", "")}
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
          <p className="text-red-600">Error: {error}</p>
        </div>
      )}

      {downloadData && !loading && (
        <div className="bg-[#F7F7F9] rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-[#1F1F1F]">
                Data Preview ({downloadData.rowCount || 0} records)
              </h2>
              {downloadData.filters && (
                <p className="text-sm text-[#6B6B6B] mt-1">
                  Showing data for {downloadData.filters.region},{" "}
                  {downloadData.filters.gas} ({downloadData.filters.startYear} -{" "}
                  {downloadData.filters.endYear})
                </p>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => handleDownload("csv")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Download CSV
              </button>
              <button
                onClick={() => handleDownload("json")}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Download JSON
              </button>
              <button
                onClick={() => handleDownload("excel")}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                Download Excel
              </button>
            </div>
          </div>

          {/* Data Preview Table */}
          {downloadData.rows && downloadData.rows.length > 0 ? (
            <div className="overflow-x-auto bg-white rounded-lg border border-[#E5E7EB]">
              <table className="w-full">
                <thead className="bg-[#F7F7F9]">
                  <tr className="border-b border-[#E5E7EB]">
                    {downloadData.columns.map((column, index) => (
                      <th
                        key={index}
                        className="text-left py-3 px-4 text-sm font-medium text-[#6B6B6B] capitalize"
                      >
                        {column.replace(/_/g, " ")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {downloadData.rows.slice(0, 10).map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#F7F7F9]"
                    >
                      {downloadData.columns.map((column, colIndex) => (
                        <td
                          key={colIndex}
                          className="py-3 px-4 text-sm text-[#1F1F1F]"
                        >
                          {column === "emission_value"
                            ? formatNumber(item[column])
                            : item[column]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {downloadData.rows.length > 10 && (
                <div className="p-4 text-center text-sm text-[#6B6B6B] border-t border-[#E5E7EB]">
                  Showing first 10 of {downloadData.rows.length} records
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-lg border border-[#E5E7EB]">
              <p className="text-[#6B6B6B]">
                No data available for the selected filters
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DataDownload;
