function ReportSummary({ items }) {
  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(({ label, value, icon: Icon, color = 'bg-primary-light text-primary-dark' }) => (
        <article key={label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/30">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0"><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-1.5 text-xl font-bold tracking-tight text-slate-900">{value}</p></div>
            <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${color}`}><Icon /></span>
          </div>
        </article>
      ))}
    </section>
  )
}

export default ReportSummary
