// ===================
// © AngelaMos | 2026
// index.tsx
// ===================

import { useState } from 'react'
import { LuEye, LuEyeOff } from 'react-icons/lu'
import { toast } from 'sonner'
import { useChangePassword } from '@/api/hooks'
import { passwordChangeRequestSchema } from '@/api/types'
import { useUser } from '@/core/lib'
import styles from './settings.module.scss'

export function Component(): React.ReactElement {
  const user = useUser()
  const changePassword = useChangePassword()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()

    const result = passwordChangeRequestSchema.safeParse({
      current_password: currentPassword,
      new_password: newPassword,
    })

    if (!result.success) {
      const firstError = result.error.issues[0]
      toast.error(firstError.message)
      return
    }

    changePassword.mutate(result.data, {
      onSuccess: () => {
        setCurrentPassword('')
        setNewPassword('')
      },
    })
  }

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <span className={styles.kicker}>{'// ACCOUNT CONFIG'}</span>
        <h1 className={styles.title}>SETTINGS</h1>
      </header>

      <section className={styles.block}>
        <span className={styles.blockLabel}>{'// IDENTITY'}</span>
        <div className={styles.idRow}>
          <span className={styles.idKey}>EMAIL</span>
          <span className={styles.idVal}>{user?.email ?? 'UNKNOWN'}</span>
        </div>
        <div className={styles.idRow}>
          <span className={styles.idKey}>ROLE</span>
          <span className={styles.idMono}>
            {(user?.role ?? 'unknown').toUpperCase()}
          </span>
        </div>
      </section>

      <section className={styles.block}>
        <span className={styles.blockLabel}>{'// CHANGE PASSWORD'}</span>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="currentPassword">
              Current Password
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="currentPassword"
                type={showCurrent ? 'text' : 'password'}
                className={styles.input}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowCurrent(!showCurrent)}
                aria-label={showCurrent ? 'Hide password' : 'Show password'}
              >
                {showCurrent ? <LuEyeOff /> : <LuEye />}
              </button>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="newPassword">
              New Password
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="newPassword"
                type={showNew ? 'text' : 'password'}
                className={styles.input}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowNew(!showNew)}
                aria-label={showNew ? 'Hide password' : 'Show password'}
              >
                {showNew ? <LuEyeOff /> : <LuEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={styles.submit}
            disabled={changePassword.isPending}
          >
            {changePassword.isPending ? 'UPDATING...' : 'UPDATE PASSWORD'}
          </button>
        </form>
      </section>
    </div>
  )
}

Component.displayName = 'Settings'
