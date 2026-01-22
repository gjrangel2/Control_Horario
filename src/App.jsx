/**
 * App Component
 * Router principal de la aplicación
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SessionProvider } from './context/SessionContext'
import AppLayout from './components/Layout/AppLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import Reports from './pages/Reports'
import Corrections from './pages/Corrections'
import Settings from './pages/Settings'

// Ruta protegida
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth()

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
                <p>Cargando...</p>
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return children
}

// Layout wrapper que pasa el título de la página
const LayoutWrapper = () => {
    return <AppLayout />
}

function App() {
    return (
        <BrowserRouter basename={import.meta.env.BASE_URL}>
            <AuthProvider>
                <SessionProvider>
                    <Routes>
                        {/* Rutas públicas */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Rutas protegidas */}
                        <Route path="/" element={
                            <ProtectedRoute>
                                <LayoutWrapper />
                            </ProtectedRoute>
                        }>
                            <Route index element={<Dashboard />} />
                            <Route path="history" element={<History />} />
                            <Route path="reports" element={<Reports />} />
                            <Route path="corrections" element={<Corrections />} />
                            <Route path="approvals" element={<Corrections view="approvals" />} />
                            <Route path="settings" element={<Settings />} />
                            <Route path="admin" element={<Dashboard />} />
                            <Route path="help" element={<Settings />} />
                        </Route>

                        {/* Redirigir rutas no encontradas */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </SessionProvider>
            </AuthProvider>
        </BrowserRouter>
    )
}

export default App
