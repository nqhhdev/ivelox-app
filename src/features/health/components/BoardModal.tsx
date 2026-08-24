import type { ReactNode } from 'react'

export function BoardModal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  return (
    <div className="grg-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="grg-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grg-modal__head">
          <h2>{title}</h2>
          <button type="button" className="grg-btn grg-btn--ghost" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="grg-modal__body">{children}</div>
      </div>
    </div>
  )
}
