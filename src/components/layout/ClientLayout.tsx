import React from 'react';
import './ClientLayout.scss';
import ThemeToggle from '../ui/ThemeToggle';

const ClientLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="client-layout">
            <header className="client-header">
                <div className="logo">Panadería Teo Vale</div>
                <ThemeToggle />
            </header>
            <main className="client-content">
                {children}
            </main>
        </div>
    );
};

export default ClientLayout;
