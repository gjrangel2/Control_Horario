/**
 * Reports Service
 * Servicios de reportes y estadísticas
 */

import { query, isDemoMode } from './supabase'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, parseISO, differenceInMinutes } from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Obtener estadísticas del día
 */
export const getDailyStats = async (userId, date = new Date()) => {
    if (isDemoMode()) {
        // Datos de demostración
        const simulatedMinutes = Math.floor(Math.random() * 480) // 0-8 horas
        const simulatedBreaks = Math.floor(Math.random() * 60)   // 0-60 mins pausas

        return {
            date: format(date, 'yyyy-MM-dd'),
            totalMinutes: simulatedMinutes,
            breakMinutes: simulatedBreaks,
            netMinutes: simulatedMinutes - simulatedBreaks,
            sessionsCount: simulatedMinutes > 0 ? 1 : 0
        }
    }

    const dateStr = format(date, 'yyyy-MM-dd')

    const sessions = await query('work_sessions', {
        eq: { user_id: userId },
        // En producción, agregar filtro por fecha
    })

    const daySessions = sessions.filter(s =>
        format(parseISO(s.clock_in), 'yyyy-MM-dd') === dateStr
    )

    const totalMinutes = daySessions.reduce((sum, s) => sum + (s.total_work_minutes || 0), 0)
    const breakMinutes = daySessions.reduce((sum, s) => sum + (s.total_break_minutes || 0), 0)

    return {
        date: dateStr,
        totalMinutes,
        breakMinutes,
        netMinutes: totalMinutes,
        sessionsCount: daySessions.length
    }
}

/**
 * Obtener estadísticas de la semana
 */
export const getWeeklyStats = async (userId, date = new Date()) => {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 }) // Lunes
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 })

    const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

    if (isDemoMode()) {
        // Datos de demostración con variación realista
        const demoData = days.map((day, index) => {
            const isWeekend = index >= 5
            const baseMinutes = isWeekend ? 0 : 420 + Math.floor(Math.random() * 120) // 7-9 horas
            const breakMins = isWeekend ? 0 : 30 + Math.floor(Math.random() * 30)

            return {
                date: format(day, 'yyyy-MM-dd'),
                dayName: format(day, 'EEE', { locale: es }),
                totalMinutes: baseMinutes,
                breakMinutes: breakMins,
                netMinutes: baseMinutes - breakMins
            }
        })

        const totalNet = demoData.reduce((sum, d) => sum + d.netMinutes, 0)

        return {
            weekStart: format(weekStart, 'yyyy-MM-dd'),
            weekEnd: format(weekEnd, 'yyyy-MM-dd'),
            days: demoData,
            totalNetMinutes: totalNet,
            averageNetMinutes: Math.floor(totalNet / 5) // Solo días laborales
        }
    }

    const dailyStats = await Promise.all(
        days.map(day => getDailyStats(userId, day))
    )

    const daysWithNames = dailyStats.map((stats, index) => ({
        ...stats,
        dayName: format(days[index], 'EEE', { locale: es })
    }))

    const totalNet = daysWithNames.reduce((sum, d) => sum + d.netMinutes, 0)

    return {
        weekStart: format(weekStart, 'yyyy-MM-dd'),
        weekEnd: format(weekEnd, 'yyyy-MM-dd'),
        days: daysWithNames,
        totalNetMinutes: totalNet,
        averageNetMinutes: Math.floor(totalNet / 5)
    }
}

/**
 * Obtener estadísticas del mes
 */
export const getMonthlyStats = async (userId, date = new Date()) => {
    const monthStart = startOfMonth(date)
    const monthEnd = endOfMonth(date)

    if (isDemoMode()) {
        // Resumen mensual demo
        const workDays = 22
        const avgMinutesPerDay = 450

        return {
            month: format(date, 'MMMM yyyy', { locale: es }),
            monthStart: format(monthStart, 'yyyy-MM-dd'),
            monthEnd: format(monthEnd, 'yyyy-MM-dd'),
            totalNetMinutes: workDays * avgMinutesPerDay,
            workDays,
            averageNetMinutes: avgMinutesPerDay,
            totalBreakMinutes: workDays * 45
        }
    }

    // Obtener resumen de sesiones del mes
    const sessions = await query('work_sessions', {
        eq: { user_id: userId }
    })

    const monthSessions = sessions.filter(s => {
        const sessionDate = parseISO(s.clock_in)
        return sessionDate >= monthStart && sessionDate <= monthEnd
    })

    const totalNet = monthSessions.reduce((sum, s) => sum + (s.total_work_minutes || 0), 0)
    const totalBreaks = monthSessions.reduce((sum, s) => sum + (s.total_break_minutes || 0), 0)
    const workDays = new Set(monthSessions.map(s => format(parseISO(s.clock_in), 'yyyy-MM-dd'))).size

    return {
        month: format(date, 'MMMM yyyy', { locale: es }),
        monthStart: format(monthStart, 'yyyy-MM-dd'),
        monthEnd: format(monthEnd, 'yyyy-MM-dd'),
        totalNetMinutes: totalNet,
        workDays,
        averageNetMinutes: workDays > 0 ? Math.floor(totalNet / workDays) : 0,
        totalBreakMinutes: totalBreaks
    }
}

/**
 * Formatear minutos a formato legible
 */
export const formatMinutesToTime = (minutes) => {
    if (!minutes || minutes < 0) return '0h 0m'

    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hours === 0) return `${mins}m`
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}m`
}

/**
 * Formatear minutos a horas decimales
 */
export const formatMinutesToDecimal = (minutes) => {
    if (!minutes || minutes < 0) return '0.00'
    return (minutes / 60).toFixed(2)
}

export default {
    getDailyStats,
    getWeeklyStats,
    getMonthlyStats,
    formatMinutesToTime,
    formatMinutesToDecimal
}
