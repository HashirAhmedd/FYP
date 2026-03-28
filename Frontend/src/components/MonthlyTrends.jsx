import { useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function MonthlyTrends({ prediction }) {
  const [selectedMonth, setSelectedMonth] = useState(1); // January by default
  const [viewMode, setViewMode] = useState("monthly"); // 'monthly' or 'annual'

  // Gas color mapping for consistent colors
  const gasColors = {
    co2: {
      primary: "#fb923c", // Orange
      light: "rgba(251, 146, 60, 0.1)",
    },
    ch4: {
      primary: "#c084fc", // Purple
      light: "rgba(192, 132, 252, 0.1)",
    },
    n2o: {
      primary: "#38bdf8", // Blue
      light: "rgba(56, 189, 248, 0.1)",
    },
  };

  // Month names
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Get available gases from prediction data
  const getAvailableGases = () => {
    if (!prediction?.data?.gas_composition) return [];

    const composition = prediction.data.gas_composition.absolute_totals || {};
    const gases = [];

    if (composition.co2 !== undefined) gases.push("co2");
    if (composition.ch4 !== undefined) gases.push("ch4");
    if (composition.n2o !== undefined) gases.push("n2o");

    return gases;
  };

  // Get gas ratio from composition data
  const getGasRatio = (gas) => {
    if (!prediction?.data?.gas_composition) return 0;
    return prediction.data.gas_composition.ratios?.[gas] || 0;
  };

  // Get gas absolute total from composition data
  const getGasAbsoluteTotal = (gas) => {
    if (!prediction?.data?.gas_composition) return 0;
    return prediction.data.gas_composition.absolute_totals?.[gas] || 0;
  };

  // Get subsector data with ratios for each gas
  const getSubsectorData = () => {
  if (!prediction?.data?.subsector_breakdown) return [];

  const subsectors = prediction.data.subsector_breakdown;
  const monthIndex = selectedMonth - 1;

  // FIXED — pick the correct month directly (0–11)
  const monthlyDataIndex = monthIndex;

  const totalEmissions = prediction.data.total_emissions || 0;

  return subsectors
    .map((subsector) => {
      let monthlyValue = 0;
      let annualTotal = subsector.total || 0;

      if (subsector.monthly && subsector.monthly.length > monthlyDataIndex) {
        monthlyValue = subsector.monthly[monthlyDataIndex] || 0;
      }

      const shareOfTotal =
        annualTotal > 0 && totalEmissions > 0
          ? (annualTotal / totalEmissions) * 100
          : 0;

      const availableGases = getAvailableGases();
      const gasValues = {};

      availableGases.forEach((gas) => {
        const gasRatio = getGasRatio(gas);
        gasValues[gas] = {
          ratio: gasRatio,
          subsectorValue: annualTotal * (gasRatio / 100),
          monthlyValue: monthlyValue * (gasRatio / 100),
        };
      });

      return {
        name: subsector.name,
        formattedName: formatSubsectorName(subsector.name),
        monthlyValue,
        annualTotal,
        shareOfTotal,
        gasValues,
        monthlyValues: subsector.monthly || [],
      };
    })
    .sort((a, b) => b.annualTotal - a.annualTotal);
};


  // Format subsector name
  const formatSubsectorName = (name) => {
    return name
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Get gas display name
  const getGasDisplayName = (gas) => {
    switch (gas.toLowerCase()) {
      case "co2":
        return "CO₂";
      case "ch4":
        return "CH₄";
      case "n2o":
        return "N₂O";
      default:
        return gas.toUpperCase();
    }
  };

  // Prepare chart data for gas ratio comparison
  const prepareGasComparisonData = () => {
    const subsectorData = getSubsectorData();
    const availableGases = getAvailableGases();

    // If we want to show top 5 subsectors for clarity
    const topSubsectors = subsectorData.slice(0, 5);

    const datasets = availableGases.map((gas) => ({
      label: getGasDisplayName(gas),
      data: topSubsectors.map((subsector) => {
        if (viewMode === "monthly") {
          return subsector.gasValues[gas]?.monthlyValue || 0;
        } else {
          return subsector.gasValues[gas]?.subsectorValue || 0;
        }
      }),
      backgroundColor: gasColors[gas]?.primary || "#fb923c",
      borderColor: gasColors[gas]?.primary || "#fb923c",
      borderWidth: 1,
      borderRadius: 4,
      barPercentage: 0.7,
      categoryPercentage: 0.8,
    }));

    return {
      labels: topSubsectors.map((item) => item.formattedName),
      datasets: datasets,
    };
  };

  const comparisonChartData = prepareGasComparisonData();
  const subsectorData = getSubsectorData();
  const availableGases = getAvailableGases();

  const comparisonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: "circle",
          font: {
            size: 12,
          },
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
        callbacks: {
          label: function (context) {
            const value = context.parsed.y;
            const gas = context.dataset.label;
            return `${gas}: ${value.toFixed(2)} units`;
          },
        },
      },
      title: {
        display: true,
        text: `Gas Comparison Across Top Subsectors - ${viewMode === "monthly" ? monthNames[selectedMonth - 1] : "Annual"}`,
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
          display: false,
        },
        ticks: {
          color: "#6b7280",
          font: {
            size: 11,
            weight: "500",
          },
          padding: 8,
          maxRotation: 45,
          minRotation: 45,
        },
        border: {
          color: "#e5e7eb",
        },
      },
      y: {
        beginAtZero: true,
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
          text: "Emissions (units)",
          color: "#6b7280",
          font: {
            size: 12,
            weight: "500",
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
  };




  if (!prediction?.data?.subsector_breakdown || subsectorData.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Multi-Gas Subsector Analysis
          </h2>
        </div>
        <div className="h-80 flex items-center justify-center">
          <p className="text-gray-500">No subsector data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Multi-Gas Subsector Analysis
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            {prediction?.meta?.country?.toUpperCase() || "Unknown"} •{" "}
            {prediction?.meta?.year || "Unknown Year"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode("monthly")}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                viewMode === "monthly"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Monthly View
            </button>
            <button
              onClick={() => setViewMode("annual")}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                viewMode === "annual"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Annual View
            </button>
          </div>

          {/* Month Selector (only for monthly view) */}
          {viewMode === "monthly" && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Month:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white min-w-40"
              >
                {monthNames.map((month, index) => (
                  <option key={index + 1} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

     

      {/* Gas Comparison Chart */}
      <div className="mb-6">
        <div className="h-80">
          <Bar data={comparisonChartData} options={comparisonChartOptions} />
        </div>
       
      </div>

    

      {/* Detailed Subsector Table with Gas Breakdown */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Subsector Details with Gas Breakdown
        </h3>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subsector
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total {viewMode === "monthly" ? monthNames[selectedMonth - 1] : "Annual"}
                </th>
              
                {availableGases.map((gas) => (
                  <th key={gas} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {getGasDisplayName(gas)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subsectorData.slice(0, 8).map((subsector, index) => {
                const value = viewMode === "monthly" ? subsector.monthlyValue : subsector.annualTotal;
                
                return (
                  <tr
                    key={subsector.name}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full mr-2 bg-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {subsector.formattedName}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="text-sm font-semibold text-gray-900">
                        {value.toFixed(2)}
                      </div>
                    </td>
                  
                    {availableGases.map((gas) => {
                      const gasValue = viewMode === "monthly" 
                        ? subsector.gasValues[gas]?.monthlyValue || 0
                        : subsector.gasValues[gas]?.subsectorValue || 0;
                      
                      return (
                        <td key={gas} className="px-3 py-3 text-center">
                          <div className="text-sm text-gray-600">
                            {gasValue.toFixed(2)}
                          </div>
                        
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      
      </div>
    </div>
  );
}