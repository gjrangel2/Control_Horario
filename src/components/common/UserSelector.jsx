/**
 * User Selector Component
 * Componente para seleccionar un empleado (solo visible para admin)
 */

import { useState, useEffect } from 'react'
import correctionsService from '../../services/corrections'
import './UserSelector.css'

const UserSelector = ({ selectedUserId, onUserSelect }) => {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadUsers()
    }, [])

    const loadUsers = async () => {
        try {
            const data = await correctionsService.getAllUsers()
            setUsers(data)
        } catch (err) {
            console.error('Error loading users:', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className="user-selector user-selector--loading">Cargando usuarios...</div>
    }

    return (
        <div className="user-selector">
            <select
                className="user-selector__select"
                value={selectedUserId || ''}
                onChange={(e) => onUserSelect(e.target.value || null)}
            >
                <option value="">Todos los usuarios</option>
                {users.map(user => (
                    <option key={user.id} value={user.id}>
                        {user.full_name} ({user.email})
                    </option>
                ))}
            </select>
            <div className="user-selector__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </div>
        </div>
    )
}

export default UserSelector
