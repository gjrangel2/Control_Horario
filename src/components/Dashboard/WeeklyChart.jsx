/**
 * WeeklyChart Component
 * Gráfico de barras de horas trabajadas por día de la semana
 */

import { useEffect, useState } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { useAuth } from '../../context/AuthContext'
import reportsService from '../../services/reports'
import Card from '../common/Card'
import './WeeklyChart.css'

// Registrar componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const WeeklyChart = ({ userId }) => {
    const { user } = useAuth()
    const targetUserId = userId || user?.id
    const [weeklyData, setWeeklyData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            if (!targetUserId) return

            try {
                const data = await reportsService.getWeeklyStats(targetUserId)
                setWeeklyData(data)
            } catch (err) {
                console.error('Error loading weekly stats:', err)
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [targetUserId])

    const chartData = {
        labels: weeklyData?.days?.map(d => d.dayName.charAt(0).toUpperCase() + d.dayName.slice(1)) || [],
        datasets: [
            {
                label: 'Horas trabajadas',
                data: weeklyData?.days?.map(d => Number((d.netMinutes / 60).toFixed(1))) || [],
                backgroundColor: weeklyData?.days?.map((_, i) =>
                    i === new Date().getDay() - 1
                        ? 'rgba(32, 201, 151, 1)'
                        : 'rgba(32, 201, 151, 0.4)'
                ) || [],
                borderRadius: 8,
                borderSkipped: false,
                barThickness: 40,
                maxBarThickness: 50
            }
        ]
    }

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(33, 37, 41, 0.9)',
                padding: 12,
                titleFont: {
                    size: 14,
                    weight: '600'
                },
                bodyFont: {
                    size: 13
                },
                cornerRadius: 8,
                displayColors: false,
                callbacks: {
                    label: (context) => `${context.parsed.y} horas`
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        size: 12,
                        weight: '500'
                    },
                    color: '#868E96'
                }
            },
            y: {
                beginAtZero: true,
                max: 10,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                },
                ticks: {
                    font: {
                        size: 12
                    },
                    color: '#868E96',
                    callback: (value) => `${value}h`
                }
            }
        }
    }

    if (loading) {
        return (
            <Card className="weekly-chart" padding="medium">
                <div className="weekly-chart__skeleton">
                    <div className="weekly-chart__skeleton-header"></div>
                    <div className="weekly-chart__skeleton-bars">
                        {[...Array(7)].map((_, i) => (
                            <div
                                key={i}
                                className="weekly-chart__skeleton-bar"
                                style={{ height: `${30 + Math.random() * 60}%` }}
                            ></div>
                        ))}
                    </div>
                </div>
            </Card>
        )
    }

    return (
        <Card className="weekly-chart" padding="medium">
            <div className="weekly-chart__header">
                <div>
                    <h3 className="weekly-chart__title">Horas Semanales</h3>
                    <p className="weekly-chart__subtitle">
                        Total: {reportsService.formatMinutesToTime(weeklyData?.totalNetMinutes || 0)}
                    </p>
                </div>
                <div className="weekly-chart__badge">
                    Esta Semana
                </div>
            </div>

            <div className="weekly-chart__container">
                <Bar data={chartData} options={chartOptions} />
            </div>
        </Card>
    )
}

export default WeeklyChart
