export function PageTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6">
      <h1 className="font-pixel text-3xl tracking-tight">{title}</h1>
      {description ? <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p> : null}
    </div>
  );
}
