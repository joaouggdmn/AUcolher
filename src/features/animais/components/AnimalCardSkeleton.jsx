function AnimalCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-card border border-line bg-white">
      <div className="h-56 w-full animate-pulse bg-line" />

      <div className="flex flex-col gap-3 p-5">
        <div className="h-5 w-2/3 animate-pulse rounded-full bg-line" />
        <div className="h-4 w-1/2 animate-pulse rounded-full bg-line" />
        <div className="h-4 w-1/3 animate-pulse rounded-full bg-line" />
        <div className="mt-1 h-10 w-full animate-pulse rounded-control bg-sand" />
      </div>
    </div>
  )
}

export default AnimalCardSkeleton