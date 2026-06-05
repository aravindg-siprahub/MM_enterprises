import SkeletonCard from "@/components/ui/SkeletonCard";

export default function StoreLoading() {
  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Category Header Skeleton */}
      <div className="w-full h-48 bg-gray-100 rounded-3xl animate-pulse flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
      
      {/* Grid Header Skeleton */}
      <div className="flex justify-between items-end mb-6">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-64 bg-gray-100 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Products Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
