// ===================
// © AngelaMos | 2026
// Logo.tsx
// ===================

import styles from './logo.module.scss'
import { StarMark } from './StarMark'

interface LogoProps {
  starSize?: number
  className?: string
}

// The MERIT lockup: signal-red sparkle + bold uppercase wordmark with a tight
// negative tracking. The wordmark is grayscale; the mark carries the accent.
export function Logo({
  starSize = 18,
  className,
}: LogoProps): React.ReactElement {
  return (
    <span
      className={
        className !== undefined ? `${styles.logo} ${className}` : styles.logo
      }
    >
      <StarMark size={starSize} className={styles.mark} />
      <span className={styles.word}>SHADOW-WIZARD-MONEY-GANG</span>
    </span>
  )
}

Logo.displayName = 'Logo'
