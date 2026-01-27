import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../ui/Sidebar';
import Header from '../ui/Header';
import './AdminLayout.scss';

const AdminLayout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);

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
