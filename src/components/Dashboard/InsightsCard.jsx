/**
 * InsightsCard Component
 * Panel de insights con IA (visual, basado en el diseño)
 */

import Card from '../common/Card'
import './InsightsCard.css'

const InsightsCard = () => {
    return (
        <Card variant="gradient" className="insights-card" padding="medium">
            <div className="insights-card__content">
                <div className="insights-card__badge">
                    <span className="insights-card__badge-dot"></span>
                    <span>Alta Precisión</span>
                </div>

                <div className="insights-card__visual">
                    <div className="insights-card__rings">
                        <div className="insights-card__ring insights-card__ring--outer"></div>
                        <div className="insights-card__ring insights-card__ring--middle"></div>
                        <div className="insights-card__ring insights-card__ring--inner"></div>
                        <div className="insights-card__core">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 2a10 10 0 0 1 9.5 7" />
                                <circle cx="12" cy="12" r="4" />
                            </svg>
                        </div>
                    </div>

                    <div className="insights-card__percentage">
                        <span className="insights-card__percentage-badge">+12%</span>
                        <span className="insights-card__percentage-label">Productividad</span>
                    </div>
                </div>

                <div className="insights-card__info">
                    <h4 className="insights-card__title">Smart AI Insights</h4>
                    <p className="insights-card__description">
                        Tu productividad ha mejorado un 12% esta semana
                    </p>
                </div>
            </div>
        </Card>
    )
}

export default InsightsCard
