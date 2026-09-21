export default function Loading() {
  return (
    <div className="space-y-3" aria-label="Carregando">
      <div className="h-10 w-48 animate-pulse rounded-lg bg-slate-200" />
      <div className="h-56 animate-pulse rounded-2xl bg-slate-100" />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="h-32 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-32 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
}
