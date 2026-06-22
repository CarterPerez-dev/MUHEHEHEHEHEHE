// ===================
// © AngelaMos | 2026
// StarMark.tsx
// ===================

interface StarMarkProps {
  size?: number
  color?: string
  className?: string
  title?: string
}

// A four-point concave sparkle -- the MERIT brand mark. The midpoints of each
// edge pull toward the center, giving the pinched, needle-pointed star seen
// floating alone on the black canvas of the reference posters.
export function StarMark({
  size = 24,
  color = 'var(--star-color, hsl(9, 88%, 55%))',
  className,
  title,
}: StarMarkProps): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      fill={color}
      role={title !== undefined ? 'img' : 'presentation'}
      aria-hidden={title === undefined ? true : undefined}
      aria-label={title}
    >
      {title !== undefined ? <title>{title}</title> : null}
      <path d="M50 0 C53 32 68 47 100 50 C68 53 53 68 50 100 C47 68 32 53 0 50 C32 47 47 32 50 0 Z" />
    </svg>
  )
}

StarMark.displayName = 'StarMark'
