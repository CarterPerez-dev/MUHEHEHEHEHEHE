// ===================
// © AngelaMos | 2026
// index.tsx
// ===================

import { useCallback, useRef, useState } from 'react'
import {
  LuArrowRight,
  LuFileText,
  LuHistory,
  LuUpload,
  LuX,
} from 'react-icons/lu'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useCreateEvaluation } from '@/api/hooks'
import { EVALUATION_CONSTRAINTS, EVALUATION_ERROR_MESSAGES } from '@/api/types'
import { ROUTES } from '@/config'
import styles from './evaluate.module.scss'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function validateFile(file: File): boolean {
  const isPdf =
    file.type === EVALUATION_CONSTRAINTS.ACCEPTED_MIME ||
    file.name.toLowerCase().endsWith('.pdf')
  if (!isPdf) {
    toast.error(EVALUATION_ERROR_MESSAGES.NOT_A_PDF)
    return false
  }
  if (file.size > EVALUATION_CONSTRAINTS.MAX_FILE_BYTES) {
    toast.error(EVALUATION_ERROR_MESSAGES.FILE_TOO_LARGE)
    return false
  }
  return true
}

export function Component(): React.ReactElement {
  const navigate = useNavigate()
  const create = useCreateEvaluation()
  const inputRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const acceptFile = useCallback((next: File): void => {
    if (validateFile(next)) {
      setFile(next)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent): void => {
      e.preventDefault()
      setIsDragging(false)
      const dropped = e.dataTransfer.files[0]
      if (dropped !== undefined) acceptFile(dropped)
    },
    [acceptFile]
  )

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const selected = e.target.files?.[0]
    if (selected !== undefined) acceptFile(selected)
  }

  const handleEvaluate = (): void => {
    if (file === null) return
    create.mutate(file, {
      onSuccess: (data) => {
        navigate(ROUTES.RESULT(data.id))
      },
    })
  }

  const isPending = create.isPending

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div>
          <span className={styles.kicker}>{'// EVALUATION ENGINE'}</span>
          <h1 className={styles.title}>EVALUATE</h1>
        </div>
        <Link to={ROUTES.HISTORY} className={styles.histLink}>
          <LuHistory />
          HISTORY
        </Link>
      </header>

      <p className={styles.explainer}>
        Drop a resume PDF. The model reads the document, scores demonstrated work
        across four categories, and returns a defensible total out of 120. One
        pass typically takes 10 to 90 seconds.
      </p>

      {isPending ? (
        <div className={styles.analyzing}>
          <div className={styles.scan} aria-hidden="true" />
          <span className={styles.analyzingFile}>{file?.name}</span>
          <span className={styles.analyzingStatus}>
            {'PARSING // SCORING...'}
          </span>
          <span className={styles.analyzingNote}>
            Do not close this tab. The model is reading the full document.
          </span>
        </div>
      ) : (
        <>
          <button
            type="button"
            className={`${styles.dropzone} ${isDragging ? styles.dragging : ''} ${file !== null ? styles.loaded : ''}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              className={styles.fileInput}
              onChange={handleSelect}
            />
            {file !== null ? (
              <div className={styles.fileCard}>
                <LuFileText className={styles.fileIcon} />
                <div className={styles.fileMeta}>
                  <span className={styles.fileName}>{file.name}</span>
                  <span className={styles.fileSize}>
                    {`PDF // ${formatBytes(file.size)}`}
                  </span>
                </div>
                <button
                  type="button"
                  className={styles.clearBtn}
                  aria-label="Remove file"
                  onClick={(e) => {
                    e.stopPropagation()
                    setFile(null)
                    if (inputRef.current !== null) inputRef.current.value = ''
                  }}
                >
                  <LuX />
                </button>
              </div>
            ) : (
              <div className={styles.dropInner}>
                <LuUpload className={styles.uploadIcon} />
                <span className={styles.dropText}>
                  DROP PDF OR CLICK TO SELECT
                </span>
                <span className={styles.dropHint}>
                  {'ACCEPTS // PDF · MAX // 10MB'}
                </span>
              </div>
            )}
          </button>

          <button
            type="button"
            className={styles.evaluateBtn}
            disabled={file === null}
            onClick={handleEvaluate}
          >
            EVALUATE
            <LuArrowRight />
          </button>
        </>
      )}
    </div>
  )
}

Component.displayName = 'Evaluate'
