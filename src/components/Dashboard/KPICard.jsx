/**
 * KPICard Component
 * Tarjeta de métrica/KPI con icono, valor y tendencia
 */

import Card from '../common/Card'
import './KPICard.css'

const KPICard = ({
    title,
    value,
    subtitle,
    icon,
    trend,
    trendValue,
    variant = 'default',
    loading = false
}) => {
    const getTrendIcon = () => {
        if (trend === 'up') {
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                </svg>
            )
        }
        if (trend === 'down') {
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="7" y1="7" x2="17" y2="17" />
                    <polyline points="17 7 17 17 7 17" />
                </svg>
            )
        }
        return null
    }

    if (loading) {
        return (
            <Card className={`kpi-card kpi-card--${variant}`} padding="medium">
                <div className="kpi-card__skeleton">
                    <div className="kpi-card__skeleton-icon"></div>
                    <div className="kpi-card__skeleton-content">
                        <div className="kpi-card__skeleton-line"></div>
                        <div className="kpi-card__skeleton-line kpi-card__skeleton-line--short"></div>
                    </div>
                </div>
            </Card>
        )
    }

    return (
        <Card className={`kpi-card kpi-card--${variant}`} padding="medium" hover>
            <div className="kpi-card__header">
                <span className="kpi-card__title">{title}</span>
                {trendValue && (
                    <span className={`kpi-card__trend kpi-card__trend--${trend}`}>
                        {getTrendIcon()}
                        <span>{trendValue}</span>
                    </span>
                )}
            </div>

            <div className="kpi-card__body">
                {icon && <div className="kpi-card__icon">{icon}</div>}
                <div className="kpi-card__content">
                    <span className="kpi-card__value">{value}</span>
                    {subtitle && <span className="kpi-card__subtitle">{subtitle}</span>}
                </div>
            </div>
        </Card>
    )
}

export default KPICard
