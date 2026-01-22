/**
 * ClockActions Component
 * Botones de entrada/salida/pausa
 */

import { useState } from 'react'
import { useSession } from '../../context/SessionContext'
import Button from '../common/Button'
import './ClockActions.css'

const ClockActions = () => {
    const {
        activeSession,
        activeBreak,
        isWorking,
        isOnBreak,
        clockIn,
        clockOut,
        startBreak,
        endBreak,
        formattedElapsedTime,
        formattedBreakTime
    } = useSession()

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleClockIn = async () => {
        setLoading(true)
        setError(null)

        const result = await clockIn()

        if (!result.success) {
            setError(result.error)
        }

        setLoading(false)
    }

    const handleClockOut = async () => {
        setLoading(true)
        setError(null)

        const result = await clockOut()

        if (!result.success) {
            setError(result.error)
        }

        setLoading(false)
    }

    const handleToggleBreak = async () => {
        setLoading(true)
        setError(null)

        const result = activeBreak ? await endBreak() : await startBreak()

        if (!result.success) {
            setError(result.error)
        }

        setLoading(false)
    }

    // No hay sesión activa
    if (!activeSession) {
        return (
            <div className="clock-actions">
                <div className="clock-actions__main">
                    <Button
                        variant="primary"
                        size="large"
                        fullWidth
                        onClick={handleClockIn}
                        loading={loading}
                        icon={
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                                <polyline points="10 17 15 12 10 7" />
                                <line x1="15" y1="12" x2="3" y2="12" />
                            </svg>
                        }
                    >
                        Marcar Entrada
                    </Button>
                </div>

                <p className="clock-actions__hint">
                    Haz clic para iniciar tu jornada laboral
                </p>

                {error && <p className="clock-actions__error">{error}</p>}
            </div>
        )
    }

    // Sesión activa
    return (
        <div className="clock-actions clock-actions--active">
            {/* Timer Display */}
            <div className="clock-actions__timer">
                <div className={`clock-actions__timer-display ${isOnBreak ? 'clock-actions__timer-display--break' : ''}`}>
                    <span className="clock-actions__timer-label">
                        {isOnBreak ? 'Tiempo de pausa' : 'Tiempo trabajado'}
                    </span>
                    <span className="clock-actions__timer-value">
                        {isOnBreak ? formattedBreakTime : formattedElapsedTime}
                    </span>
                </div>

                {isOnBreak && (
                    <div className="clock-actions__timer-work">
                        <span>Trabajado: {formattedElapsedTime}</span>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="clock-actions__buttons">
                <Button
                    variant={isOnBreak ? 'warning' : 'secondary'}
                    size="medium"
                    onClick={handleToggleBreak}
                    loading={loading}
                    icon={
                        isOnBreak ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="6" y="4" width="4" height="16" />
                                <rect x="14" y="4" width="4" height="16" />
                            </svg>
                        )
                    }
                >
                    {isOnBreak ? 'Continuar' : 'Pausar'}
                </Button>

                <Button
                    variant="danger"
                    size="medium"
                    onClick={handleClockOut}
                    loading={loading}
                    icon={
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                    }
                >
                    Marcar Salida
                </Button>
            </div>

            {error && <p className="clock-actions__error">{error}</p>}
        </div>
    )
}

export default ClockActions
