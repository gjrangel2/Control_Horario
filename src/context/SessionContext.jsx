/**
 * Session Context Provider
 * Gestión de estado de sesión de trabajo activa
 */

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from './AuthContext'
import timeTrackingService from '../services/timeTracking'

const SessionContext = createContext(null)

export const SessionProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth()

    const [activeSession, setActiveSession] = useState(null)
    const [activeBreak, setActiveBreak] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [elapsedTime, setElapsedTime] = useState(0)
    const [breakTime, setBreakTime] = useState(0)

    const timerRef = useRef(null)
    const breakTimerRef = useRef(null)

    // Cargar sesión activa al autenticar
    useEffect(() => {
        const loadActiveSession = async () => {
            if (!isAuthenticated || !user) {
                setLoading(false)
                return
            }

            try {
                const session = await timeTrackingService.getActiveSession(user.id)
                if (session) {
                    setActiveSession(session)

                    // Verificar si hay pausa activa
                    const breakRecord = await timeTrackingService.getActiveBreak(session.id)
                    setActiveBreak(breakRecord)
                }
            } catch (err) {
                console.error('Error cargando sesión:', err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        loadActiveSession()
    }, [isAuthenticated, user])

    // Timer para sesión activa
    useEffect(() => {
        if (activeSession && !activeSession.clock_out) {
            const startTime = new Date(activeSession.clock_in).getTime()

            const updateElapsed = () => {
                const now = Date.now()
                const totalSeconds = Math.floor((now - startTime) / 1000)
                const breakSeconds = (activeSession.total_break_minutes || 0) * 60
                setElapsedTime(totalSeconds - breakSeconds)
            }

            updateElapsed()
            timerRef.current = setInterval(updateElapsed, 1000)

            return () => {
                if (timerRef.current) {
                    clearInterval(timerRef.current)
                }
            }
        } else {
            setElapsedTime(0)
        }
    }, [activeSession])

    // Timer para pausa activa
    useEffect(() => {
        if (activeBreak && !activeBreak.break_end) {
            const startTime = new Date(activeBreak.break_start).getTime()

            const updateBreakTime = () => {
                const now = Date.now()
                setBreakTime(Math.floor((now - startTime) / 1000))
            }

            updateBreakTime()
            breakTimerRef.current = setInterval(updateBreakTime, 1000)

            return () => {
                if (breakTimerRef.current) {
                    clearInterval(breakTimerRef.current)
                }
            }
        } else {
            setBreakTime(0)
        }
    }, [activeBreak])

    const clockIn = useCallback(async () => {
        if (!user) return { success: false, error: 'No autenticado' }

        setError(null)

        try {
            const session = await timeTrackingService.clockIn(user.id)
            setActiveSession(session)
            return { success: true, session }
        } catch (err) {
            setError(err.message)
            return { success: false, error: err.message }
        }
    }, [user])

    const clockOut = useCallback(async () => {
        if (!user) return { success: false, error: 'No autenticado' }

        setError(null)

        try {
            // Si hay pausa activa, finalizarla primero
            if (activeBreak) {
                await timeTrackingService.endBreak(activeSession.id)
                setActiveBreak(null)
            }

            const session = await timeTrackingService.clockOut(user.id)
            setActiveSession(null)
            return { success: true, session }
        } catch (err) {
            setError(err.message)
            return { success: false, error: err.message }
        }
    }, [user, activeSession, activeBreak])

    const startBreak = useCallback(async () => {
        if (!activeSession) return { success: false, error: 'No hay sesión activa' }

        setError(null)

        try {
            const breakRecord = await timeTrackingService.startBreak(activeSession.id)
            setActiveBreak(breakRecord)
            return { success: true, break: breakRecord }
        } catch (err) {
            setError(err.message)
            return { success: false, error: err.message }
        }
    }, [activeSession])

    const endBreak = useCallback(async () => {
        if (!activeSession || !activeBreak) return { success: false, error: 'No hay pausa activa' }

        setError(null)

        try {
            const breakRecord = await timeTrackingService.endBreak(activeSession.id)
            setActiveBreak(null)

            // Actualizar minutos de pausa en la sesión local
            const breakMinutes = Math.floor(breakTime / 60)
            setActiveSession(prev => ({
                ...prev,
                total_break_minutes: (prev.total_break_minutes || 0) + breakMinutes
            }))

            return { success: true, break: breakRecord }
        } catch (err) {
            setError(err.message)
            return { success: false, error: err.message }
        }
    }, [activeSession, activeBreak, breakTime])

    // Formatear tiempo a HH:MM:SS
    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600)
        const mins = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60

        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const value = {
        activeSession,
        activeBreak,
        loading,
        error,
        elapsedTime,
        breakTime,
        formattedElapsedTime: formatTime(elapsedTime),
        formattedBreakTime: formatTime(breakTime),
        isWorking: !!activeSession && !activeBreak,
        isOnBreak: !!activeBreak,
        clockIn,
        clockOut,
        startBreak,
        endBreak
    }

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    )
}

export const useSession = () => {
    const context = useContext(SessionContext)
    if (!context) {
        throw new Error('useSession debe usarse dentro de un SessionProvider')
    }
    return context
}

export default SessionContext
