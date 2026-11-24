export function PageTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6">
      <h1 className="font-pixel text-3xl tracking-tight">{title}</h1>
      {description ? <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p> : null}
    </div>
  );
}

export function SampleNote() {
  return (
    <p className="mb-4 rounded-md border border-hold/30 bg-hold-soft px-3 py-2 text-xs text-hold">
      Preview with sample data. Nothing here is connected to a real account yet.
    </p>
  );
}
