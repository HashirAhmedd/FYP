export default function PredictionSkeleton() {
  return (
    <div className="space-y-6">
      {/* Emission Prediction Skeleton */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 animate-pulse">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="h-7 w-48 bg-gray-200 rounded"></div>
        </div>

        {/* Chart Container Skeleton */}
        <div className="h-80 mb-6 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="h-10 w-10 bg-gray-300 rounded-full mx-auto mb-3"></div>
            <div className="h-4 w-32 bg-gray-300 rounded mx-auto"></div>
          </div>
        </div>

        {/* Additional Information Skeleton */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-gray-50 p-3 rounded-lg">
                <div className="h-4 w-32 bg-gray-300 rounded mb-2"></div>
                <div className="h-6 w-24 bg-gray-400 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Trends Skeleton */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 animate-pulse">
        {/* Header with controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div className="space-y-2">
            <div className="h-7 w-64 bg-gray-200 rounded"></div>
            <div className="h-4 w-40 bg-gray-200 rounded"></div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            {/* Gas Selector Skeleton */}
            <div className="flex items-center gap-2">
              <div className="h-4 w-10 bg-gray-200 rounded"></div>
              <div className="h-9 w-32 bg-gray-200 rounded-lg"></div>
            </div>

            {/* Month Selector Skeleton */}
            <div className="flex items-center gap-2">
              <div className="h-4 w-14 bg-gray-200 rounded"></div>
              <div className="h-9 w-40 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>

        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((card) => (
            <div key={card} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-28 bg-gray-300 rounded"></div>
                  <div className="h-7 w-20 bg-gray-400 rounded"></div>
                </div>
                <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
              </div>
              <div className="h-3 w-40 bg-gray-300 rounded mt-2"></div>
            </div>
          ))}
        </div>

        {/* Chart Container Skeleton */}
        <div className="h-80 mb-6 bg-gray-100 rounded-lg relative">
          {/* X-axis labels */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-around">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="h-3 w-16 bg-gray-300 rounded"></div>
            ))}
          </div>
          
          {/* Y-axis labels */}
          <div className="absolute left-4 top-0 bottom-4 flex flex-col justify-between">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-3 w-10 bg-gray-300 rounded"></div>
            ))}
          </div>
          
          {/* Chart bars */}
          <div className="absolute bottom-10 left-12 right-4 flex items-end justify-around h-48">
            {[1, 2, 3, 4, 5].map((bar, index) => (
              <div
                key={bar}
                className="w-12 bg-linear-to-t from-gray-300 to-gray-200 rounded-t"
                style={{ height: `${40 + index * 15}%` }}
              ></div>
            ))}
          </div>
        </div>

        {/* Monthly Trend Table Skeleton */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="h-6 w-64 bg-gray-300 rounded mb-4"></div>
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Table header */}
              <div className="grid grid-cols-14 gap-2 mb-3">
                <div className="col-span-2 h-4 bg-gray-300 rounded"></div>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((col) => (
                  <div key={col} className="h-4 bg-gray-300 rounded"></div>
                ))}
                <div className="h-4 bg-gray-300 rounded"></div>
              </div>
              
              {/* Table rows */}
              {[1, 2, 3].map((row) => (
                <div key={row} className="grid grid-cols-14 gap-2 mb-4">
                  <div className="col-span-2 flex items-center">
                    <div className="h-3 w-3 rounded-full bg-gray-300 mr-2"></div>
                    <div className="h-4 w-32 bg-gray-300 rounded"></div>
                  </div>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((col) => (
                    <div key={col} className="h-8 bg-gray-100 rounded"></div>
                  ))}
                  <div className="h-4 w-20 bg-gray-400 rounded justify-self-end"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend Skeleton */}
        <div className="mt-4 flex flex-wrap gap-3">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-gray-300 mr-2"></div>
              <div className="h-4 w-32 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}