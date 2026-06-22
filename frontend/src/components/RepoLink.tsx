// ===================
// © AngelaMos | 2026
// RepoLink.tsx
// ===================

import { LuGithub } from 'react-icons/lu'
import styles from './repo-link.module.scss'

const REPO_URL = 'https://github.com/CarterPerez-dev/MUHEHEHEHEHEHE'

export function RepoLink(): React.ReactElement {
  return (
    <a
      className={styles.repo}
      href={REPO_URL}
      target="_blank"
      rel="noreferrer"
    >
      <LuGithub className={styles.icon} />
      <span className={styles.label}>SOURCE</span>
    </a>
  )
}
