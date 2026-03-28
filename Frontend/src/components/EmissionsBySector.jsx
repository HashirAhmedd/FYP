export default function EmissionsBySector({ historicalData }) {
  // Get subsectors data from API response
  const getSubsectorsData = () => {
    // Check if data is in the new format
    const data = historicalData?.data || historicalData;

    if (!data?.subsector_breakdown) {
      return [];
    }

    // Color palette for different subsectors
    const colorPalette = [
      {
        text: "text-red-700",
        bg: "bg-red-50",
        primary: "text-red-700",
        bar: "#ef4444",
      },
      {
        text: "text-blue-700",
        bg: "bg-blue-50",
        primary: "text-blue-700",
        bar: "#3b82f6",
      },
      {
        text: "text-amber-700",
        bg: "bg-amber-50",
        primary: "text-amber-700",
        bar: "#f59e0b",
      },
      {
        text: "text-green-700",
        bg: "bg-green-50",
        primary: "text-green-700",
        bar: "#10b981",
      },
      {
        text: "text-purple-700",
        bg: "bg-purple-50",
        primary: "text-purple-700",
        bar: "#8b5cf6",
      },
      {
        text: "text-pink-700",
        bg: "bg-pink-50",
        primary: "text-pink-700",
        bar: "#ec4899",
      },
      {
        text: "text-indigo-700",
        bg: "bg-indigo-50",
        primary: "text-indigo-700",
        bar: "#6366f1",
      },
      {
        text: "text-teal-700",
        bg: "bg-teal-50",
        primary: "text-teal-700",
        bar: "#14b8a6",
      },
      {
        text: "text-orange-700",
        bg: "bg-orange-50",
        primary: "text-orange-700",
        bar: "#f97316",
      },
    ];

    // Format subsector names for display
    const formatSubsectorName = (subsector) => {
      return subsector
        .replace(/-/g, " ")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    };

    // Format emission value
    const formatEmissionValue = (value) => {
      if (value >= 1000000) {
        return (value / 1000000).toFixed(2) + "M tons";
      } else if (value >= 1000) {
        return (value / 1000).toFixed(2) + "K tons";
      } else {
        return value.toFixed(2) + " tons";
      }
    };

    // Get gas unit
    const getGasUnit = () => {
      const gas = data?.gas_name || "co2";
      if (gas === "co2") return "CO₂";
      if (gas === "ch4") return "CH₄";
      if (gas === "n2o") return "N₂O";
      return gas.toUpperCase();
    };

    // Convert subsector breakdown to array and sort by percentage
    const subsectorEntries = Object.entries(data.subsector_breakdown || {});

    // Sort by percentage (descending)
    subsectorEntries.sort((a, b) => b[1].percentage - a[1].percentage);

    return subsectorEntries.map(([subsectorName, subsectorData], index) => {
      const colorIndex = index % colorPalette.length;
      return {
        name: formatSubsectorName(subsectorName),
        originalName: subsectorName,
        percentage: `${subsectorData.percentage}%`,
        tonnage: formatEmissionValue(subsectorData.total_emission),
        totalEmission: subsectorData.total_emission,
        ranking: index + 1,
        iconColor: colorPalette[colorIndex].text,
        bgColor: colorPalette[colorIndex].bg,
        primaryColor: colorPalette[colorIndex].primary,
        barColor: colorPalette[colorIndex].bar,
        isTopEmitter: data.top_emitting_subsector === subsectorName,
        subsectorData: subsectorData,
      };
    });
  };

  const subsectors = getSubsectorsData();

  // Get gas unit for display
  const getGasUnit = () => {
    const data = historicalData?.data || historicalData;
    const gas = data?.gas_name || "co2";
    if (gas === "co2") return "CO₂";
    if (gas === "ch4") return "CH₄";
    if (gas === "n2o") return "N₂O";
    return gas.toUpperCase();
  };

  // Get total emissions
  const getTotalEmissions = () => {
    const data = historicalData?.data || historicalData;
    if (!data?.total_emission_overall) return "0";

    const total = data.total_emission_overall;
    if (total >= 1000000) {
      return (total / 1000000).toFixed(2) + "M";
    } else if (total >= 1000) {
      return (total / 1000).toFixed(2) + "K";
    } else {
      return total.toFixed(2);
    }
  };

  // Get sector name
  const getSectorName = () => {
    const data = historicalData?.data || historicalData;
    const sectorName = data?.sector_name || "Transportation";

    return sectorName
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Get year range from yearly_totals
  const getYearRange = () => {
    const data = historicalData?.data || historicalData;
    if (!data?.yearly_totals) return "";

    const years = Object.keys(data.yearly_totals).sort(
      (a, b) => Number(a) - Number(b)
    );
    if (years.length === 0) return "";

    return `${years[0]}-${years[years.length - 1]}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 container mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {getSectorName()} Emissions by Sub-sector
          </h2>
          <div className="text-sm text-gray-500 mt-1">
            {getGasUnit()} • {getYearRange()}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">
            Total {getSectorName()} Emissions
          </div>
          <div className="text-lg font-bold text-gray-900">
            {getTotalEmissions()} tons {getGasUnit()}
          </div>
        </div>
      </div>

      {/* Subsectors Grid */}
      {subsectors.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {subsectors.map((subsector) => (
            <div
              key={subsector.originalName}
              className={`group flex flex-col items-center p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 cursor-pointer ${
                subsector.isTopEmitter ? "ring-2 ring-red-200 bg-red-50" : ""
              }`}
            >
              {/* Ranking Number Circle */}
              <div
                className={`mb-4 p-6 rounded-full ${
                  subsector.bgColor
                } group-hover:scale-105 transition-transform duration-200 relative ${
                  subsector.isTopEmitter ? "ring-4 ring-red-100" : ""
                }`}
              >
                <div
                  className={`${subsector.iconColor} font-bold text-2xl flex items-center justify-center h-10 w-10`}
                >
                  {subsector.ranking}
                </div>
              </div>

              {/* Subsector Name */}
              <h3 className="text-base font-semibold text-gray-800 mb-2 text-center">
                {subsector.name}
                {subsector.isTopEmitter && (
                  <span className="ml-2 text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">
                    TOP
                  </span>
                )}
              </h3>

              {/* Primary Metric - Percentage */}
              <div
                className={`text-3xl font-bold ${subsector.primaryColor} mb-1`}
              >
                {subsector.percentage}
              </div>

              {/* Secondary Metric - Tonnage */}
              <div className="text-sm text-gray-600 mb-2 text-center">
                {subsector.tonnage}
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      parseFloat(subsector.percentage),
                      100
                    )}%`,
                    backgroundColor: subsector.barColor,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">
            No subsector data available
          </div>
          <div className="text-gray-500 text-sm">
            Emissions breakdown by sub-sector will appear here
          </div>
        </div>
      )}
    </div>
  );
}
