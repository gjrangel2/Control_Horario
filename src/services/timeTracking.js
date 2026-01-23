/**
 * Time Tracking Service
 * Servicios de control horario - todas las operaciones via RPC
 */

import { callRpc, query, isDemoMode } from './supabase'

// Estado local para modo demo
let demoState = {
    activeSession: null,
    sessions: [],
    breaks: []
}

/**
 * Genera ID único para modo demo
 */
const generateId = () => `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

/**
 * Marcar entrada (clock in)
 * RF-03: Solo via RPC, timestamp del servidor
 */
export const clockIn = async (userId) => {
    if (isDemoMode()) {
        if (demoState.activeSession) {
            throw new Error('Ya tienes una sesión activa')
        }

        const session = {
            id: generateId(),
            user_id: userId,
            clock_in: new Date().toISOString(),
            clock_out: null,
            status: 'open',
            total_break_minutes: 0,
            total_work_minutes: 0,
            created_at: new Date().toISOString()
        }

        demoState.activeSession = session
        demoState.sessions.unshift(session)

        return session
    }

    return await callRpc('rpc_clock_in')
}

/**
 * Marcar salida (clock out)
 * RF-04: Solo via RPC, timestamp del servidor
 */
export const clockOut = async (userId) => {
    if (isDemoMode()) {
        if (!demoState.activeSession) {
            throw new Error('No tienes una sesión activa')
        }

        const now = new Date()
        const clockIn = new Date(demoState.activeSession.clock_in)
        const totalMinutes = Math.floor((now - clockIn) / 60000)
        const netMinutes = totalMinutes - demoState.activeSession.total_break_minutes

        demoState.activeSession.clock_out = now.toISOString()
        demoState.activeSession.status = 'closed'
        demoState.activeSession.total_work_minutes = netMinutes

        const closedSession = { ...demoState.activeSession }
        demoState.activeSession = null

        return closedSession
    }

    return await callRpc('rpc_clock_out')
}

/**
 * Iniciar pausa
 * RF-06: Solo via RPC, timestamp del servidor
 */
export const startBreak = async (sessionId) => {
    if (isDemoMode()) {
        if (!demoState.activeSession) {
            throw new Error('No tienes una sesión activa')
        }

        const activeBreak = demoState.breaks.find(
            b => b.session_id === sessionId && !b.break_end
        )

        if (activeBreak) {
            throw new Error('Ya tienes una pausa activa')
        }

        const breakRecord = {
            id: generateId(),
            session_id: sessionId,
            break_start: new Date().toISOString(),
            break_end: null,
            created_at: new Date().toISOString()
        }

        demoState.breaks.push(breakRecord)

        return breakRecord
    }

    return await callRpc('rpc_break_start')
}

/**
 * Finalizar pausa
 * RF-06: Solo via RPC, timestamp del servidor
 */
export const endBreak = async (sessionId) => {
    if (isDemoMode()) {
        const activeBreak = demoState.breaks.find(
            b => b.session_id === sessionId && !b.break_end
        )

        if (!activeBreak) {
            throw new Error('No tienes una pausa activa')
        }

        const now = new Date()
        const breakStart = new Date(activeBreak.break_start)
        const breakMinutes = Math.floor((now - breakStart) / 60000)

        activeBreak.break_end = now.toISOString()

        if (demoState.activeSession) {
            demoState.activeSession.total_break_minutes += breakMinutes
        }

        return activeBreak
    }

    return await callRpc('rpc_break_end')
}

/**
 * Obtener sesión activa del usuario
 */
export const getActiveSession = async (userId) => {
    if (isDemoMode()) {
        return demoState.activeSession
    }

    const sessions = await query('work_sessions', {
        eq: { user_id: userId, status: 'open' },
        limit: 1
    })

    return sessions?.[0] || null
}

/**
 * Obtener pausa activa de una sesión
 */
export const getActiveBreak = async (sessionId) => {
    if (isDemoMode()) {
        return demoState.breaks.find(
            b => b.session_id === sessionId && !b.break_end
        ) || null
    }

    const breaks = await query('breaks', {
        eq: { session_id: sessionId },
        order: { column: 'created_at', ascending: false },
        limit: 1
    })

    const latestBreak = breaks?.[0]
    return latestBreak && !latestBreak.break_end ? latestBreak : null
}

/**
 * Obtener historial de sesiones
 */
if (isDemoMode()) {
    // Mock data for specific users
    if (userId === 'demo-1') { // Juan Perez
        return [
            { id: 's1', clock_in: '2026-01-20T08:00:00', clock_out: '2026-01-20T17:00:00', status: 'closed', total_work_minutes: 480, total_break_minutes: 60 },
            { id: 's2', clock_in: '2026-01-21T08:15:00', clock_out: '2026-01-21T17:30:00', status: 'closed', total_work_minutes: 495, total_break_minutes: 60 }
        ]
    }
    if (userId === 'demo-2') { // Maria Garcia
        return [
            { id: 's3', clock_in: '2026-01-21T09:00:00', clock_out: '2026-01-21T18:00:00', status: 'closed', total_work_minutes: 480, total_break_minutes: 60 }
        ]
    }
    return demoState.sessions // Return accumulated sessions for current user
}

return await query('work_sessions', {
    eq: { user_id: userId },
    order: { column: 'clock_in', ascending: false },
    limit: options.limit || 30
})
}

/**
 * Obtener pausas de una sesión
 */
export const getSessionBreaks = async (sessionId) => {
    if (isDemoMode()) {
        return demoState.breaks.filter(b => b.session_id === sessionId)
    }

    return await query('breaks', {
        eq: { session_id: sessionId },
        order: { column: 'break_start', ascending: true }
    })
}

/**
 * Resetear estado demo (para testing)
 */
export const resetDemoState = () => {
    demoState = {
        activeSession: null,
        sessions: [],
        breaks: []
    }
}

export default {
    clockIn,
    clockOut,
    startBreak,
    endBreak,
    getActiveSession,
    getActiveBreak,
    getSessionHistory,
    getSessionBreaks,
    resetDemoState
}
