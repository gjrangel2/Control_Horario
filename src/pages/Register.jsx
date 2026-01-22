/**
 * Register Page
 * Página de registro de usuarios con selección de rol
 */

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Card from '../components/common/Card'
import './Register.css'

const Register = () => {
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [role, setRole] = useState('employee')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const { register, isDemoMode } = useAuth()
    const navigate = useNavigate()

    const validateForm = () => {
        if (!fullName.trim()) {
            setError('Por favor ingresa tu nombre completo')
            return false
        }
        if (!email.trim()) {
            setError('Por favor ingresa tu correo electrónico')
            return false
        }
        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres')
            return false
        }
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden')
            return false
        }
        return true
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!validateForm()) return

        setLoading(true)

        const result = await register(email, password, fullName, role)

        if (result.success) {
            if (isDemoMode) {
                navigate('/')
            } else {
                setSuccess(true)
            }
        } else {
            setError(result.error || 'Error al registrar usuario')
        }

        setLoading(false)
    }

    if (success) {
        return (
            <div className="register-page">
                <div className="register-page__container">
                    <Card className="register-page__success-card" padding="large">
                        <div className="register-page__success">
                            <div className="register-page__success-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                            </div>
                            <h2>¡Registro exitoso!</h2>
                            <p>
                                Hemos enviado un correo de verificación a <strong>{email}</strong>.
                                Por favor revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
                            </p>
                            <Button variant="primary" onClick={() => navigate('/login')}>
                                Ir a Iniciar Sesión
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="register-page">
            <div className="register-page__container">
                {/* Left Side - Branding */}
                <div className="register-page__branding">
                    <div className="register-page__logo">
                        <svg viewBox="0 0 60 60" fill="none">
                            <circle cx="30" cy="30" r="28" fill="url(#registerLogoGradient)" />
                            <circle cx="30" cy="30" r="18" fill="none" stroke="white" strokeWidth="2.5" />
                            <line x1="30" y1="30" x2="30" y2="16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                            <line x1="30" y1="30" x2="42" y2="30" stroke="white" strokeWidth="2" strokeLinecap="round" />
                            <circle cx="30" cy="30" r="3" fill="white" />
                            <defs>
                                <linearGradient id="registerLogoGradient" x1="0" y1="0" x2="60" y2="60">
                                    <stop offset="0%" stopColor="#20C997" />
                                    <stop offset="100%" stopColor="#12B886" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                    <h1 className="register-page__title">TimeTrack</h1>
                    <p className="register-page__subtitle">
                        Únete y toma el control de tu tiempo
                    </p>

                    <div className="register-page__benefits">
                        <div className="register-page__benefit">
                            <span className="register-page__benefit-check">✓</span>
                            <span>Registro de jornada en 1 clic</span>
                        </div>
                        <div className="register-page__benefit">
                            <span className="register-page__benefit-check">✓</span>
                            <span>Reportes automáticos</span>
                        </div>
                        <div className="register-page__benefit">
                            <span className="register-page__benefit-check">✓</span>
                            <span>Gestión de pausas y correcciones</span>
                        </div>
                        <div className="register-page__benefit">
                            <span className="register-page__benefit-check">✓</span>
                            <span>Acceso desde cualquier dispositivo</span>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="register-page__form-container">
                    <Card className="register-page__card" padding="large">
                        <div className="register-page__form-header">
                            <h2>Crear cuenta</h2>
                            <p>Ingresa tus datos para registrarte</p>
                        </div>

                        {isDemoMode && (
                            <div className="register-page__demo-notice">
                                <span>🎭</span>
                                <div>
                                    <strong>Modo Demo Activo</strong>
                                    <p>El registro simulará la creación de cuenta</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="register-page__form">
                            <Input
                                label="Nombre completo"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Juan Pérez"
                                required
                                icon={
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                }
                            />

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

                            {/* Role Selector */}
                            <div className="register-page__role-section">
                                <label className="register-page__role-label">Tipo de cuenta</label>
                                <div className="register-page__role-options">
                                    <label className={`register-page__role-option ${role === 'employee' ? 'register-page__role-option--active' : ''}`}>
                                        <input
                                            type="radio"
                                            name="role"
                                            value="employee"
                                            checked={role === 'employee'}
                                            onChange={(e) => setRole(e.target.value)}
                                        />
                                        <div className="register-page__role-content">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                <circle cx="12" cy="7" r="4" />
                                            </svg>
                                            <span className="register-page__role-name">Empleado</span>
                                            <span className="register-page__role-desc">Registrar jornadas y solicitar correcciones</span>
                                        </div>
                                    </label>
                                    <label className={`register-page__role-option ${role === 'admin' ? 'register-page__role-option--active' : ''}`}>
                                        <input
                                            type="radio"
                                            name="role"
                                            value="admin"
                                            checked={role === 'admin'}
                                            onChange={(e) => setRole(e.target.value)}
                                        />
                                        <div className="register-page__role-content">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                                <circle cx="9" cy="7" r="4" />
                                                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                            </svg>
                                            <span className="register-page__role-name">Administrador</span>
                                            <span className="register-page__role-desc">Gestionar empleados y aprobar correcciones</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <Input
                                label="Contraseña"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Mínimo 6 caracteres"
                                required
                                icon={
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                }
                            />

                            <Input
                                label="Confirmar contraseña"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repite tu contraseña"
                                required
                                icon={
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                }
                            />

                            {error && (
                                <div className="register-page__error">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                variant="primary"
                                fullWidth
                                size="large"
                                loading={loading}
                            >
                                Crear Cuenta
                            </Button>
                        </form>

                        <p className="register-page__login">
                            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default Register
