function AnimalCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100">
      <div className="h-56 w-full animate-pulse bg-slate-200" />

      <div className="flex flex-col gap-3 p-5">
        <div className="h-5 w-2/3 animate-pulse rounded-full bg-slate-200" />
        <div className="h-4 w-1/2 animate-pulse rounded-full bg-slate-200" />
        <div className="h-4 w-1/3 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-1 h-10 w-full animate-pulse rounded-xl bg-slate-100" />
      </div>
    </div>
  )
}

export default AnimalCardSkeleton