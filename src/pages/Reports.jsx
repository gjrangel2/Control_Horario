/**
 * Reports Page
 * Reportes con filtros y gráficos
 */

import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import reportsService from '../services/reports'
import timeTrackingService from '../services/timeTracking'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import './Reports.css'

const Reports = () => {
    const { profile } = useAuth()
    const [monthlyStats, setMonthlyStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [exporting, setExporting] = useState(false)
    const [selectedMonth, setSelectedMonth] = useState(new Date())

    useEffect(() => {
        const loadReports = async () => {
            try {
                const data = await reportsService.getMonthlyStats(profile?.id, selectedMonth)
                setMonthlyStats(data)
            } catch (err) {
                console.error('Error loading reports:', err)
            } finally {
                setLoading(false)
            }
        }

        loadReports()
    }, [profile?.id, selectedMonth])

    const handleExport = async () => {
        setExporting(true)

        try {
            // Obtener historial de sesiones
            const sessions = await timeTrackingService.getSessionHistory(profile?.id, { limit: 100 })

            // Generar cabeceras CSV
            const headers = ['Fecha', 'Entrada', 'Salida', 'Pausas (min)', 'Neto (min)', 'Estado']

            // Generar filas
            const rows = sessions.map(session => {
                const clockIn = new Date(session.clock_in)
                const clockOut = session.clock_out ? new Date(session.clock_out) : null

                return [
                    clockIn.toLocaleDateString('es-ES'),
                    clockIn.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                    clockOut ? clockOut.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : 'En curso',
                    session.total_break_minutes || 0,
                    session.total_work_minutes || 0,
                    session.status === 'open' ? 'Abierta' :
                        session.status === 'closed' ? 'Cerrada' :
                            session.status === 'auto_closed' ? 'Cierre automático' : session.status
                ].join(',')
            })

            // Combinar todo
            const csvContent = [headers.join(','), ...rows].join('\n')

            // Agregar BOM para Excel
            const BOM = '\uFEFF'
            const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })

            // Crear link de descarga
            const link = document.createElement('a')
            const url = URL.createObjectURL(blob)
            link.setAttribute('href', url)
            link.setAttribute('download', `reporte_${new Date().toISOString().split('T')[0]}.csv`)
            link.style.visibility = 'hidden'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)

        } catch (err) {
            console.error('Error exporting CSV:', err)
            alert('Error al exportar. Por favor intenta de nuevo.')
        } finally {
            setExporting(false)
        }
    }

    return (
        <div className="reports">
            <div className="reports__header">
                <div>
                    <h2 className="reports__title">Reportes</h2>
                    <p className="reports__subtitle">Análisis detallado de tu jornada laboral</p>
                </div>

                <Button
                    variant="outline"
                    loading={exporting}
                    icon={
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                    }
                    onClick={handleExport}
                >
                    {exporting ? 'Exportando...' : 'Exportar CSV'}
                </Button>
            </div>

            {/* Monthly Summary */}
            <div className="reports__grid">
                <Card padding="medium" className="reports__summary-card">
                    <h3>Resumen Mensual</h3>
                    <p className="reports__month">{monthlyStats?.month || 'Cargando...'}</p>

                    <div className="reports__stats">
                        <div className="reports__stat">
                            <span className="reports__stat-value">
                                {reportsService.formatMinutesToTime(monthlyStats?.totalNetMinutes || 0)}
                            </span>
                            <span className="reports__stat-label">Total trabajado</span>
                        </div>

                        <div className="reports__stat">
                            <span className="reports__stat-value">{monthlyStats?.workDays || 0}</span>
                            <span className="reports__stat-label">Días trabajados</span>
                        </div>

                        <div className="reports__stat">
                            <span className="reports__stat-value">
                                {reportsService.formatMinutesToTime(monthlyStats?.averageNetMinutes || 0)}
                            </span>
                            <span className="reports__stat-label">Promedio diario</span>
                        </div>

                        <div className="reports__stat">
                            <span className="reports__stat-value">
                                {reportsService.formatMinutesToTime(monthlyStats?.totalBreakMinutes || 0)}
                            </span>
                            <span className="reports__stat-label">Total pausas</span>
                        </div>
                    </div>
                </Card>

                <Card padding="medium" variant="gradient" className="reports__highlight-card">
                    <div className="reports__highlight-content">
                        <div className="reports__highlight-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                                <polyline points="17 6 23 6 23 12" />
                            </svg>
                        </div>
                        <div>
                            <h4>Productividad del mes</h4>
                            <span className="reports__highlight-value">94%</span>
                            <p>Basado en objetivos de 8h/día</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Info Card */}
            <Card padding="medium">
                <div className="reports__info">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    <div>
                        <h4>Exportación CSV</h4>
                        <p>Haz clic en "Exportar CSV" para descargar un archivo con el historial de todas tus sesiones de trabajo.
                            El archivo se puede abrir en Excel o Google Sheets.</p>
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default Reports
