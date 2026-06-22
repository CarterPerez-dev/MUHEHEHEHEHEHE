// ===================
// © AngelaMos | 2026
// index.tsx
// ===================

import { LuArrowLeft, LuPlus, LuTrash2 } from 'react-icons/lu'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDeleteEvaluation, useEvaluation } from '@/api/hooks'
import {
  CATEGORY_LABEL,
  type EvaluationCategory,
  type EvaluationRead,
  FINAL_SCORE_MAX,
} from '@/api/types'
import { ROUTES } from '@/config'
import styles from './result.module.scss'

const CATEGORY_ORDER: EvaluationCategory[] = [
  'open_source',
  'self_projects',
  'production',
  'technical_skills',
]

function formatIso(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toISOString().replace('T', ' ').slice(0, 19).concat(' UTC')
}

function pad(value: number, width: number): string {
  const rounded = Math.round(value)
  const sign = rounded < 0 ? '-' : ''
  return sign + String(Math.abs(rounded)).padStart(width, '0')
}

function topCategory(scores: EvaluationRead['scores']): EvaluationCategory {
  let best: EvaluationCategory = CATEGORY_ORDER[0]
  let bestRatio = -Infinity
  for (const key of CATEGORY_ORDER) {
    const { score, max } = scores[key]
    const ratio = max > 0 ? score / max : 0
    if (ratio > bestRatio) {
      bestRatio = ratio
      best = key
    }
  }
  return best
}

function ResultView({ data }: { data: EvaluationRead }): React.ReactElement {
  const navigate = useNavigate()
  const remove = useDeleteEvaluation()
  const highest = topCategory(data.scores)
  const githubAnalyzed = data.github !== null && typeof data.github === 'object'

  const handleDelete = (): void => {
    remove.mutate(data.id, {
      onSuccess: () => navigate(ROUTES.HISTORY),
    })
  }

  return (
    <div className={styles.page}>
      <div className={styles.topnav}>
        <Link to={ROUTES.HISTORY} className={styles.back}>
          <LuArrowLeft />
          HISTORY
        </Link>
        <div className={styles.topActions}>
          <Link to={ROUTES.EVALUATE} className={styles.newBtn}>
            <LuPlus />
            NEW EVALUATION
          </Link>
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={handleDelete}
            disabled={remove.isPending}
          >
            <LuTrash2 />
            DELETE
          </button>
        </div>
      </div>

      <header className={styles.spec}>
        <div className={styles.specRow}>
          <span className={styles.specKey}>FILE</span>
          <span className={styles.specVal}>{data.filename}</span>
        </div>
        <div className={styles.specRow}>
          <span className={styles.specKey}>CANDIDATE</span>
          <span className={styles.specVal}>
            {data.candidate_name ?? 'UNRESOLVED'}
          </span>
        </div>
        <div className={styles.specRow}>
          <span className={styles.specKey}>MODEL</span>
          <span className={styles.specMono}>{data.model_used}</span>
        </div>
        <div className={styles.specRow}>
          <span className={styles.specKey}>STATUS</span>
          <span className={styles.specMono}>{data.status.toUpperCase()}</span>
        </div>
        <div className={styles.specRow}>
          <span className={styles.specKey}>CREATED</span>
          <span className={styles.specMono}>{formatIso(data.created_at)}</span>
        </div>
        <div className={styles.specRow}>
          <span className={styles.specKey}>SERIAL</span>
          <span className={styles.specMono}>
            {data.id.slice(0, 8).toUpperCase()}
          </span>
        </div>
      </header>

      <section className={styles.hero}>
        <span className={styles.heroLabel}>{'// FINAL SCORE'}</span>
        <div className={styles.heroScore}>
          <span className={styles.heroNum}>{pad(data.final_score, 3)}</span>
          <span className={styles.heroMax}>/ {FINAL_SCORE_MAX}</span>
        </div>
      </section>

      <section className={styles.bars}>
        <span className={styles.sectionLabel}>{'// CATEGORY BREAKDOWN'}</span>
        {CATEGORY_ORDER.map((key, i) => {
          const { score, max, evidence } = data.scores[key]
          const ratio = max > 0 ? Math.max(0, Math.min(1, score / max)) : 0
          const isTop = key === highest
          return (
            <div key={key} className={styles.bar}>
              <div className={styles.barHead}>
                <span className={styles.barIndex}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className={styles.barName}>{CATEGORY_LABEL[key]}</span>
                <span className={styles.barScore}>
                  {pad(score, 2)} <span className={styles.barSlash}>/</span>{' '}
                  {pad(max, 2)}
                </span>
              </div>
              <div className={styles.track}>
                <div
                  className={`${styles.fill} ${isTop ? styles.fillTop : ''}`}
                  style={{ width: `${ratio * 100}%` }}
                />
              </div>
              {evidence.length > 0 && (
                <p className={styles.evidence}>{evidence}</p>
              )}
            </div>
          )
        })}
      </section>

      <section className={styles.adjust}>
        <div className={styles.adjustBlock}>
          <span className={styles.adjustLabel}>{'// BONUS'}</span>
          <span className={styles.adjustValueBonus}>
            +{pad(data.bonus_points.total, 2)}
          </span>
          <p className={styles.adjustText}>
            {data.bonus_points.breakdown.length > 0
              ? data.bonus_points.breakdown
              : 'No bonus applied.'}
          </p>
        </div>
        <div className={`${styles.adjustBlock} ${styles.adjustWarn}`}>
          <span className={styles.adjustLabel}>{'// DEDUCTIONS'}</span>
          <span className={styles.adjustValueDeduct}>
            &minus;{pad(Math.abs(data.deductions.total), 2)}
          </span>
          <p className={styles.adjustText}>
            {data.deductions.reasons.length > 0
              ? data.deductions.reasons
              : 'No deductions applied.'}
          </p>
        </div>
      </section>

      <section className={styles.lists}>
        <div className={styles.list}>
          <span className={styles.sectionLabel}>{'// KEY STRENGTHS'}</span>
          {data.key_strengths.length > 0 ? (
            <ol className={styles.listItems}>
              {data.key_strengths.map((item, i) => (
                <li key={item} className={styles.listItem}>
                  <span className={styles.listIndex}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className={styles.listText}>{item}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className={styles.empty}>None recorded.</p>
          )}
        </div>

        <div className={styles.list}>
          <span className={styles.sectionLabel}>
            {'// AREAS FOR IMPROVEMENT'}
          </span>
          {data.areas_for_improvement.length > 0 ? (
            <ol className={styles.listItems}>
              {data.areas_for_improvement.map((item, i) => (
                <li key={item} className={styles.listItem}>
                  <span className={`${styles.listIndex} ${styles.listIndexWarn}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className={styles.listText}>{item}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className={styles.empty}>None recorded.</p>
          )}
        </div>
      </section>

      {githubAnalyzed && (
        <p className={styles.github}>
          <span className={styles.githubDot} aria-hidden="true" />
          {'GITHUB PROFILE ANALYZED // SIGNALS INCLUDED IN SCORE'}
        </p>
      )}
    </div>
  )
}

export function Component(): React.ReactElement {
  const { id = '' } = useParams<{ id: string }>()
  const { data, isLoading, isError } = useEvaluation(id)

  if (isLoading) {
    return (
      <div className={styles.state}>
        <div className={styles.scan} aria-hidden="true" />
        <span className={styles.stateMono}>{'LOADING // EVALUATION'}</span>
      </div>
    )
  }

  if (isError || data === undefined) {
    return (
      <div className={styles.state}>
        <span className={styles.stateBig}>404</span>
        <span className={styles.stateMono}>EVALUATION NOT FOUND</span>
        <Link to={ROUTES.HISTORY} className={styles.stateLink}>
          RETURN TO HISTORY
        </Link>
      </div>
    )
  }

  return <ResultView data={data} />
}

Component.displayName = 'Result'
