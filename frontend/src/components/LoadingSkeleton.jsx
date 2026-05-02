function LoadingSkeleton({ variant = 'feed', count = 3 }) {
  if (variant === 'grid') {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="aspect-square animate-pulse rounded-3xl bg-slate-200" />
        ))}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="animate-pulse rounded-3xl bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 rounded-full bg-slate-200" />
                <div className="h-3 w-20 rounded-full bg-slate-100" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <article key={index} className="animate-pulse rounded-[28px] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-slate-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-28 rounded-full bg-slate-200" />
              <div className="h-3 w-16 rounded-full bg-slate-100" />
            </div>
          </div>
          <div className="mt-4 aspect-square rounded-[24px] bg-slate-200" />
          <div className="mt-4 space-y-2">
            <div className="h-4 w-24 rounded-full bg-slate-200" />
            <div className="h-3 w-full rounded-full bg-slate-100" />
            <div className="h-3 w-4/5 rounded-full bg-slate-100" />
          </div>
        </article>
      ))}
    </div>
  );
}

export default LoadingSkeleton;
