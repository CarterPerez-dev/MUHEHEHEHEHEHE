// ===================
// © AngelaMos | 2026
// index.tsx
// ===================

import { useState } from 'react'
import { LuArrowRight, LuChevronLeft, LuChevronRight } from 'react-icons/lu'
import { Link } from 'react-router-dom'
import { useEvaluations } from '@/api/hooks'
import { FINAL_SCORE_MAX } from '@/api/types'
import { ROUTES } from '@/config'
import styles from './history.module.scss'

const PAGE_SIZE = 20

function formatDate(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toISOString().slice(0, 10)
}

function pad(value: number, width: number): string {
  const rounded = Math.round(value)
  const sign = rounded < 0 ? '-' : ''
  return sign + String(Math.abs(rounded)).padStart(width, '0')
}

export function Component(): React.ReactElement {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useEvaluations(page, PAGE_SIZE)

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div>
          <span className={styles.kicker}>{'// EVALUATION LOG'}</span>
          <h1 className={styles.title}>HISTORY</h1>
        </div>
        <span className={styles.count}>{`TOTAL // ${pad(total, 4)}`}</span>
      </header>

      {isLoading ? (
        <div className={styles.loading}>
          <span className={styles.loadingMono}>{'LOADING // LOG'}</span>
        </div>
      ) : items.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyBig}>EMPTY</span>
          <span className={styles.emptyMono}>NO EVALUATIONS YET</span>
          <Link to={ROUTES.EVALUATE} className={styles.emptyCta}>
            RUN FIRST EVALUATION
            <LuArrowRight />
          </Link>
        </div>
      ) : (
        <>
          <div className={styles.tableHead}>
            <span className={styles.colIndex}>#</span>
            <span className={styles.colName}>CANDIDATE / FILE</span>
            <span className={styles.colModel}>MODEL</span>
            <span className={styles.colDate}>DATE</span>
            <span className={styles.colScore}>SCORE</span>
          </div>

          <ol className={styles.rows}>
            {items.map((item, i) => (
              <li key={item.id}>
                <Link to={ROUTES.RESULT(item.id)} className={styles.row}>
                  <span className={styles.colIndex}>
                    {pad((page - 1) * PAGE_SIZE + i + 1, 2)}
                  </span>
                  <span className={styles.colName}>
                    <span className={styles.rowName}>
                      {item.candidate_name ?? item.filename}
                    </span>
                    {item.candidate_name !== null && (
                      <span className={styles.rowFile}>{item.filename}</span>
                    )}
                  </span>
                  <span className={styles.colModel}>{item.model_used}</span>
                  <span className={styles.colDate}>
                    {formatDate(item.created_at)}
                  </span>
                  <span className={styles.colScore}>
                    <span className={styles.scoreNum}>
                      {pad(item.final_score, 3)}
                    </span>
                    <span className={styles.scoreMax}>/ {FINAL_SCORE_MAX}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>

          {totalPages > 1 && (
            <div className={styles.pager}>
              <button
                type="button"
                className={styles.pagerBtn}
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <LuChevronLeft />
                PREV
              </button>
              <span className={styles.pagerStatus}>
                {pad(page, 2)} / {pad(totalPages, 2)}
              </span>
              <button
                type="button"
                className={styles.pagerBtn}
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                NEXT
                <LuChevronRight />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

Component.displayName = 'History'
