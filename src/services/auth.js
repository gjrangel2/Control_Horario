/**
 * Authentication Service
 * Servicios de autenticación con Supabase Auth
 */

import { getSupabaseClient, isDemoMode } from './supabase'

/**
 * Iniciar sesión con email y contraseña
 */
export const signIn = async (email, password) => {
    if (isDemoMode()) {
        // Simular login en modo demo
        return {
            user: {
                id: 'demo-user-id',
                email: email,
                user_metadata: {
                    full_name: 'Usuario Demo'
                }
            },
            session: {
                access_token: 'demo-token'
            }
        }
    }

    const client = getSupabaseClient()
    const { data, error } = await client.auth.signInWithPassword({
        email,
        password
    })

    if (error) {
        throw new Error(`Error de autenticación: ${error.message}`)
    }

    return data
}

/**
 * Registrar nuevo usuario
 */
export const signUp = async (email, password, fullName) => {
    if (isDemoMode()) {
        return {
            user: {
                id: 'demo-user-id',
                email: email,
                user_metadata: {
                    full_name: fullName
                }
            }
        }
    }

    const client = getSupabaseClient()
    const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName
            }
        }
    })

    if (error) {
        throw new Error(`Error de registro: ${error.message}`)
    }

    return data
}

/**
 * Cerrar sesión
 */
export const signOut = async () => {
    if (isDemoMode()) {
        return { success: true }
    }

    const client = getSupabaseClient()
    const { error } = await client.auth.signOut()

    if (error) {
        throw new Error(`Error al cerrar sesión: ${error.message}`)
    }

    return { success: true }
}

/**
 * Recuperar contraseña
 */
export const resetPassword = async (email) => {
    if (isDemoMode()) {
        return { success: true }
    }

    const client = getSupabaseClient()
    const { error } = await client.auth.resetPasswordForEmail(email)

    if (error) {
        throw new Error(`Error al enviar correo de recuperación: ${error.message}`)
    }

    return { success: true }
}

/**
 * Obtener sesión actual
 */
export const getCurrentSession = async () => {
    if (isDemoMode()) {
        return null
    }

    const client = getSupabaseClient()
    const { data: { session } } = await client.auth.getSession()
    return session
}

/**
 * Obtener usuario actual
 */
export const getCurrentUser = async () => {
    if (isDemoMode()) {
        return null
    }

    const client = getSupabaseClient()
    const { data: { user } } = await client.auth.getUser()
    return user
}

/**
 * Escuchar cambios de autenticación
 */
export const onAuthStateChange = (callback) => {
    if (isDemoMode()) {
        return { unsubscribe: () => { } }
    }

    const client = getSupabaseClient()
    const { data: { subscription } } = client.auth.onAuthStateChange(callback)
    return subscription
}

export default {
    signIn,
    signUp,
    signOut,
    resetPassword,
    getCurrentSession,
    getCurrentUser,
    onAuthStateChange
}
