import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

export default function DashboardVisualizations({ historicalData }) {
  // Process the historical data for the chart
  const getChartData = () => {
    // Check if data is in the new format
    const data = historicalData?.data || historicalData;
    
    if (!data?.yearly_totals) {
      return {
        labels: [],
        datasets: [],
      };
    }

    const yearlyData = data.yearly_totals;
    const labels = Object.keys(yearlyData).sort(
      (a, b) => Number(a) - Number(b)
    );
    const emissions = labels.map((year) => yearlyData[year]);

    // Get gas type for label
    const gas = data?.gas_name || "co2";
    const gasLabel =
      gas === "co2"
        ? "CO₂"
        : gas === "ch4"
        ? "CH₄"
        : gas === "n2o"
        ? "N₂O"
        : gas.toUpperCase();

    return {
      labels,
      datasets: [
        {
          label: `${data?.sector_name || "Transportation"} Emissions (tons ${gasLabel})`,
          data: emissions,
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          borderWidth: 3,
          pointBackgroundColor: "#10b981",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          fill: true,
          tension: 0.3,
        },
      ],
    };
  };

  // Get ratios data for visualization
  const getRatiosData = () => {
    const data = historicalData?.data || historicalData;
    
    if (!data?.ratios) {
      return null;
    }

    const ratios = data.ratios;
    const gasColors = {
      co2: "#10b981", // Green
      ch4: "#3b82f6", // Blue
      n2o: "#8b5cf6", // Purple
    };

    const gasLabels = {
      co2: "CO₂",
      ch4: "CH₄",
      n2o: "N₂O",
    };

    // Sort ratios by value (descending)
    const sortedRatios = Object.entries(ratios)
      .sort(([, a], [, b]) => b - a)
      .filter(([gas, value]) => value > 0);

    return {
      labels: sortedRatios.map(([gas]) => gasLabels[gas] || gas.toUpperCase()),
      datasets: [
        {
          data: sortedRatios.map(([, value]) => value),
          backgroundColor: sortedRatios.map(([gas]) => gasColors[gas] || "#6b7280"),
          borderColor: "#ffffff",
          borderWidth: 2,
          hoverOffset: 15,
        },
      ],
    };
  };

  // Format emission value
  const formatEmissionValue = (value) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(2) + "M";
    } else if (value >= 1000) {
      return (value / 1000).toFixed(2) + "K";
    } else {
      return value.toFixed(2);
    }
  };

  // Format percentage value
  const formatPercentage = (value) => {
    return value.toFixed(2) + "%";
  };

  // Get peak year data
  const getPeakYearData = () => {
    const data = historicalData?.data || historicalData;
    
    if (!data?.yearly_totals) {
      return { year: "", emission: 0 };
    }

    const yearlyData = data.yearly_totals;
    let peakYear = "";
    let peakEmission = -Infinity;

    Object.entries(yearlyData).forEach(([year, emission]) => {
      if (emission > peakEmission) {
        peakEmission = emission;
        peakYear = year;
      }
    });

    return { year: peakYear, emission: peakEmission };
  };

  // Get current year data (last year in the data)
  const getCurrentYearData = () => {
    const data = historicalData?.data || historicalData;
    
    if (!data?.yearly_totals) {
      return { year: "", emission: 0 };
    }

    const yearlyData = data.yearly_totals;
    const years = Object.keys(yearlyData).sort((a, b) => Number(a) - Number(b));
    const currentYear = years[years.length - 1];
    const currentEmission = yearlyData[currentYear];

    return { year: currentYear, emission: currentEmission };
  };

  // Get top subsector emission trend for comparison
  const getTopSubsectorTrend = () => {
    const data = historicalData?.data || historicalData;
    
    if (!data?.subsector_breakdown || !data?.top_emitting_subsector) {
      return null;
    }

    const topSubsector = data.top_emitting_subsector;
    const subsectorData = data.subsector_breakdown[topSubsector];
    
    if (!subsectorData?.yearly_emission) {
      return null;
    }

    const yearlyEmission = subsectorData.yearly_emission;
    const labels = Object.keys(yearlyEmission).sort((a, b) => Number(a) - Number(b));
    const emissions = labels.map((year) => yearlyEmission[year]);

    // Get gas type for label
    const gas = data?.gas_name || "co2";
    const gasLabel =
      gas === "co2"
        ? "CO₂"
        : gas === "ch4"
        ? "CH₄"
        : gas === "n2o"
        ? "N₂O"
        : gas.toUpperCase();

    // Format subsector name
    const formatSubsectorName = (name) => {
      return name
        .replace(/-/g, " ")
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    };

    return {
      labels,
      emissions,
      name: formatSubsectorName(topSubsector),
      percentage: subsectorData.percentage,
      label: `${formatSubsectorName(topSubsector)} (${subsectorData.percentage.toFixed(1)}%)`
    };
  };

  const lineChartData = getChartData();
  const ratiosData = getRatiosData();
  const peakYearData = getPeakYearData();
  const currentYearData = getCurrentYearData();
  const topSubsectorTrend = getTopSubsectorTrend();

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#6b7280',
          font: {
            size: 12,
            weight: '500'
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        titleColor: "#1f2937",
        bodyColor: "#1f2937",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += formatEmissionValue(context.parsed.y) + " tons";
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#6b7280",
          font: {
            size: 12,
          },
        },
        border: {
          color: "#e5e7eb",
        },
      },
      y: {
        beginAtZero: false,
        grid: {
          color: "#f3f4f6",
          drawBorder: false,
        },
        ticks: {
          color: "#6b7280",
          callback: function (value) {
            return formatEmissionValue(value);
          },
        },
        border: {
          display: false,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "nearest",
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#6b7280',
          font: {
            size: 12,
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 12,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${formatPercentage(value)}`;
          }
        }
      },
    },
    cutout: '65%',
  };

  // Get sector and gas info for display
  const getSectorInfo = () => {
    const data = historicalData?.data || historicalData;
    return {
      sector: data?.sector_name || "Transportation",
      gas: data?.gas_name || "co2",
      ratios: data?.ratios || null
    };
  };

  const { sector, gas, ratios } = getSectorInfo();
  
  const getGasUnit = () => {
    if (gas === "co2") return "CO₂";
    if (gas === "ch4") return "CH₄";
    if (gas === "n2o") return "N₂O";
    return gas.toUpperCase();
  };

  // Calculate year range
  const getYearRange = () => {
    const data = historicalData?.data || historicalData;
    if (!data?.yearly_totals) return "";
    
    const years = Object.keys(data.yearly_totals).sort((a, b) => Number(a) - Number(b));
    if (years.length === 0) return "";
    
    return `${years[0]}-${years[years.length - 1]}`;
  };

  return (
    <div className="space-y-6 py-6 container mx-auto">
      {/* Top Row: Heatmap and Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Global Emissions Heatmap - UNCHANGED */}

{/* Card 1: Global Emissions Heatmap - UPDATED */}
<div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-xl font-bold text-gray-900">
      Global Emissions Heatmap
    </h2>
  </div>

  <div className="relative h-80 w-full rounded-xl overflow-hidden bg-linear-to-br from-red-50 via-yellow-50 to-green-50">
    {/* Heatmap Image */}
    <div className="absolute inset-0 flex items-center justify-center p-4">
      <img 
        src="/heatmap.png" 
        alt="Global Emissions Heatmap"
        className="h-full w-full object-contain rounded-lg"
        onError={(e) => {
          e.target.style.display = 'none';
          // Fallback if image doesn't exist
          const fallback = document.createElement('div');
          fallback.className = 'h-full w-full flex items-center justify-center bg-gray-100 rounded-lg';
          fallback.innerHTML = '<p className="text-gray-500">Heatmap image not found</p>';
          e.target.parentNode.appendChild(fallback);
        }}
      />
    </div>

    {/* Legend */}
    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-200">
      <h4 className="text-sm font-medium text-gray-700 mb-2">
        Intensity Legend
      </h4>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-600"></div>
          <span className="text-sm text-gray-600">High</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span className="text-sm text-gray-600">Medium</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-sm text-gray-600">Low</span>
        </div>
      </div>
    </div>

    {/* Interactive Tooltip (hidden by default) */}
    <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-white p-2 rounded-lg shadow-lg border border-gray-200 text-sm">
      <div className="font-medium">Tooltip Content</div>
    </div>
  </div>
</div>


        {/* Card 2: Historical Emissions Trend */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {sector} Emissions Trend
            </h2>
            <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-lg">
              {getGasUnit()} • {getYearRange()}
            </div>
          </div>

          {/* Chart Container */}
          <div className="h-80">
            {lineChartData.labels.length > 0 ? (
              <Line data={{
                labels: lineChartData.labels,
                datasets: [
                  ...lineChartData.datasets,
                  // Add top subsector trend if available
                  ...(topSubsectorTrend ? [{
                    label: `Top Subsector: ${topSubsectorTrend.name}`,
                    data: topSubsectorTrend.emissions,
                    borderColor: "#3b82f6",
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointBackgroundColor: "#3b82f6",
                    pointBorderColor: "#ffffff",
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: false,
                    tension: 0.3,
                  }] : [])
                ]
              }} options={lineChartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No data available
              </div>
            )}
          </div>

          {/* Additional Chart Info */}
          <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-500">Peak Year</div>
              <div className="text-lg font-bold text-gray-900">
                {peakYearData.year}
              </div>
              <div className="text-sm text-red-600">
                {formatEmissionValue(peakYearData.emission)} tons
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">Latest Year</div>
              <div className="text-lg font-bold text-gray-900">
                {currentYearData.year}
              </div>
              <div className="text-sm text-green-600">
                {formatEmissionValue(currentYearData.emission)} tons
              </div>
            </div>
          </div>

          {topSubsectorTrend && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="text-sm text-gray-500 mb-1">
                Top Subsector Contribution
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {topSubsectorTrend.name}
                </span>
                <span className="text-sm font-bold text-blue-600">
                  {topSubsectorTrend.percentage.toFixed(1)}% of total
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Ratios Card - NEW */}
      {ratiosData && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Greenhouse Gas Composition
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Distribution of different greenhouse gases in {sector} emissions
              </p>
            </div>
            <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-lg">
              Percentage Distribution
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Doughnut Chart */}
            <div className="h-80">
              {ratiosData ? (
                <Doughnut data={ratiosData} options={doughnutOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No ratios data available
                </div>
              )}
            </div>

            {/* Detailed Ratios Breakdown */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Detailed Breakdown
                </h3>
                {ratios && Object.entries(ratios)
                  .sort(([, a], [, b]) => b - a)
                  .filter(([_, value]) => value > 0)
                  .map(([gasName, value]) => {
                    const gasColors = {
                      co2: "bg-emerald-500",
                      ch4: "bg-blue-500",
                      n2o: "bg-purple-500",
                    };
                    
                    const gasLabels = {
                      co2: "Carbon Dioxide (CO₂)",
                      ch4: "Methane (CH₄)",
                      n2o: "Nitrous Oxide (N₂O)",
                    };

                    return (
                      <div key={gasName} className="mb-4 last:mb-0">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full ${gasColors[gasName] || "bg-gray-500"} mr-3`}></div>
                            <span className="text-sm font-medium text-gray-700">
                              {gasLabels[gasName] || gasName.toUpperCase()}
                            </span>
                          </div>
                          <span className="text-lg font-bold text-gray-900">
                            {formatPercentage(value)}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${gasColors[gasName] || "bg-gray-500"}`}
                            style={{ width: `${Math.min(value, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}