/**
 * AppLayout Component
 * Layout principal con sidebar y contenido
 */

import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import './AppLayout.css'

const AppLayout = ({ pageTitle = 'Dashboard' }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
    }

    const closeSidebar = () => {
        setIsSidebarOpen(false)
    }

    return (
        <div className="app-layout">
            <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div className="app-layout__overlay" onClick={closeSidebar}></div>
            )}

            <div className="app-layout__main">
                <Header title={pageTitle} onMenuClick={toggleSidebar} />
                <main className="app-layout__content">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default AppLayout
