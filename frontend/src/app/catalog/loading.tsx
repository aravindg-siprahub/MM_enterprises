import SkeletonCard from "@/components/ui/SkeletonCard";

export default function CatalogLoading() {
  return (
    <div style={{ paddingTop: "72px" }}>
      {/* Page Header Skeleton */}
      <div
        style={{
          background: "var(--navy-900)",
          padding: "64px 24px 48px",
          textAlign: "center",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px"
        }}
      >
        <div className="h-6 w-32 bg-slate-700/50 rounded animate-pulse"></div>
        <div className="h-12 w-64 md:w-96 bg-slate-600/50 rounded animate-pulse"></div>
        <div className="h-4 w-full max-w-lg bg-slate-700/50 rounded animate-pulse"></div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", gap: "32px", alignItems: "flex-start", padding: "40px 24px" }}>
        
        {/* Sidebar Skeleton */}
        <div className="hidden lg:block w-64 shrink-0 space-y-6">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="space-y-2 pl-2">
                <div className="h-4 w-full bg-gray-100 rounded animate-pulse"></div>
                <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse"></div>
                <div className="h-4 w-4/5 bg-gray-100 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Product Grid Skeleton */}
        <div style={{ flexGrow: 1 }} className="w-full">
          <div className="flex justify-between items-center mb-6">
             <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
             <div className="h-10 w-32 bg-gray-100 rounded-md animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
