/**
 * AppLayout Component
 * Layout principal con sidebar y contenido
 */

import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import './AppLayout.css'

const AppLayout = ({ pageTitle = 'Dashboard' }) => {
    return (
        <div className="app-layout">
            <Sidebar />
            <div className="app-layout__main">
                <Header title={pageTitle} />
                <main className="app-layout__content">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default AppLayout
