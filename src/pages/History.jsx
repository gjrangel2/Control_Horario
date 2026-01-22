/**
 * History Page
 * Historial de sesiones de trabajo
 */

import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import timeTrackingService from '../services/timeTracking'
import reportsService from '../services/reports'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import './History.css'

const History = () => {
    const { profile } = useAuth()
    const [sessions, setSessions] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('week') // week, month, all

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const data = await timeTrackingService.getSessionHistory(profile?.id, {
                    limit: filter === 'week' ? 7 : filter === 'month' ? 30 : 100
                })
                setSessions(data)
            } catch (err) {
                console.error('Error loading history:', err)
            } finally {
                setLoading(false)
            }
        }

        loadHistory()
    }, [profile?.id, filter])

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('es-ES', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        })
    }

    const formatTime = (dateStr) => {
        return new Date(dateStr).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getStatusBadge = (status) => {
        const statusMap = {
            open: { label: 'En curso', class: 'history__status--open' },
            closed: { label: 'Completado', class: 'history__status--closed' },
            corrected: { label: 'Corregido', class: 'history__status--corrected' },
            auto_closed: { label: 'Cierre auto', class: 'history__status--auto' }
        }
        const s = statusMap[status] || { label: status, class: '' }
        return <span className={`history__status ${s.class}`}>{s.label}</span>
    }

    return (
        <div className="history">
            <div className="history__header">
                <div>
                    <h2 className="history__title">Historial de Sesiones</h2>
                    <p className="history__subtitle">Revisa tus registros de jornada</p>
                </div>

                <div className="history__filters">
                    <Button
                        variant={filter === 'week' ? 'primary' : 'ghost'}
                        size="small"
                        onClick={() => setFilter('week')}
                    >
                        Semana
                    </Button>
                    <Button
                        variant={filter === 'month' ? 'primary' : 'ghost'}
                        size="small"
                        onClick={() => setFilter('month')}
                    >
                        Mes
                    </Button>
                    <Button
                        variant={filter === 'all' ? 'primary' : 'ghost'}
                        size="small"
                        onClick={() => setFilter('all')}
                    >
                        Todo
                    </Button>
                </div>
            </div>

            <Card padding="none">
                <div className="history__table-container">
                    <table className="history__table">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Entrada</th>
                                <th>Salida</th>
                                <th>Pausas</th>
                                <th>Neto</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="history__skeleton-row">
                                        <td><div className="history__skeleton-cell"></div></td>
                                        <td><div className="history__skeleton-cell"></div></td>
                                        <td><div className="history__skeleton-cell"></div></td>
                                        <td><div className="history__skeleton-cell"></div></td>
                                        <td><div className="history__skeleton-cell"></div></td>
                                        <td><div className="history__skeleton-cell"></div></td>
                                    </tr>
                                ))
                            ) : sessions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="history__empty">
                                        <div className="history__empty-content">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <circle cx="12" cy="12" r="10" />
                                                <polyline points="12 6 12 12 16 14" />
                                            </svg>
                                            <p>No hay sesiones registradas</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                sessions.map((session) => (
                                    <tr key={session.id}>
                                        <td className="history__date">{formatDate(session.clock_in)}</td>
                                        <td>{formatTime(session.clock_in)}</td>
                                        <td>{session.clock_out ? formatTime(session.clock_out) : '—'}</td>
                                        <td>{reportsService.formatMinutesToTime(session.total_break_minutes || 0)}</td>
                                        <td className="history__net">
                                            {reportsService.formatMinutesToTime(session.total_work_minutes || 0)}
                                        </td>
                                        <td>{getStatusBadge(session.status)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}

export default History
