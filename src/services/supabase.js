/**
 * Supabase Client Wrapper
 * Abstracción agnóstica de dependencias para Supabase
 * 
 * Nota: Para modo demo, este wrapper incluye un mock que simula
 * las operaciones sin conexión a Supabase real.
 */

import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase - reemplazar con valores reales
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key'

// Cliente de Supabase real (para producción)
let supabaseClient = null

/**
 * Obtiene el cliente de Supabase (singleton)
 */
export const getSupabaseClient = () => {
    if (!supabaseClient && SUPABASE_URL !== 'https://demo.supabase.co') {
        supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true
            }
        })
    }
    return supabaseClient
}

/**
 * Verifica si estamos en modo demo
 */
export const isDemoMode = () => {
    return SUPABASE_URL === 'https://demo.supabase.co'
}

/**
 * Wrapper para llamadas RPC
 */
export const callRpc = async (functionName, params = {}) => {
    const client = getSupabaseClient()

    if (!client) {
        throw new Error('Supabase client not configured. Running in demo mode.')
    }

    const { data, error } = await client.rpc(functionName, params)

    if (error) {
        throw new Error(`RPC Error (${functionName}): ${error.message}`)
    }

    return data
}

/**
 * Wrapper para consultas SELECT
 */
export const query = async (table, options = {}) => {
    const client = getSupabaseClient()

    if (!client) {
        throw new Error('Supabase client not configured. Running in demo mode.')
    }

    let queryBuilder = client.from(table).select(options.select || '*')

    if (options.eq) {
        Object.entries(options.eq).forEach(([column, value]) => {
            queryBuilder = queryBuilder.eq(column, value)
        })
    }

    if (options.order) {
        queryBuilder = queryBuilder.order(options.order.column, { ascending: options.order.ascending ?? false })
    }

    if (options.limit) {
        queryBuilder = queryBuilder.limit(options.limit)
    }

    const { data, error } = await queryBuilder

    if (error) {
        throw new Error(`Query Error (${table}): ${error.message}`)
    }

    return data
}

export default {
    getSupabaseClient,
    isDemoMode,
    callRpc,
    query
}
