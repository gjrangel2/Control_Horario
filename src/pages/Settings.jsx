/**
 * Settings Page
 * Configuración de usuario
 */

import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { useAuth } from '../context/AuthContext'
import './Settings.css'

const Settings = () => {
    const { profile, isDemoMode } = useAuth()

    return (
        <div className="settings">
            <div className="settings__header">
                <h2 className="settings__title">Configuración</h2>
                <p className="settings__subtitle">Personaliza tu experiencia en TimeTrack</p>
            </div>

            <div className="settings__grid">
                {/* Profile Section */}
                <Card padding="medium">
                    <h3 className="settings__section-title">Perfil</h3>

                    <div className="settings__avatar-section">
                        <div className="settings__avatar">
                            {profile?.full_name?.charAt(0) || 'U'}
                        </div>
                        <Button variant="outline" size="small">Cambiar foto</Button>
                    </div>

                    <div className="settings__form">
                        <Input
                            label="Nombre completo"
                            value={profile?.full_name || ''}
                            disabled={isDemoMode}
                        />
                        <Input
                            label="Correo electrónico"
                            type="email"
                            value={profile?.email || ''}
                            disabled
                        />
                        <Input
                            label="Zona horaria"
                            value={profile?.timezone || 'America/Bogota'}
                            disabled={isDemoMode}
                        />
                    </div>

                    <div className="settings__actions">
                        <Button variant="primary" disabled={isDemoMode}>
                            Guardar cambios
                        </Button>
                    </div>
                </Card>

                {/* Notifications */}
                <Card padding="medium">
                    <h3 className="settings__section-title">Notificaciones</h3>

                    <div className="settings__options">
                        <div className="settings__option">
                            <div>
                                <span className="settings__option-label">Recordatorio de entrada</span>
                                <span className="settings__option-desc">Notificar si no has marcado entrada</span>
                            </div>
                            <label className="settings__toggle">
                                <input type="checkbox" defaultChecked />
                                <span className="settings__toggle-slider"></span>
                            </label>
                        </div>

                        <div className="settings__option">
                            <div>
                                <span className="settings__option-label">Resumen diario</span>
                                <span className="settings__option-desc">Enviar resumen al finalizar el día</span>
                            </div>
                            <label className="settings__toggle">
                                <input type="checkbox" />
                                <span className="settings__toggle-slider"></span>
                            </label>
                        </div>

                        <div className="settings__option">
                            <div>
                                <span className="settings__option-label">Alertas de correcciones</span>
                                <span className="settings__option-desc">Notificar cuando se apruebe o rechace</span>
                            </div>
                            <label className="settings__toggle">
                                <input type="checkbox" defaultChecked />
                                <span className="settings__toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </Card>

                {/* App Info */}
                <Card padding="medium" className="settings__info-card">
                    <h3 className="settings__section-title">Información</h3>

                    <div className="settings__info-list">
                        <div className="settings__info-item">
                            <span>Versión</span>
                            <span>1.0.0</span>
                        </div>
                        <div className="settings__info-item">
                            <span>Modo</span>
                            <span className="settings__info-badge">
                                {isDemoMode ? '🎭 Demo' : '🚀 Producción'}
                            </span>
                        </div>
                        <div className="settings__info-item">
                            <span>Backend</span>
                            <span>Supabase</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}

export default Settings
