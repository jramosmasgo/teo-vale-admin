import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../ui/Sidebar';
import Header from '../ui/Header';
import './AdminLayout.scss';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
    const { isAuthenticated } = useAuth();
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    if (!isAuthenticated) {
        return <Navigate to="/auth/login" replace />;
    }

    return (
        <div className={`admin-layout ${isSidebarOpen ? 'layout-sidebar-open' : ''}`}>
            <div
                className={`mobile-overlay ${isSidebarOpen ? 'show' : ''}`}
                onClick={() => setSidebarOpen(false)}
            />
            <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="main-wrapper">
                <Header toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
