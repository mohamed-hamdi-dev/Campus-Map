export default function MappingNotFound() {
  return (
    <div className="rounded-2xl bg-cyan-50 p-6 text-slate-900">
      <h1 className="text-2xl font-black">Mapping page not found</h1>
      <p className="mt-2 text-slate-600">
        The requested map route does not exist.
      </p>
    </div>
  );
}
