import { appName } from '../config/app.js'

function BrandLogo({ large = false, className = '' }) {
  return (
    <div className={`flex min-w-0 items-center gap-3 ${className}`} aria-label={appName}>
      <img src="/favicon.svg" alt="" className={large ? 'size-14 shrink-0' : 'size-10 shrink-0'} />
      <div className="min-w-0 leading-none">
        <span className={`block truncate font-bold tracking-tight text-[#34201a] ${large ? 'text-xl' : 'text-base'}`}>
          {appName}
        </span>
        <span className={`mt-1.5 block truncate font-semibold uppercase tracking-[0.14em] text-slate-500 ${large ? 'text-[9px]' : 'text-[7px]'}`}>
          Hotel Management
        </span>
      </div>
    </div>
  )
}

export default BrandLogo
