/**
 * Button Component
 * Botón reutilizable con múltiples variantes
 */

import './Button.css'

const Button = ({
    children,
    variant = 'primary',
    size = 'medium',
    fullWidth = false,
    disabled = false,
    loading = false,
    icon = null,
    iconPosition = 'left',
    onClick,
    type = 'button',
    className = '',
    ...props
}) => {
    const classNames = [
        'btn',
        `btn--${variant}`,
        `btn--${size}`,
        fullWidth && 'btn--full',
        disabled && 'btn--disabled',
        loading && 'btn--loading',
        icon && !children && 'btn--icon-only',
        className
    ].filter(Boolean).join(' ')

    return (
        <button
            type={type}
            className={classNames}
            disabled={disabled || loading}
            onClick={onClick}
            {...props}
        >
            {loading && (
                <span className="btn__spinner">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" opacity="0.25" />
                        <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                    </svg>
                </span>
            )}

            {!loading && icon && iconPosition === 'left' && (
                <span className="btn__icon btn__icon--left">{icon}</span>
            )}

            {children && <span className="btn__text">{children}</span>}

            {!loading && icon && iconPosition === 'right' && (
                <span className="btn__icon btn__icon--right">{icon}</span>
            )}
        </button>
    )
}

export default Button
