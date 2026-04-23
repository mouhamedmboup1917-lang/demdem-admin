'use client';
/**
 * Skeleton loader — remplace les spinners pour un feedback visuel plus premium.
 * Usage : <Skeleton variant="card" count={4} /> ou <Skeleton variant="table" rows={5} />
 */

export function SkeletonLine({ width = '100%', height = 14, className = '' }) {
  return (
    <div
      className={`bg-[#e7e5e0] rounded-md animate-pulse ${className}`}
      style={{ width, height, minHeight: height }}
    />
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`card p-6 space-y-4 ${className}`}>
      <div className="flex justify-between items-start">
        <SkeletonLine width="40%" height={12} />
        <SkeletonLine width={32} height={32} className="rounded-xl" />
      </div>
      <SkeletonLine width="60%" height={28} />
      <SkeletonLine width="30%" height={12} />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <div className="card p-0 overflow-hidden">
      {/* Header */}
      <div className="flex gap-4 px-5 py-4 bg-[#f8fafc] border-b border-[#e2e8f0]">
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonLine key={i} width={`${Math.random() * 40 + 60}px`} height={10} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-5 py-4 border-b border-[#f1f5f9]">
          <SkeletonLine width={32} height={32} className="rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonLine width={`${Math.random() * 30 + 40}%`} height={14} />
            <SkeletonLine width={`${Math.random() * 20 + 20}%`} height={10} />
          </div>
          <SkeletonLine width={80} height={24} className="rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonKpi({ count = 4 }) {
  return (
    <div className={`grid grid-cols-2 lg:grid-cols-${count} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
