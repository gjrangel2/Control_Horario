/**
 * Header Component
 * Barra superior con usuario y acciones
 */

import { useAuth } from '../../context/AuthContext'
import { useSession } from '../../context/SessionContext'
import './Header.css'

const Header = ({ title = 'Dashboard', onMenuClick }) => {
    const { profile, logout, isDemoMode } = useAuth()
    const { isWorking, isOnBreak } = useSession()

    const getStatusBadge = () => {
        if (isOnBreak) {
            return <span className="header__status header__status--break">En Pausa</span>
        }
        if (isWorking) {
            return <span className="header__status header__status--working">Trabajando</span>
        }
        return <span className="header__status header__status--idle">Disponible</span>
    }

    const getInitials = (name) => {
        if (!name) return 'U'
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    return (
        <header className="header">
            <div className="header__left">
                {/* Mobile Menu Trigger */}
                <button
                    className="header__menu-btn"
                    aria-label="Abrir menú"
                    onClick={onMenuClick}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                </button>
                <h1 className="header__title">{title}</h1>
            </div>

            <div className="header__right">
                {/* Status Badge */}
                {getStatusBadge()}

                {/* Notifications */}
                <button className="header__icon-btn" aria-label="Notificaciones">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    <span className="header__notification-dot"></span>
                </button>

                {/* User Menu */}
                <div className="header__user">
                    <div className="header__user-avatar">
                        {getInitials(profile?.full_name)}
                    </div>
                    <div className="header__user-info">
                        <span className="header__user-name">{profile?.full_name || 'Usuario'}</span>
                        <span className="header__user-email">{profile?.email || ''}</span>
                    </div>
                    <button className="header__user-dropdown" aria-label="Menú de usuario" onClick={logout}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </button>
                </div>
            </div>
        </header>
    )
}

export default Header
