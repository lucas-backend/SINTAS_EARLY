export function Skeleton({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-radius-md bg-line-200 motion-reduce:animate-none ${className}`}
    />
  )
}