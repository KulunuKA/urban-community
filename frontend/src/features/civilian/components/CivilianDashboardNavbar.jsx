import { useId, useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { CIVILIAN_DASHBOARD_NAV } from '@/features/civilian/data/dashboardNav'
import { ROUTES } from '@/constants/routes'
import { useCivilian } from '@/contexts/CivilianProvider'
import { Recycle } from 'lucide-react'

function navLinkClass({ isActive }) {
  return [
    'text-sm font-medium transition',
    isActive
      ? 'text-emerald-600'
      : 'text-slate-600 hover:text-emerald-600',
  ].join(' ')
}

export function CivilianDashboardNavbar() {
  const [open, setOpen] = useState(false)
  const menuId = useId()
  const navigate = useNavigate()
  const { civilian } = useCivilian()

  const displayName =
    civilian?.name?.trim() ||
    JSON.parse(sessionStorage.getItem('user') || '{}')?.name ||
    'User'
  const avatarText = displayName.charAt(0).toUpperCase()
  const profileImage = civilian?.profileImage?.trim() || ''

  const handleLogout = () => {
    navigate(ROUTES.CIVILIAN_PROFILE)
  }

  return (
    <nav
      className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl"
      aria-label="Civilian dashboard"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 lg:px-8">
        <Link to={ROUTES.HOME} className="flex min-w-0 shrink-0 items-center gap-3 text-left">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-xl shadow-md shadow-emerald-200/50">
            <Recycle size={32} strokeWidth={2.5}/>
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-bold tracking-wide text-slate-900">
              Urban Community
            </p>
            <p className="truncate text-xs text-slate-500">Connect. Report. Improve.</p>
          </div>
        </Link>

        <div className="hidden min-w-0 flex-1 items-center justify-center gap-5 lg:flex lg:gap-6">
          {CIVILIAN_DASHBOARD_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={navLinkClass}
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="hidden items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 lg:inline-flex"
            onClick={handleLogout}
            aria-label="Open profile"
          >
            {profileImage ? (
              <img
                src={profileImage}
                alt={displayName}
                className="h-7 w-7 rounded-full object-cover ring-1 ring-slate-200"
              />
            ) : (
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                {avatarText}
              </span>
            )}
            Profile
          </button>
          <button
            type="button"
            className="inline-flex rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Toggle menu</span>
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {open ? (
        <div
          id={menuId}
          className="border-t border-slate-200/80 bg-white/95 px-6 py-4 lg:hidden"
        >
          <ul className="flex flex-col gap-1">
            {CIVILIAN_DASHBOARD_NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    [
                      'block rounded-lg px-2 py-2.5 text-sm font-medium transition',
                      isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-emerald-600',
                    ].join(' ')
                  }
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
            <li className="pt-2">
              <button
                type="button"
                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                onClick={handleLogout}
              >
                Log Out
              </button>
            </li>
          </ul>
        </div>
      ) : null}
    </nav>
  )
}
