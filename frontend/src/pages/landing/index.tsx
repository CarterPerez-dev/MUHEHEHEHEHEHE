// ===================
// © AngelaMos | 2026
// index.tsx
// ===================

import { LuArrowRight, LuArrowUpRight } from 'react-icons/lu'
import { Link } from 'react-router-dom'
import { StarMark } from '@/components'
import { ROUTES } from '@/config'
import { useIsAuthenticated } from '@/core/lib'
import styles from './landing.module.scss'

const METRICS = [
  { label: 'Open Source', value: '035' },
  { label: 'Self Projects', value: '030' },
  { label: 'Production', value: '025' },
  { label: 'Tech Skills', value: '010' },
] as const

export function Component(): React.ReactElement {
  const isAuthenticated = useIsAuthenticated()

  return (
    <div className={styles.page}>
      <div className={styles.frame}>
        <header className={styles.topbar}>
          <span className={styles.serial}>{'SERIAL // 0069'}</span>
          <span className={styles.topMid}>RESUME EVALUATION ENGINE</span>
          <span className={styles.ver}>VER 6.7</span>
        </header>

        <main className={styles.hero}>
          <div className={styles.heroLeft}>
            <span className={styles.kicker}>
              <StarMark size={11} className={styles.kickerMark} />
              ENGINEERING MERITOCRACY
            </span>

            <h1 className={styles.wordmark}>
              BA
              <span className={styles.star}>
                <StarMark size={64} title="BALLS" />
              </span>
              LLS
            </h1>

            <p className={styles.lede}>Resumes, scored on demonstrated work.</p>

            <p className={styles.sub}>
              Upload a PDF. An evaluation model reads the actual evidence —
              open-source contributions, shipped projects, production scars, raw
              technical depth — and returns a single, defensible score out of 120.
            </p>

            <div className={styles.actions}>
              {isAuthenticated ? (
                <Link to={ROUTES.EVALUATE} className={styles.primary}>
                  ENTER ENGINE
                  <LuArrowRight />
                </Link>
              ) : (
                <>
                  <Link to={ROUTES.REGISTER} className={styles.primary}>
                    CREATE ACCESS
                    <LuArrowRight />
                  </Link>
                  <Link to={ROUTES.LOGIN} className={styles.secondary}>
                    SIGN IN
                  </Link>
                </>
              )}
            </div>
          </div>

          <aside className={styles.heroRight}>
            <span className={styles.specHead}>{'// SCORING RUBRIC'}</span>
            <ul className={styles.metrics}>
              {METRICS.map((m, i) => (
                <li key={m.label} className={styles.metric}>
                  <span className={styles.metricIndex}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className={styles.metricLabel}>{m.label}</span>
                  <span className={styles.metricValue}>{m.value}</span>
                </li>
              ))}
              <li className={`${styles.metric} ${styles.metricTotal}`}>
                <span className={styles.metricIndex}>{'//'}</span>
                <span className={styles.metricLabel}>Max Score</span>
                <span className={styles.metricValueAccent}>120</span>
              </li>
            </ul>
            <p className={styles.note}>
              Bonus is additive. Deductions subtract. The final number can run
              negative.
            </p>
          </aside>
        </main>

        <footer className={styles.footer}>
          <span className={styles.barcode} aria-hidden="true" />
          <span className={styles.footMono}>{'MODEL // GEMINI-2.5-FLASH'}</span>
          <a
            href="/api/docs"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footLink}
          >
            API SPEC
            <LuArrowUpRight />
          </a>
        </footer>
      </div>
    </div>
  )
}

Component.displayName = 'Landing'
