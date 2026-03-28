export default function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6 min-h-screen">
      {/* Emission Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total Emissions Skeleton */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-start justify-between">
            <div className="w-full">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded w-2/3 mb-3 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            </div>
            <div className="bg-gray-100 p-3 rounded-xl">
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Card 2: Predicted Change Skeleton */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-start justify-between">
            <div className="w-full">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded w-2/3 mb-3 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            </div>
            <div className="bg-gray-100 p-3 rounded-xl">
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Card 3: Top Emitting Sector Skeleton */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-start justify-between">
            <div className="w-full">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded w-2/3 mb-3 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            </div>
            <div className="bg-gray-100 p-3 rounded-xl">
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Visualizations Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Heatmap Card Skeleton */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          </div>
          <div className="relative h-80 w-full rounded-xl overflow-hidden bg-gray-50">
            {/* Heatmap Grid Skeleton */}
            <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 gap-2 p-4">
              {Array.from({ length: 24 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-lg bg-gray-200 animate-pulse"
                />
              ))}
            </div>

            {/* Legend Skeleton */}
            <div className="absolute bottom-4 left-4 bg-white rounded-xl p-4 shadow-sm border border-gray-200 w-40">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-3 animate-pulse"></div>
              <div className="space-y-2">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chart Card Skeleton */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>

          {/* Chart Container Skeleton */}
          <div className="h-80 bg-gray-50 rounded-xl animate-pulse">
            {/* Simulated chart lines */}
            <div className="relative h-full p-4">
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200"></div>
              <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200"></div>
              {/* Simulated data line */}
              <div className="absolute bottom-4 left-4 right-4 h-1 bg-gray-300 rounded animate-pulse"></div>
              <div className="absolute bottom-12 left-8 right-8 h-1 bg-gray-300 rounded animate-pulse"></div>
              <div className="absolute bottom-20 left-12 right-12 h-1 bg-gray-300 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Chart Info Skeleton */}
          <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="h-3 bg-gray-200 rounded w-16 mx-auto mb-2 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-12 mx-auto mb-1 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-20 mx-auto animate-pulse"></div>
            </div>
            <div className="text-center">
              <div className="h-3 bg-gray-200 rounded w-16 mx-auto mb-2 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-12 mx-auto mb-1 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-20 mx-auto animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Emissions by Sector Skeleton */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="h-6 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
          </div>
          <div className="text-right">
            <div className="h-4 bg-gray-200 rounded w-24 mb-1 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        </div>

        {/* Sectors Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="flex flex-col items-center p-4">
              {/* Ranking Circle Skeleton */}
              <div className="mb-4 p-6 rounded-full bg-gray-100 animate-pulse">
                <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
              </div>

              {/* Sector Name Skeleton */}
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3 animate-pulse"></div>

              {/* Percentage Skeleton */}
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2 animate-pulse"></div>

              {/* Tonnage Skeleton */}
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-3 animate-pulse"></div>

              {/* Progress Bar Skeleton */}
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-gray-200 rounded-full animate-pulse"
                  style={{ width: `${Math.random() * 60 + 20}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Legend Skeleton */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-200 rounded-full mr-2 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
          </div>

          {/* Top Emitter Skeleton */}
          <div className="mt-4 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-lg animate-pulse">
              <div className="w-5 h-5 bg-gray-200 rounded mr-2"></div>
              <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
