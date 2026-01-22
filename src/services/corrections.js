/**
 * Corrections Service
 * Servicios para gestión de solicitudes de corrección
 */

import { callRpc, query, isDemoMode, getSupabaseClient } from './supabase'

// Estado demo
let demoCorrections = [
    {
        id: 'demo-1',
        session_id: 'demo-session-1',
        requested_by: 'demo-user',
        proposed_clock_in: '2026-01-20T09:00:00',
        proposed_clock_out: '2026-01-20T18:30:00',
        original_clock_in: '2026-01-20T09:15:00',
        original_clock_out: '2026-01-20T18:30:00',
        reason: 'Olvidé marcar entrada a tiempo',
        status: 'pending',
        created_at: '2026-01-21T10:00:00',
        profiles: { full_name: 'Usuario Demo', email: 'demo@timetrack.app' }
    }
]

/**
 * Crear solicitud de corrección
 */
export const createCorrectionRequest = async (data) => {
    if (isDemoMode()) {
        const newCorrection = {
            id: `demo-${Date.now()}`,
            session_id: data.session_id || 'demo-session',
            requested_by: data.user_id,
            proposed_clock_in: data.proposed_clock_in,
            proposed_clock_out: data.proposed_clock_out,
            original_clock_in: data.original_clock_in,
            original_clock_out: data.original_clock_out,
            reason: data.reason,
            status: 'pending',
            created_at: new Date().toISOString(),
            profiles: { full_name: 'Usuario Demo', email: 'demo@timetrack.app' }
        }
        demoCorrections.unshift(newCorrection)
        return newCorrection
    }

    const client = getSupabaseClient()
    const { data: result, error } = await client
        .from('correction_requests')
        .insert({
            session_id: data.session_id,
            requested_by: data.user_id,
            proposed_clock_in: data.proposed_clock_in,
            proposed_clock_out: data.proposed_clock_out,
            reason: data.reason
        })
        .select()
        .single()

    if (error) throw new Error(error.message)
    return result
}

/**
 * Obtener correcciones del usuario
 */
export const getUserCorrections = async (userId, status = null) => {
    if (isDemoMode()) {
        if (status) {
            return demoCorrections.filter(c => c.status === status)
        }
        return demoCorrections
    }

    const client = getSupabaseClient()
    let queryBuilder = client
        .from('correction_requests')
        .select('*, profiles:requested_by(full_name)')
        .eq('requested_by', userId)
        .order('created_at', { ascending: false })

    if (status) {
        queryBuilder = queryBuilder.eq('status', status)
    }

    const { data, error } = await queryBuilder
    if (error) throw new Error(error.message)
    return data || []
}

/**
 * Obtener todas las correcciones (admin)
 */
export const getAllCorrections = async (status = null) => {
    if (isDemoMode()) {
        if (status) {
            return demoCorrections.filter(c => c.status === status)
        }
        return demoCorrections
    }

    const client = getSupabaseClient()
    let queryBuilder = client
        .from('correction_requests')
        .select('*, profiles:requested_by(full_name), work_sessions(clock_in, clock_out)')
        .order('created_at', { ascending: false })

    if (status) {
        queryBuilder = queryBuilder.eq('status', status)
    }

    const { data, error } = await queryBuilder
    if (error) throw new Error(error.message)
    return data || []
}

/**
 * Aprobar corrección (admin/supervisor)
 */
export const approveCorrection = async (correctionId, reviewerId, comment = '') => {
    if (isDemoMode()) {
        const correction = demoCorrections.find(c => c.id === correctionId)
        if (correction) {
            correction.status = 'approved'
            correction.reviewed_by = reviewerId
            correction.reviewed_at = new Date().toISOString()
            correction.reviewer_comment = comment
        }
        return correction
    }

    const client = getSupabaseClient()
    const { data, error } = await client
        .from('correction_requests')
        .update({
            status: 'approved',
            reviewed_by: reviewerId,
            reviewed_at: new Date().toISOString(),
            reviewer_comment: comment
        })
        .eq('id', correctionId)
        .select()
        .single()

    if (error) throw new Error(error.message)
    return data
}

/**
 * Rechazar corrección (admin/supervisor)
 */
export const rejectCorrection = async (correctionId, reviewerId, comment = '') => {
    if (isDemoMode()) {
        const correction = demoCorrections.find(c => c.id === correctionId)
        if (correction) {
            correction.status = 'rejected'
            correction.reviewed_by = reviewerId
            correction.reviewed_at = new Date().toISOString()
            correction.reviewer_comment = comment
        }
        return correction
    }

    const client = getSupabaseClient()
    const { data, error } = await client
        .from('correction_requests')
        .update({
            status: 'rejected',
            reviewed_by: reviewerId,
            reviewed_at: new Date().toISOString(),
            reviewer_comment: comment
        })
        .eq('id', correctionId)
        .select()
        .single()

    if (error) throw new Error(error.message)
    return data
}

/**
 * Obtener lista de todos los usuarios (para admin)
 * Update: Incluye administradores también
 */
export const getAllUsers = async () => {
    if (isDemoMode()) {
        return [
            { id: 'demo-1', full_name: 'Juan Pérez', email: 'juan@example.com', role: 'employee' },
            { id: 'demo-2', full_name: 'María García', email: 'maria@example.com', role: 'employee' },
            { id: 'demo-3', full_name: 'Carlos López', email: 'carlos@example.com', role: 'employee' },
            { id: 'demo-admin', full_name: 'Admin User', email: 'admin@timetrack.app', role: 'admin' }
        ]
    }

    const client = getSupabaseClient()
    const { data, error } = await client
        .from('profiles')
        .select('id, full_name, email, role')
        .order('full_name')

    if (error) throw new Error(error.message)
    return data || []
}

export default {
    createCorrectionRequest,
    getUserCorrections,
    getAllCorrections,
    approveCorrection,
    rejectCorrection,
    getAllUsers
}
