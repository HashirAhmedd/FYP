import { useState, useEffect } from "react";
import { apiFetch } from "../utils/api";

const UserHistory = ({ userEmail }) => {
  const [historyData, setHistoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [sectorFilter, setSectorFilter] = useState("All sector");
  const [gasFilter, setGasFilter] = useState("All gases");
  const [showSectorDropdown, setShowSectorDropdown] = useState(false);
  const [showGasDropdown, setShowGasDropdown] = useState(false);

  const [summaryCards, setSummaryCards] = useState([
    { label: "Total Analysis", value: "0" },
    { label: "This Month", value: "0" },
    { label: "This Week", value: "0" },
    { label: "Most Used Sector", value: "-" },
  ]);

  // Filter options
  const sectorOptions = [
    "All sector",
    "Transportation",
    "Energy",
    "Agriculture",
  ];
  const gasOptions = ["CO2", "CH4", "NO2", "All gases"];

  useEffect(() => {
    fetchHistoryData();
  }, []);

  // Apply filters whenever filter state or history data changes
  useEffect(() => {
    applyFilters();
  }, [sectorFilter, gasFilter, historyData]);

  // Apply filters to data
  const applyFilters = () => {
    let filtered = [...historyData];

    // Apply sector filter
    if (sectorFilter !== "All sector") {
      filtered = filtered.filter(
        (item) => item.sector.toLowerCase() === sectorFilter.toLowerCase(),
      );
    }

    // Apply gas filter
    if (gasFilter !== "All gases") {
      filtered = filtered.filter(
        (item) => item.emission.toLowerCase() === gasFilter.toLowerCase(),
      );
    }

    setFilteredData(filtered);
  };

  const fetchHistoryData = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(`/api/v1/user/history/${userEmail}`);

      if (!response.ok) {
        throw new Error("Failed to fetch history data");
      }

      const data = await response.json();

      if (data.status === "success" && Array.isArray(data.history)) {
        setHistoryData(data.history);
        calculateSummaryStats(data.history);
      } else {
        throw new Error("Invalid data format received");
      }

      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching history:", err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary statistics from history data
  const calculateSummaryStats = (history) => {
    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate(),
    );
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Count this month and this week
    const thisMonthCount = history.filter(
      (item) => new Date(item.timestamp) >= oneMonthAgo,
    ).length;
    const thisWeekCount = history.filter(
      (item) => new Date(item.timestamp) >= oneWeekAgo,
    ).length;

    // Find most used sector
    const sectorCounts = {};
    history.forEach((item) => {
      sectorCounts[item.sector] = (sectorCounts[item.sector] || 0) + 1;
    });

    let mostUsedSector = "-";
    let maxCount = 0;
    Object.entries(sectorCounts).forEach(([sector, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostUsedSector = sector;
      }
    });

    setSummaryCards([
      { label: "Total Analysis", value: history.length.toString() },
      { label: "This Month", value: thisMonthCount.toString() },
      { label: "This Week", value: thisWeekCount.toString() },
      { label: "Most Used Sector", value: mostUsedSector },
    ]);
  };

  // Format timestamp to readable format
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date
      .toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(",", "");
  };

  // Handle click outside dropdowns
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSectorDropdown(false);
      setShowGasDropdown(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div
      className="min-h-screen bg-white p-8 font-sans"
      style={{ fontFamily: "Inter, Roboto, sans-serif" }}
    >
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1F1F1F] mb-2">User History</h1>
        <p className="text-[#6B6B6B] text-base">
          View and reload previous forecast analysis
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#F7F7F9] rounded-xl p-6 mb-8">
        <div className="grid grid-cols-2 gap-6">
          {/* Sector Filter */}
          <div className="flex flex-col space-y-2 relative">
            <label className="text-sm text-[#6B6B6B] font-medium">Sector</label>
            <div
              className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-[#E5E7EB] cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setShowSectorDropdown(!showSectorDropdown);
                setShowGasDropdown(false);
              }}
            >
              <span className="text-[#1F1F1F] text-sm">{sectorFilter}</span>
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
            {showSectorDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E5E7EB] rounded-lg shadow-lg z-10">
                {sectorOptions.map((option) => (
                  <div
                    key={option}
                    className="px-4 py-2 hover:bg-[#F7F7F9] cursor-pointer text-sm text-[#1F1F1F]"
                    onClick={() => {
                      setSectorFilter(option);
                      setShowSectorDropdown(false);
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
            <label className="text-sm text-[#6B6B6B] font-medium">Gas</label>
            <div
              className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-[#E5E7EB] cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setShowGasDropdown(!showGasDropdown);
                setShowSectorDropdown(false);
              }}
            >
              <span className="text-[#1F1F1F] text-sm">{gasFilter}</span>
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
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E5E7EB] rounded-lg shadow-lg z-10">
                {gasOptions.map((option) => (
                  <div
                    key={option}
                    className="px-4 py-2 hover:bg-[#F7F7F9] cursor-pointer text-sm text-[#1F1F1F]"
                    onClick={() => {
                      setGasFilter(option);
                      setShowGasDropdown(false);
                    }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {(sectorFilter !== "All sector" || gasFilter !== "All gases") && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-[#6B6B6B]">Active filters:</span>
            <div className="flex gap-2">
              {sectorFilter !== "All sector" && (
                <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  Sector: {sectorFilter}
                  <button
                    className="ml-2 hover:text-green-900"
                    onClick={() => setSectorFilter("All sector")}
                  >
                    ×
                  </button>
                </span>
              )}
              {gasFilter !== "All gases" && (
                <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  Gas: {gasFilter}
                  <button
                    className="ml-2 hover:text-blue-900"
                    onClick={() => setGasFilter("All gases")}
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-[#F7F7F9] rounded-xl p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-[#1F1F1F]">
            Recent Analysis{" "}
            {filteredData.length > 0 && `(${filteredData.length})`}
          </h2>
          <button
            onClick={fetchHistoryData}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            Refresh Data
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-green-600"></div>
            <p className="mt-2 text-[#6B6B6B]">Loading history data...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600">Error: {error}</p>
            <button
              onClick={fetchHistoryData}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {filteredData.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[#6B6B6B]">No results match your filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E5E7EB]">
                      <th className="text-center py-4 text-sm font-medium text-[#6B6B6B]">
                        Timestamp
                      </th>
                      <th className="text-center py-4 text-sm font-medium text-[#6B6B6B]">
                        Sector
                      </th>
                      <th className="text-center py-4 text-sm font-medium text-[#6B6B6B]">
                        Gas
                      </th>
                      <th className="text-center py-4 text-sm font-medium text-[#6B6B6B]">
                        Year Range
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((row) => (
                      <tr
                        key={row._id}
                        className="border-b border-[#E5E7EB] last:border-0"
                      >
                        <td className="text-center py-4 text-sm text-[#1F1F1F]">
                          {formatTimestamp(row.timestamp)}
                        </td>
                        <td className="text-center py-4 text-sm text-[#1F1F1F]">
                          {row.sector}
                        </td>
                        <td className="text-center py-4">
                          <span className="inline-flex px-3 py-1 text-sm bg-white border border-[#E5E7EB] rounded-full text-[#1F1F1F]">
                            {row.emission}
                          </span>
                        </td>
                        <td className="text-center py-4 text-sm text-[#1F1F1F]">
                          {row.yearRange}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-6">
        {summaryCards.map((card, index) => (
          <div key={index} className="bg-[#F7F7F9] rounded-xl p-6">
            <p className="text-sm text-[#6B6B6B] mb-2">{card.label}</p>
            <p className="text-3xl font-bold text-[#1F1F1F]">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserHistory;
