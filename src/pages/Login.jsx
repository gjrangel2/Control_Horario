/**
 * Login Page
 * Página de inicio de sesión
 */

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Card from '../components/common/Card'
import './Login.css'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const { login, isDemoMode } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const result = await login(email, password)

        if (result.success) {
            navigate('/')
        } else {
            setError(result.error || 'Error al iniciar sesión')
        }

        setLoading(false)
    }

    const handleDemoLogin = async () => {
        setLoading(true)
        await login('demo@timetrack.app', 'demo123')
        navigate('/')
    }

    return (
        <div className="login-page">
            <div className="login-page__container">
                {/* Left Side - Branding */}
                <div className="login-page__branding">
                    <div className="login-page__logo">
                        <svg viewBox="0 0 60 60" fill="none">
                            <circle cx="30" cy="30" r="28" fill="url(#loginLogoGradient)" />
                            <circle cx="30" cy="30" r="18" fill="none" stroke="white" strokeWidth="2.5" />
                            <line x1="30" y1="30" x2="30" y2="16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                            <line x1="30" y1="30" x2="42" y2="30" stroke="white" strokeWidth="2" strokeLinecap="round" />
                            <circle cx="30" cy="30" r="3" fill="white" />
                            <defs>
                                <linearGradient id="loginLogoGradient" x1="0" y1="0" x2="60" y2="60">
                                    <stop offset="0%" stopColor="#20C997" />
                                    <stop offset="100%" stopColor="#12B886" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                    <h1 className="login-page__title">TimeTrack</h1>
                    <p className="login-page__subtitle">
                        Control inteligente de jornadas laborales
                    </p>

                    <div className="login-page__features">
                        <div className="login-page__feature">
                            <span className="login-page__feature-icon">⏱️</span>
                            <span>Registro fácil en 1 clic</span>
                        </div>
                        <div className="login-page__feature">
                            <span className="login-page__feature-icon">📊</span>
                            <span>Reportes visuales</span>
                        </div>
                        <div className="login-page__feature">
                            <span className="login-page__feature-icon">🔒</span>
                            <span>Seguridad garantizada</span>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="login-page__form-container">
                    <Card className="login-page__card" padding="large">
                        <div className="login-page__form-header">
                            <h2>Bienvenido de nuevo</h2>
                            <p>Ingresa tus credenciales para continuar</p>
                        </div>

                        {isDemoMode && (
                            <div className="login-page__demo-notice">
                                <span>🎭</span>
                                <div>
                                    <strong>Modo Demo Activo</strong>
                                    <p>Puedes usar cualquier credencial o hacer clic en "Entrar como Demo"</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="login-page__form">
                            <Input
                                label="Correo electrónico"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                                required
                                icon={
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                }
                            />

                            <Input
                                label="Contraseña"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                icon={
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                }
                            />

                            {error && (
                                <div className="login-page__error">
                                    {error}
                                </div>
                            )}

                            <div className="login-page__actions">
                                <Link to="/forgot-password" className="login-page__forgot">
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                fullWidth
                                size="large"
                                loading={loading}
                            >
                                Iniciar Sesión
                            </Button>

                            {isDemoMode && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    fullWidth
                                    size="large"
                                    onClick={handleDemoLogin}
                                >
                                    Entrar como Demo
                                </Button>
                            )}
                        </form>

                        <p className="login-page__register">
                            ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default Login
