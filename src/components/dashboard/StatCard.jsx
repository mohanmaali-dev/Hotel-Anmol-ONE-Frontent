import {
  FiAlertTriangle,
  FiBox,
  FiClock,
  FiCreditCard,
  FiShoppingBag,
  FiShoppingCart,
  FiTrendingUp,
} from 'react-icons/fi'

const icons = {
  sales: FiTrendingUp,
  orders: FiShoppingBag,
  payments: FiCreditCard,
  purchases: FiShoppingCart,
  stock: FiBox,
  lowStock: FiAlertTriangle,
}

const colorClasses = {
  emerald: 'bg-emerald-50 text-emerald-600',
  blue: 'bg-blue-50 text-blue-600',
  amber: 'bg-amber-50 text-amber-600',
  violet: 'bg-violet-50 text-violet-600',
  cyan: 'bg-cyan-50 text-cyan-600',
  rose: 'bg-rose-50 text-rose-600',
}

function StatCard({ title, value, change, trend, helperText, icon, color }) {
  const Icon = icons[icon]

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40 transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
        </div>
        <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${colorClasses[color]}`}>
          <Icon className="text-xl" />
        </span>
      </div>
      <div className="mt-4 flex items-center gap-1.5 text-xs">
        {trend === 'up' ? (
          <span className="flex items-center gap-1 font-semibold text-emerald-600">
            <FiTrendingUp /> {change}
          </span>
        ) : (
          <span className="flex items-center gap-1 font-semibold text-slate-600">
            <FiClock /> {change}
          </span>
        )}
        <span className="text-slate-400">{helperText}</span>
      </div>
    </article>
  )
}

export default StatCard
