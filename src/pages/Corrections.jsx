/**
 * Corrections Page
 * Gestión de solicitudes de corrección - con vista admin y empleado
 */

import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import correctionsService from '../services/corrections'
import timeTrackingService from '../services/timeTracking'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Modal from '../components/common/Modal'
import './Corrections.css'

const Corrections = () => {
    const { profile } = useAuth()
    const isAdmin = profile?.role === 'admin'

    const [activeTab, setActiveTab] = useState('pending')
    const [corrections, setCorrections] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [sessions, setSessions] = useState([])
    const [submitting, setSubmitting] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        session_id: '',
        date: new Date().toISOString().split('T')[0],
        proposed_clock_in: '09:00',
        proposed_clock_out: '18:00',
        reason: ''
    })

    useEffect(() => {
        loadCorrections()
    }, [profile?.id, activeTab, isAdmin])

    const loadCorrections = async () => {
        setLoading(true)
        try {
            let data
            if (isAdmin) {
                data = await correctionsService.getAllCorrections(activeTab === 'all' ? null : activeTab)
            } else {
                data = await correctionsService.getUserCorrections(profile?.id, activeTab === 'all' ? null : activeTab)
            }
            setCorrections(data)
        } catch (err) {
            console.error('Error loading corrections:', err)
        } finally {
            setLoading(false)
        }
    }

    const loadSessions = async () => {
        try {
            const data = await timeTrackingService.getSessionHistory(profile?.id, { limit: 30 })
            setSessions(data)
        } catch (err) {
            console.error('Error loading sessions:', err)
        }
    }

    const handleOpenModal = () => {
        loadSessions()
        setShowModal(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.reason.trim()) {
            alert('Por favor ingresa el motivo de la corrección')
            return
        }

        setSubmitting(true)
        try {
            const clockInDateTime = `${formData.date}T${formData.proposed_clock_in}:00`
            const clockOutDateTime = `${formData.date}T${formData.proposed_clock_out}:00`

            await correctionsService.createCorrectionRequest({
                user_id: profile?.id,
                session_id: formData.session_id || null,
                proposed_clock_in: clockInDateTime,
                proposed_clock_out: clockOutDateTime,
                original_clock_in: clockInDateTime,
                original_clock_out: clockOutDateTime,
                reason: formData.reason
            })

            setShowModal(false)
            setFormData({
                session_id: '',
                date: new Date().toISOString().split('T')[0],
                proposed_clock_in: '09:00',
                proposed_clock_out: '18:00',
                reason: ''
            })
            loadCorrections()
        } catch (err) {
            console.error('Error creating correction:', err)
            alert('Error al crear la solicitud')
        } finally {
            setSubmitting(false)
        }
    }

    const handleApprove = async (correctionId) => {
        try {
            await correctionsService.approveCorrection(correctionId, profile?.id)
            loadCorrections()
        } catch (err) {
            console.error('Error approving:', err)
        }
    }

    const handleReject = async (correctionId) => {
        const comment = prompt('Motivo del rechazo (opcional):')
        try {
            await correctionsService.rejectCorrection(correctionId, profile?.id, comment || '')
            loadCorrections()
        } catch (err) {
            console.error('Error rejecting:', err)
        }
    }

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        })
    }

    const formatTime = (dateStr) => {
        return new Date(dateStr).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getStatusBadge = (status) => {
        const map = {
            pending: { label: 'Pendiente', class: 'corrections__status--pending' },
            approved: { label: 'Aprobada', class: 'corrections__status--approved' },
            rejected: { label: 'Rechazada', class: 'corrections__status--rejected' }
        }
        const s = map[status] || { label: status, class: '' }
        return <span className={`corrections__status ${s.class}`}>{s.label}</span>
    }

    return (
        <div className="corrections">
            <div className="corrections__header">
                <div>
                    <h2 className="corrections__title">Correcciones</h2>
                    <p className="corrections__subtitle">
                        {isAdmin
                            ? 'Revisa y gestiona todas las solicitudes de corrección'
                            : 'Gestiona tus solicitudes de corrección de horario'
                        }
                    </p>
                </div>

                {!isAdmin && (
                    <Button
                        variant="primary"
                        icon={
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                        }
                        onClick={handleOpenModal}
                    >
                        Nueva Solicitud
                    </Button>
                )}
            </div>

            {/* Tabs */}
            <div className="corrections__tabs">
                <button
                    className={`corrections__tab ${activeTab === 'pending' ? 'corrections__tab--active' : ''}`}
                    onClick={() => setActiveTab('pending')}
                >
                    Pendientes
                    {corrections.filter(c => c.status === 'pending').length > 0 && activeTab !== 'pending' && (
                        <span className="corrections__tab-badge">
                            {corrections.filter(c => c.status === 'pending').length}
                        </span>
                    )}
                </button>
                <button
                    className={`corrections__tab ${activeTab === 'approved' ? 'corrections__tab--active' : ''}`}
                    onClick={() => setActiveTab('approved')}
                >
                    Aprobadas
                </button>
                <button
                    className={`corrections__tab ${activeTab === 'rejected' ? 'corrections__tab--active' : ''}`}
                    onClick={() => setActiveTab('rejected')}
                >
                    Rechazadas
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <Card padding="large">
                    <div className="corrections__loading">
                        <div className="loading-spinner"></div>
                        <p>Cargando solicitudes...</p>
                    </div>
                </Card>
            ) : corrections.length > 0 ? (
                <div className="corrections__list">
                    {corrections.map(request => (
                        <Card key={request.id} padding="medium" className="corrections__card">
                            <div className="corrections__card-header">
                                <div className="corrections__card-info">
                                    <div className="corrections__card-date">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="4" width="18" height="18" rx="2" />
                                            <line x1="16" y1="2" x2="16" y2="6" />
                                            <line x1="8" y1="2" x2="8" y2="6" />
                                            <line x1="3" y1="10" x2="21" y2="10" />
                                        </svg>
                                        <span>{formatDate(request.proposed_clock_in || request.created_at)}</span>
                                    </div>
                                    {isAdmin && request.profiles && (
                                        <div className="corrections__card-user">
                                            <span className="corrections__user-avatar">
                                                {request.profiles.full_name?.charAt(0) || 'U'}
                                            </span>
                                            <span>{request.profiles.full_name}</span>
                                        </div>
                                    )}
                                </div>
                                {getStatusBadge(request.status)}
                            </div>

                            <div className="corrections__card-body">
                                <div className="corrections__times">
                                    <div className="corrections__time-group">
                                        <span className="corrections__time-label">Propuesto</span>
                                        <span className="corrections__time-value corrections__time-value--proposed">
                                            {formatTime(request.proposed_clock_in)} - {formatTime(request.proposed_clock_out)}
                                        </span>
                                    </div>
                                </div>

                                <div className="corrections__reason">
                                    <strong>Motivo:</strong> {request.reason}
                                </div>

                                {/* Admin actions */}
                                {isAdmin && request.status === 'pending' && (
                                    <div className="corrections__actions">
                                        <Button
                                            variant="success"
                                            size="small"
                                            onClick={() => handleApprove(request.id)}
                                        >
                                            Aprobar
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="small"
                                            onClick={() => handleReject(request.id)}
                                        >
                                            Rechazar
                                        </Button>
                                    </div>
                                )}

                                {request.reviewer_comment && (
                                    <div className="corrections__comment">
                                        <strong>Comentario del revisor:</strong> {request.reviewer_comment}
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card padding="large">
                    <div className="corrections__empty">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M9 12l2 2 4-4" />
                            <circle cx="12" cy="12" r="10" />
                        </svg>
                        <h3>No hay solicitudes {activeTab === 'pending' ? 'pendientes' : activeTab === 'approved' ? 'aprobadas' : 'rechazadas'}</h3>
                        <p>Las solicitudes de corrección aparecerán aquí</p>
                    </div>
                </Card>
            )}

            {/* Modal de nueva solicitud */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Nueva Solicitud de Corrección"
                size="medium"
            >
                <form onSubmit={handleSubmit} className="corrections__form">
                    <div className="corrections__form-group">
                        <label className="corrections__form-label">Sesión a corregir *</label>
                        <select
                            className="corrections__select"
                            value={formData.session_id}
                            onChange={(e) => {
                                const sessionId = e.target.value
                                const session = sessions.find(s => s.id === sessionId)
                                let newDate = new Date().toISOString().split('T')[0]
                                let newIn = '09:00'
                                let newOut = '18:00'

                                if (session) {
                                    if (session.clock_in) {
                                        const d = new Date(session.clock_in)
                                        newDate = d.toISOString().split('T')[0]
                                        newIn = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
                                    }
                                    if (session.clock_out) {
                                        const d = new Date(session.clock_out)
                                        newOut = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
                                    }
                                }

                                setFormData({
                                    ...formData,
                                    session_id: sessionId,
                                    date: newDate,
                                    proposed_clock_in: newIn,
                                    proposed_clock_out: newOut
                                })
                            }}
                            required
                        >
                            <option value="">Selecciona una sesión...</option>
                            {sessions.map(session => (
                                <option key={session.id} value={session.id}>
                                    {new Date(session.clock_in).toLocaleDateString()} - {new Date(session.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {session.clock_out ? `a ${new Date(session.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : '(En curso)'}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Input
                        label="Fecha"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                    />

                    <div className="corrections__form-row">
                        <Input
                            label="Hora entrada propuesta"
                            type="time"
                            value={formData.proposed_clock_in}
                            onChange={(e) => setFormData({ ...formData, proposed_clock_in: e.target.value })}
                            required
                        />
                        <Input
                            label="Hora salida propuesta"
                            type="time"
                            value={formData.proposed_clock_out}
                            onChange={(e) => setFormData({ ...formData, proposed_clock_out: e.target.value })}
                            required
                        />
                    </div>

                    <div className="corrections__form-group">
                        <label className="corrections__form-label">Motivo de la corrección *</label>
                        <textarea
                            className="corrections__textarea"
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            placeholder="Explica el motivo de la corrección..."
                            rows={4}
                            required
                        />
                    </div>

                    <div className="corrections__form-actions">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setShowModal(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            loading={submitting}
                            disabled={!formData.session_id}
                        >
                            Enviar Solicitud
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default Corrections
