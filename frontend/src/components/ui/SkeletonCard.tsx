export default function SkeletonCard() {
  return (
    <div className="bg-white rounded overflow-hidden 
                    border border-gray-100">
      <div className="skeleton h-36 sm:h-44 w-full" />
      <div className="p-2 space-y-2">
        <div className="skeleton h-3 w-2/3 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-4/5 rounded" />
        <div className="skeleton h-4 w-1/2 rounded mt-1" />
      </div>
    </div>
  )
}
