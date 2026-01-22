/**
 * Sidebar Component
 * Navegación lateral de la aplicación
 */

import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Sidebar.css'

// Iconos SVG inline
const Icons = {
    Dashboard: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
    ),
    History: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    ),
    Reports: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
    ),
    Corrections: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
    ),
    Settings: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
    ),
    Help: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    ),
    Users: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    ),
    AI: () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
            <circle cx="7.5" cy="14.5" r="1.5" />
            <circle cx="16.5" cy="14.5" r="1.5" />
        </svg>
    )
}

const Sidebar = ({ isOpen, onClose }) => {
    const { profile, isDemoMode } = useAuth()
    const location = useLocation()

    const mainNavItems = [
        { path: '/', icon: Icons.Dashboard, label: 'Dashboard' },
        { path: '/history', icon: Icons.History, label: 'Historial' },
        { path: '/reports', icon: Icons.Reports, label: 'Reportes' },
        { path: '/corrections', icon: Icons.Corrections, label: 'Correcciones' }
    ]

    const adminNavItems = [
        { path: '/approvals', icon: Icons.Corrections, label: 'Aprobaciones' },
        { path: '/admin', icon: Icons.Users, label: 'Administración' }
    ]

    const supportNavItems = [
        { path: '/settings', icon: Icons.Settings, label: 'Configuración' },
        { path: '/help', icon: Icons.Help, label: 'Ayuda' }
    ]

    const isAdmin = profile?.role === 'admin' || profile?.role === 'supervisor'

    return (
        <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
            {/* Logo */}
            <div className="sidebar__logo">
                <div className="sidebar__logo-icon">
                    <svg viewBox="0 0 40 40" fill="none">
                        <circle cx="20" cy="20" r="18" fill="url(#logoGradient)" />
                        <circle cx="20" cy="20" r="12" fill="none" stroke="white" strokeWidth="2" />
                        <line x1="20" y1="20" x2="20" y2="10" stroke="white" strokeWidth="2" strokeLinecap="round" />
                        <line x1="20" y1="20" x2="28" y2="20" stroke="white" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="20" cy="20" r="2" fill="white" />
                        <defs>
                            <linearGradient id="logoGradient" x1="0" y1="0" x2="40" y2="40">
                                <stop offset="0%" stopColor="#20C997" />
                                <stop offset="100%" stopColor="#12B886" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
                <span className="sidebar__logo-text">TimeTrack</span>
            </div>

            {/* Search */}
            <div className="sidebar__search">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input type="text" placeholder="Buscar..." />
            </div>

            {/* Main Navigation */}
            <nav className="sidebar__nav">
                <div className="sidebar__nav-section">
                    <span className="sidebar__nav-label">Principal</span>
                    <ul className="sidebar__nav-list">
                        {mainNavItems.map(item => (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `sidebar__nav-item ${isActive ? 'sidebar__nav-item--active' : ''}`
                                    }
                                >
                                    <span className="sidebar__nav-icon">
                                        <item.icon />
                                    </span>
                                    <span className="sidebar__nav-text">{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>

                {isAdmin && (
                    <div className="sidebar__nav-section">
                        <span className="sidebar__nav-label">Administrar</span>
                        <ul className="sidebar__nav-list">
                            {adminNavItems.map(item => (
                                <li key={item.path}>
                                    <NavLink
                                        to={item.path}
                                        className={({ isActive }) =>
                                            `sidebar__nav-item ${isActive ? 'sidebar__nav-item--active' : ''}`
                                        }
                                    >
                                        <span className="sidebar__nav-icon">
                                            <item.icon />
                                        </span>
                                        <span className="sidebar__nav-text">{item.label}</span>
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="sidebar__nav-section">
                    <span className="sidebar__nav-label">Soporte</span>
                    <ul className="sidebar__nav-list">
                        {supportNavItems.map(item => (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `sidebar__nav-item ${isActive ? 'sidebar__nav-item--active' : ''}`
                                    }
                                >
                                    <span className="sidebar__nav-icon">
                                        <item.icon />
                                    </span>
                                    <span className="sidebar__nav-text">{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>

            {/* AI Promo Card */}
            <div className="sidebar__promo">
                <div className="sidebar__promo-icon">
                    <Icons.AI />
                </div>
                <h4>Smart Insights</h4>
                <p>Descubre patrones en tu jornada laboral</p>
                <button className="sidebar__promo-btn">Explorar</button>
            </div>

            {/* Demo Mode Badge */}
            {isDemoMode && (
                <div className="sidebar__demo-badge">
                    <span>🎭 Modo Demo</span>
                </div>
            )}
        </aside>
    )
}

export default Sidebar
