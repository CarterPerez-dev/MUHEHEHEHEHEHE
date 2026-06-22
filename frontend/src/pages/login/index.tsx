// ===================
// © AngelaMos | 2026
// index.tsx
// ===================

import { useState } from 'react'
import { LuArrowLeft, LuArrowRight, LuEye, LuEyeOff } from 'react-icons/lu'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useLogin } from '@/api/hooks'
import { loginRequestSchema } from '@/api/types'
import { Logo } from '@/components'
import { ROUTES } from '@/config'
import { useAuthFormStore } from '@/core/lib'
import styles from './login.module.scss'

export function Component(): React.ReactElement {
  const navigate = useNavigate()
  const login = useLogin()

  const { loginEmail, setLoginEmail, clearLoginForm } = useAuthFormStore()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()

    const result = loginRequestSchema.safeParse({
      username: loginEmail,
      password,
    })

    if (!result.success) {
      const firstError = result.error.issues[0]
      toast.error(firstError.message)
      return
    }

    login.mutate(result.data, {
      onSuccess: () => {
        clearLoginForm()
        navigate(ROUTES.EVALUATE)
      },
    })
  }

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <header className={styles.head}>
          <div className={styles.headLeft}>
            <Link
              to={ROUTES.HOME}
              className={styles.back}
              aria-label="Back to home"
            >
              <LuArrowLeft />
            </Link>
            <Link to={ROUTES.HOME} className={styles.logoLink}>
              <Logo starSize={16} />
            </Link>
          </div>
          <span className={styles.tag}>{'AUTH // SESSION'}</span>
        </header>

        <div className={styles.body}>
          <span className={styles.step}>01 / SIGN IN</span>
          <h1 className={styles.title}>ACCESS</h1>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className={styles.input}
                placeholder="you@domain.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="password">
                Password
              </label>
              <div className={styles.inputWrapper}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <LuEyeOff /> : <LuEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={styles.submit}
              disabled={login.isPending}
            >
              {login.isPending ? 'AUTHENTICATING...' : 'SIGN IN'}
              {!login.isPending && <LuArrowRight />}
            </button>
          </form>
        </div>

        <footer className={styles.foot}>
          <span className={styles.footMono}>NO ACCESS?</span>
          <Link to={ROUTES.REGISTER} className={styles.link}>
            CREATE ACCOUNT
          </Link>
        </footer>
      </div>
    </div>
  )
}

Component.displayName = 'Login'
