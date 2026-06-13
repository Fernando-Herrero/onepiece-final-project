export function AuthSkeletonComponent() {
  return (
    <div className="flex w-full max-w-md animate-pulse flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-6">
      <div className="mx-auto h-6 w-32 rounded bg-neutral-200" />
      <div className="h-16 rounded bg-neutral-100" />
      <div className="h-16 rounded bg-neutral-100" />
      <div className="h-10 rounded bg-neutral-200" />
    </div>
  );
}

export function SessionSkeletonComponent() {
  return (
    <div className="flex animate-pulse flex-col items-center gap-3">
      <div className="h-5 w-48 rounded bg-neutral-200" />
      <div className="h-4 w-32 rounded bg-neutral-100" />
    </div>
  );
}
