/**
 * Card Component
 * Tarjeta contenedora reutilizable
 */

import './Card.css'

const Card = ({
    children,
    variant = 'default',
    padding = 'medium',
    hover = false,
    onClick,
    className = '',
    ...props
}) => {
    const classNames = [
        'card',
        `card--${variant}`,
        `card--padding-${padding}`,
        hover && 'card--hover',
        onClick && 'card--clickable',
        className
    ].filter(Boolean).join(' ')

    return (
        <div
            className={classNames}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            {...props}
        >
            {children}
        </div>
    )
}

// Subcomponentes
Card.Header = ({ children, className = '', ...props }) => (
    <div className={`card__header ${className}`} {...props}>
        {children}
    </div>
)

Card.Title = ({ children, className = '', ...props }) => (
    <h3 className={`card__title ${className}`} {...props}>
        {children}
    </h3>
)

Card.Body = ({ children, className = '', ...props }) => (
    <div className={`card__body ${className}`} {...props}>
        {children}
    </div>
)

Card.Footer = ({ children, className = '', ...props }) => (
    <div className={`card__footer ${className}`} {...props}>
        {children}
    </div>
)

export default Card
