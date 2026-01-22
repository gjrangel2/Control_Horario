/**
 * Dashboard Page
 * Página principal con KPIs, acciones de marcación y gráficos
 */

import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSession } from '../context/SessionContext'
import reportsService from '../services/reports'
import KPICard from '../components/Dashboard/KPICard'
import ClockActions from '../components/Dashboard/ClockActions'
import WeeklyChart from '../components/Dashboard/WeeklyChart'
import InsightsCard from '../components/Dashboard/InsightsCard'
import Card from '../components/common/Card'
import UserSelector from '../components/common/UserSelector'
import './Dashboard.css'

// Iconos
const Icons = {
    Clock: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    ),
    Calendar: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    ),
    TrendUp: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
        </svg>
    ),
    Coffee: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
            <line x1="6" y1="1" x2="6" y2="4" />
            <line x1="10" y1="1" x2="10" y2="4" />
            <line x1="14" y1="1" x2="14" y2="4" />
        </svg>
    )
}

const Dashboard = () => {
    const { profile } = useAuth()
    const { activeSession, formattedElapsedTime } = useSession()

    // Admin state
    const [selectedUserId, setSelectedUserId] = useState(null)
    const isAdmin = profile?.role === 'admin'
    const targetUserId = selectedUserId || profile?.id
    const isViewingSelf = !selectedUserId || selectedUserId === profile?.id

    const [dailyStats, setDailyStats] = useState(null)
    const [weeklyStats, setWeeklyStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadStats = async () => {
            if (!targetUserId) return

            try {
                const [daily, weekly] = await Promise.all([
                    reportsService.getDailyStats(targetUserId),
                    reportsService.getWeeklyStats(targetUserId)
                ])
                setDailyStats(daily)
                setWeeklyStats(weekly)
            } catch (err) {
                console.error('Error loading stats:', err)
            } finally {
                setLoading(false)
            }
        }

        loadStats()
    }, [targetUserId])

    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return 'Buenos días'
        if (hour < 18) return 'Buenas tardes'
        return 'Buenas noches'
    }

    return (
        <div className="dashboard">
            {/* Welcome Section */}
            <div className="dashboard__welcome">
                <div>
                    <h2 className="dashboard__greeting">
                        {getGreeting()}, <span>{profile?.full_name?.split(' ')[0] || 'Usuario'}</span> 👋
                    </h2>
                    <p className="dashboard__date">
                        {new Date().toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>

                {isAdmin && (
                    <UserSelector
                        selectedUserId={selectedUserId}
                        onUserSelect={setSelectedUserId}
                    />
                )}
            </div>

            {/* KPI Cards */}
            <div className="dashboard__kpis">
                <KPICard
                    title="Horas Hoy"
                    value={isViewingSelf && activeSession
                        ? formattedElapsedTime.split(':').slice(0, 2).join(':')
                        : reportsService.formatMinutesToTime(dailyStats?.netMinutes || 0)
                    }
                    subtitle={isViewingSelf && activeSession ? 'En progreso' : 'Completado'}
                    icon={<Icons.Clock />}
                    variant="primary"
                    loading={loading}
                />

                <KPICard
                    title="Horas Semana"
                    value={reportsService.formatMinutesToTime(weeklyStats?.totalNetMinutes || 0)}
                    subtitle={`Promedio: ${reportsService.formatMinutesToTime(weeklyStats?.averageNetMinutes || 0)}/día`}
                    icon={<Icons.Calendar />}
                    trend="up"
                    trendValue="+8%"
                    loading={loading}
                />

                <KPICard
                    title="Pausas Hoy"
                    value={reportsService.formatMinutesToTime(dailyStats?.breakMinutes || 0)}
                    subtitle="Tiempo de descanso"
                    icon={<Icons.Coffee />}
                    loading={loading}
                />

                <KPICard
                    title="Productividad"
                    value="92%"
                    subtitle="Basado en objetivos"
                    icon={<Icons.TrendUp />}
                    variant="success"
                    trend="up"
                    trendValue="+5%"
                    loading={loading}
                />
            </div>

            {/* Main Content Grid */}
            <div className="dashboard__grid">
                {/* Clock Actions - Only visible for self */}
                {isViewingSelf && (
                    <div className="dashboard__clock-section">
                        <ClockActions />

                        {/* Quick Stats Card */}
                        <Card className="dashboard__quick-stats" padding="medium">
                            <h4>Resumen del día</h4>
                            <div className="dashboard__quick-stats-grid">
                                <div className="dashboard__quick-stat">
                                    <span className="dashboard__quick-stat-value">
                                        {dailyStats?.sessionsCount || 0}
                                    </span>
                                    <span className="dashboard__quick-stat-label">Sesiones</span>
                                </div>
                                <div className="dashboard__quick-stat">
                                    <span className="dashboard__quick-stat-value">
                                        {reportsService.formatMinutesToDecimal(dailyStats?.netMinutes || 0)}h
                                    </span>
                                    <span className="dashboard__quick-stat-label">Horas netas</span>
                                </div>
                                <div className="dashboard__quick-stat">
                                    <span className="dashboard__quick-stat-value">
                                        {reportsService.formatMinutesToDecimal(dailyStats?.breakMinutes || 0)}h
                                    </span>
                                    <span className="dashboard__quick-stat-label">Pausas</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {/* Weekly Chart */}
                <div className="dashboard__chart-section" style={{ gridColumn: !isViewingSelf ? '1 / -1' : 'auto' }}>
                    <WeeklyChart userId={targetUserId} />
                </div>

                {/* Insights Card */}
                {isViewingSelf && (
                    <div className="dashboard__insights-section">
                        <InsightsCard />
                    </div>
                )}
            </div>
        </div>
    )
}

export default Dashboard
