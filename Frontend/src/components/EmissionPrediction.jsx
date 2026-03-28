import { Line } from "react-chartjs-2";
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
import { Doughnut } from "react-chartjs-2";

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

export default function EmissionPrediction({ prediction }) {
  // Gas color mapping
  const gasColors = {
    co2: {
      primary: "#fb923c",
      light: "rgba(251, 146, 60, 0.1)",
      dark: "#ea580c",
    },
    ch4: {
      primary: "#c084fc",
      light: "rgba(192, 132, 252, 0.1)",
      dark: "#9333ea",
    },
    n2o: {
      primary: "#38bdf8",
      light: "rgba(56, 189, 248, 0.1)",
      dark: "#0284c7",
    },
  };

  // Determine which gases are available based on the API response structure
  const getAvailableGases = () => {
    if (!prediction?.data?.gas_composition) return [];

    const absoluteTotals =
      prediction.data.gas_composition.absolute_totals || {};
    const gases = [];

    if (absoluteTotals.co2 !== undefined) gases.push("co2");
    if (absoluteTotals.ch4 !== undefined) gases.push("ch4");
    if (absoluteTotals.n2o !== undefined) gases.push("n2o");

    return gases;
  };

  // Transform monthly trends data for chart - FIXED
  const processMonthlyData = () => {
    if (!prediction?.data?.monthly_trends) return [];

    const monthlyTrends = prediction.data.monthly_trends;
    
    
    // Based on your API response, it looks like monthly_trends has 12 values
    // Let's check if we have all 12 months
    if (monthlyTrends.length >= 12) {
      // Take the first 12 values directly
      return monthlyTrends.slice(0, 12);
    } else {
      // If we have less than 12 values, fill the rest with 0 or extrapolate
      const processed = [...monthlyTrends];
      while (processed.length < 12) {
        processed.push(0);
      }
      return processed;
    }
  };

  // Get metadata
  const meta = prediction?.meta || {};
  const country = meta.country || "Unknown";
  const sector = meta.sector || "Unknown";
  const year = meta.year || new Date().getFullYear();
  const gasType = meta.requested_gas || meta.gas || "co2";

  // Prepare datasets for line chart
  const processedData = processMonthlyData();


  const lineChartData = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: `${gasType.toUpperCase()} Emissions`,
        data: processedData,
        borderColor: gasColors[gasType]?.primary || "#fb923c",
        backgroundColor: gasColors[gasType]?.light || "rgba(251, 146, 60, 0.1)",
        pointBackgroundColor: gasColors[gasType]?.primary || "#fb923c",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 3,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Prepare data for gas composition doughnut chart - Updated to show ratios
  const prepareGasCompositionData = () => {
    const composition = prediction?.data?.gas_composition;
    if (!composition) return null;

    const gases = getAvailableGases();
    const ratios = composition.ratios || {};
    const absoluteTotals = composition.absolute_totals || {};

    // Use ratios for the chart (percentages)
    return {
      labels: gases.map((gas) => `${gas.toUpperCase()}`),
      datasets: [
        {
          data: gases.map((gas) => ratios[gas] || 0),
          backgroundColor: gases.map(
            (gas) => gasColors[gas]?.primary || "#fb923c"
          ),
          borderColor: gases.map((gas) => "#ffffff"),
          borderWidth: 2,
          hoverOffset: 15,
        },
      ],
    };
  };

  const gasCompositionData = prepareGasCompositionData();

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        align: "center",
        labels: {
          boxWidth: 12,
          boxHeight: 12,
          padding: 20,
          usePointStyle: true,
          pointStyle: "circle",
          font: {
            size: 13,
            family: "system-ui, -apple-system, sans-serif",
          },
          color: "#374151",
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#1f2937",
        bodyColor: "#1f2937",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(
              2
            )} units`;
          },
        },
      },
      title: {
        display: true,
        text: `${country.toUpperCase()} - ${
          sector.charAt(0).toUpperCase() + sector.slice(1)
        } - ${year}`,
        font: {
          size: 16,
          weight: "bold",
        },
        color: "#1f2937",
        padding: {
          bottom: 20,
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "#f3f4f6",
          drawBorder: false,
        },
        ticks: {
          color: "#6b7280",
          font: {
            size: 12,
          },
          padding: 10,
        },
        border: {
          color: "#e5e7eb",
        },
      },
      y: {
        beginAtZero: true,
        min: 0,
        grid: {
          color: "#f3f4f6",
          drawBorder: false,
        },
        ticks: {
          color: "#6b7280",
          padding: 10,
          font: {
            size: 12,
          },
          callback: function (value) {
            return value.toLocaleString();
          },
        },
        border: {
          display: false,
        },
        title: {
          display: true,
          text: `Emissions (${gasType.toUpperCase()} units)`,
          color: "#6b7280",
          font: {
            size: 12,
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "nearest",
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: "circle",
          font: {
            size: 12,
          },
          generateLabels: function(chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const ratioValue = data.datasets[0].data[i];
                return {
                  text: `${label}: ${ratioValue.toFixed(2)}`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  strokeStyle: data.datasets[0].borderColor[i],
                  lineWidth: data.datasets[0].borderWidth,
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          }
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const ratioValue = context.parsed;
            const composition = prediction?.data?.gas_composition;
            const absoluteTotals = composition?.absolute_totals || {};
            const gas = label.toLowerCase();
            const absoluteValue = absoluteTotals[gas] || 0;
            
            return [
              `Ratio: ${ratioValue.toFixed(2)}`,
              `Absolute: ${absoluteValue.toFixed(2)} units`
            ];
          },
        },
      },
    },
    cutout: "60%",
   
  };

  // Handle no data scenario
  if (!prediction?.data) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Emission Prediction
          </h2>
        </div>
        <div className="h-80 flex items-center justify-center">
          <p className="text-gray-500">No prediction data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Emission Prediction
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Forecast for {year} • {gasType.toUpperCase()} •{" "}
            {sector.charAt(0).toUpperCase() + sector.slice(1)}
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Monthly Trends Chart */}
        <div className="lg:col-span-2">
          <div className="h-80">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        {/* Gas Composition */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Gas Composition
          </h3>
          {gasCompositionData ? (
            <>
              <div className="h-56 mb-4">
                <Doughnut data={gasCompositionData} options={doughnutOptions} />
                <div className="text-center mt-2">
                  <p className="text-xs text-gray-500">
                    Shows ratio distribution (%)
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {getAvailableGases().map((gas) => {
                  const composition = prediction.data.gas_composition;
                  const ratio = composition.ratios?.[gas] || 0;
                  const absolute = composition.absolute_totals?.[gas] || 0;

                  return (
                    <div
                      key={gas}
                      className="bg-white rounded-lg overflow-hidden border border-gray-200"
                    >
                      <div className="flex items-center justify-between p-3">
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: gasColors[gas]?.primary }}
                          />
                          <span className="text-sm font-medium text-gray-700">
                            {gas.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 divide-x divide-gray-100 border-t border-gray-100">
                        <div className="p-2 text-center">
                          <div className="text-xs text-gray-500 mb-1">Ratio</div>
                          <div className="text-sm font-semibold text-gray-900">
                            {ratio.toFixed(2)}
                          </div>
                        </div>
                        <div className="p-2 text-center">
                          <div className="text-xs text-gray-500 mb-1">Absolute</div>
                          <div className="text-sm font-semibold text-gray-900">
                            {absolute.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Total Combined Emissions */}
                {prediction.data.gas_composition?.total_combined && (
                  <div className="mt-4 pt-4 border-t border-gray-300">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Total Combined Emissions
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {prediction.data.gas_composition.total_combined.toFixed(
                          2
                        )}{" "}
                        units
                      </span>
                    </div>
            
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="h-56 flex items-center justify-center">
              <p className="text-gray-500">No composition data</p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-linear-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Requested Gas Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {prediction.data.total_emissions?.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                }) || "N/A"}
              </p>
            </div>
            <div className="text-2xl">
              {gasType === "co2" ? "🌫️" : gasType === "ch4" ? "🔥" : "🌡️"}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {gasType.toUpperCase()} emissions for {year}
          </p>
        </div>

        <div className="bg-linear-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Peak Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {processedData.length > 0
                  ? Math.max(...processedData).toFixed(2)
                  : "N/A"}
              </p>
            </div>
            <div className="text-2xl">📈</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Highest emissions in a single month
          </p>
        </div>

        <div className="bg-linear-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Monthly</p>
              <p className="text-2xl font-bold text-gray-900">
                {processedData.length > 0
                  ? (
                      processedData.reduce((a, b) => a + b, 0) /
                      processedData.length
                    ).toFixed(2)
                  : "N/A"}
              </p>
            </div>
            <div className="text-2xl">📊</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Average emissions per month
          </p>
        </div>
      </div>

    </div>
  );
}