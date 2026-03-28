export default function Emission({ historicalData }) {
  // Extract data from the new format
  const data = historicalData?.data || historicalData;
  
  if (!data) {
    return <div>Loading...</div>;
  }

  // Calculate year-over-year change from 2023 to 2024
  const yearlyTotals = data.yearly_totals || {};
  const years = Object.keys(yearlyTotals).sort();
  
  let predictedChange = 0;
  if (years.length >= 2) {
    const latestYear = years[years.length - 1];
    const previousYear = years[years.length - 2];
    const latestEmission = yearlyTotals[latestYear];
    const previousEmission = yearlyTotals[previousYear];
    
    if (previousEmission > 0) {
      predictedChange = ((latestEmission - previousEmission) / previousEmission) * 100;
    }
  }

  // Find top emitting subsector details
  const topSubsectorName = data.top_emitting_subsector || "";
  const topSubsectorData = data.subsector_breakdown?.[topSubsectorName] || {};
  
  // Calculate average yearly growth over the entire period
  let averageGrowth = 0;
  if (years.length >= 2) {
    const firstYear = years[0];
    const lastYear = years[years.length - 1];
    const firstEmission = yearlyTotals[firstYear];
    const lastEmission = yearlyTotals[lastYear];
    const totalYears = years.length - 1;
    
    if (firstEmission > 0) {
      const totalGrowth = ((lastEmission - firstEmission) / firstEmission) * 100;
      averageGrowth = totalGrowth / totalYears;
    }
  }

  // Format the subsector name for display
  const formatSubsectorName = (name) => {
    return name
      .replace(/-/g, " ")
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 container mx-auto">
      {/* Card 1: Total Emissions */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">
              Total Emissions
            </p>
            <h3 className="text-3xl font-bold text-gray-900">
              {data.total_emission_overall?.toLocaleString(undefined, {
                maximumFractionDigits: 1
              })}
            </h3>
            <p className="text-gray-600 text-sm mt-2">
              tons of {data.gas_name?.toUpperCase() || "CO₂"}
            </p>
          </div>
          <div className="bg-red-50 p-3 rounded-xl">
            <div className="w-8 h-8 text-red-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4 4 0 003 15z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Year-over-Year Change */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">
              {years.length >= 2 ? `Year-over-Year Change (${years[years.length - 2]} to ${years[years.length - 1]})` : "Yearly Change"}
            </p>
            <h3 className={`text-3xl font-bold ${predictedChange >= 0 ? 'text-red-600' : 'text-green-700'}`}>
              {predictedChange >= 0 ? '+' : ''}{predictedChange.toFixed(1)}%
            </h3>
            <div className="mt-2 space-y-1">
              <p className="text-gray-600 text-sm">
                {years.length >= 2 ? (
                  <>
                    {predictedChange >= 0 ? 'Increase' : 'Decrease'} of{' '}
                    {Math.abs(predictedChange).toFixed(1)}%
                  </>
                ) : 'Insufficient data'}
              </p>
              <p className="text-xs text-gray-500">
                Avg. yearly growth: {averageGrowth.toFixed(1)}%
              </p>
            </div>
          </div>
          <div className={`p-3 rounded-xl ${predictedChange >= 0 ? 'bg-red-50' : 'bg-green-50'}`}>
            <div className={`w-8 h-8 ${predictedChange >= 0 ? 'text-red-600' : 'text-green-700'}`}>
              {predictedChange >= 0 ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"
                  />
                </svg>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Top Emitting Sub Sector */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">
              Top Emitting Sub Sector
            </p>
            <h3 className="text-3xl font-bold text-gray-900">
              {formatSubsectorName(topSubsectorName)}
            </h3>
            <div className="mt-2 space-y-1">
              <p className="text-gray-600 text-sm">
                {topSubsectorData.percentage?.toFixed(1) || '0.0'}% of total emissions
              </p>
              <p className="text-xs text-gray-500">
                Emits {topSubsectorData.total_emission?.toLocaleString(undefined, {
                  maximumFractionDigits: 1
                }) || '0'} tons
              </p>
            </div>
          </div>
          <div className="bg-blue-50 p-3 rounded-xl">
            <div className="w-8 h-8 text-blue-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}