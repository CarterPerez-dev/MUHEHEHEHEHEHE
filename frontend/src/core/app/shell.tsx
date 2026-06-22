/**
 * ©AngelaMos | 2026
 * shell.tsx
 */

import { Suspense } from 'react'
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'
import {
  GiScales,
  GiScrollUnfurled,
  GiSettingsKnobs,
  GiShield,
} from 'react-icons/gi'
import { LuLogOut, LuMenu, LuX } from 'react-icons/lu'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useLogout } from '@/api/hooks'
import { Logo } from '@/components'
import { ROUTES } from '@/config'
import { useIsAdmin, useUIStore, useUser } from '@/core/lib'
import styles from './shell.module.scss'

const NAV_ITEMS = [
  { path: ROUTES.EVALUATE, label: 'Evaluate', icon: GiScales },
  { path: ROUTES.HISTORY, label: 'History', icon: GiScrollUnfurled },
  { path: ROUTES.SETTINGS, label: 'Settings', icon: GiSettingsKnobs },
]

const ADMIN_NAV_ITEM = {
  path: ROUTES.ADMIN.USERS,
  label: 'Admin',
  icon: GiShield,
}

function ShellErrorFallback({ error }: FallbackProps): React.ReactElement {
  const message = error instanceof Error ? error.message : String(error)
  return (
    <div className={styles.error}>
      <h2>SYSTEM FAULT</h2>
      <pre>{message}</pre>
    </div>
  )
}

function ShellLoading(): React.ReactElement {
  return <div className={styles.loading}>{'LOADING //'}</div>
}

export function Shell(): React.ReactElement {
  const { sidebarOpen: menuOpen, toggleSidebar: toggleMenu, setSidebarOpen } =
    useUIStore()
  const { mutate: logout } = useLogout()
  const isAdmin = useIsAdmin()
  const user = useUser()

  const closeMenu = (): void => setSidebarOpen(false)

  const navItems = isAdmin ? [...NAV_ITEMS, ADMIN_NAV_ITEM] : NAV_ITEMS

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.bar}>
          <div className={styles.left}>
            <Link to={ROUTES.EVALUATE} className={styles.logoLink}>
              <Logo starSize={16} />
            </Link>

            <nav className={styles.nav}>
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `${styles.navItem} ${isActive ? styles.active : ''}`
                  }
                >
                  <item.icon className={styles.navIcon} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div className={styles.right}>
            {user !== null && (
              <span className={styles.email}>{user.email}</span>
            )}
            <button
              type="button"
              className={styles.logoutBtn}
              onClick={() => logout()}
            >
              <span>LOGOUT</span>
              <LuLogOut className={styles.logoutIcon} />
            </button>
            <button
              type="button"
              className={styles.menuBtn}
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {menuOpen ? <LuX /> : <LuMenu />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className={styles.mobileNav}>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `${styles.mobileItem} ${isActive ? styles.active : ''}`
                }
              >
                <item.icon className={styles.navIcon} />
                <span>{item.label}</span>
              </NavLink>
            ))}
            <div className={styles.mobileFooter}>
              {user !== null && (
                <span className={styles.email}>{user.email}</span>
              )}
              <button
                type="button"
                className={styles.logoutBtn}
                onClick={() => {
                  closeMenu()
                  logout()
                }}
              >
                <span>LOGOUT</span>
                <LuLogOut className={styles.logoutIcon} />
              </button>
            </div>
          </nav>
        )}
      </header>

      {menuOpen && (
        <button
          type="button"
          className={styles.overlay}
          onClick={closeMenu}
          onKeyDown={(e) => e.key === 'Escape' && closeMenu()}
          aria-label="Close menu"
        />
      )}

      <main className={styles.content}>
        <ErrorBoundary FallbackComponent={ShellErrorFallback}>
          <Suspense fallback={<ShellLoading />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  )
}
