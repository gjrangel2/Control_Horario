/**
 * Auth Context Provider
 * Gestión de estado de autenticación global
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { isDemoMode } from '../services/supabase'
import authService from '../services/auth'

const AuthContext = createContext(null)

// Usuario demo para pruebas
const DEMO_USER = {
    id: 'demo-user-001',
    email: 'demo@timetrack.app',
    full_name: 'Usuario Demo',
    role: 'employee',
    team_id: null,
    timezone: 'America/Bogota'
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Verificar sesión al cargar
    useEffect(() => {
        const initAuth = async () => {
            try {
                if (isDemoMode()) {
                    // En modo demo, iniciamos como usuario demo
                    setUser(DEMO_USER)
                    setProfile(DEMO_USER)
                    setLoading(false)
                    return
                }

                const session = await authService.getCurrentSession()
                if (session?.user) {
                    setUser(session.user)
                    // Aquí cargaríamos el perfil desde Supabase
                }
            } catch (err) {
                console.error('Error inicializando auth:', err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        initAuth()

        // Escuchar cambios de auth
        const subscription = authService.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                setUser(session.user)
            } else if (event === 'SIGNED_OUT') {
                setUser(null)
                setProfile(null)
            }
        })

        return () => {
            subscription?.unsubscribe?.()
        }
    }, [])

    const login = useCallback(async (email, password) => {
        setError(null)
        setLoading(true)

        try {
            if (isDemoMode()) {
                setUser({ ...DEMO_USER, email })
                setProfile({ ...DEMO_USER, email })
                return { success: true }
            }

            const { user } = await authService.signIn(email, password)
            setUser(user)
            return { success: true }
        } catch (err) {
            setError(err.message)
            return { success: false, error: err.message }
        } finally {
            setLoading(false)
        }
    }, [])

    const register = useCallback(async (email, password, fullName) => {
        setError(null)
        setLoading(true)

        try {
            await authService.signUp(email, password, fullName)
            return { success: true }
        } catch (err) {
            setError(err.message)
            return { success: false, error: err.message }
        } finally {
            setLoading(false)
        }
    }, [])

    const logout = useCallback(async () => {
        try {
            await authService.signOut()
            setUser(null)
            setProfile(null)
        } catch (err) {
            console.error('Error al cerrar sesión:', err)
        }
    }, [])

    const resetPassword = useCallback(async (email) => {
        setError(null)

        try {
            await authService.resetPassword(email)
            return { success: true }
        } catch (err) {
            setError(err.message)
            return { success: false, error: err.message }
        }
    }, [])

    const value = {
        user,
        profile: profile || user,
        loading,
        error,
        isAuthenticated: !!user,
        isDemoMode: isDemoMode(),
        login,
        register,
        logout,
        resetPassword
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider')
    }
    return context
}

export default AuthContext
