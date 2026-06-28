import Link from 'next/link'

type EmptyStateProps = {
  title: string
  description: string
  action?: { label: string; href: string }
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="mk-empty">
      <h3>{title}</h3>
      <p>{description}</p>
      {action && (
        <Link href={action.href} className="mk-btn-primary">
          {action.label}
        </Link>
      )}
    </div>
  )
}
