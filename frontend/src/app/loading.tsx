import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
      <h2 className="text-xl font-semibold text-gray-700">Loading experience...</h2>
      <p className="text-sm text-gray-500">Preparing the best products for you.</p>
    </div>
  );
}
