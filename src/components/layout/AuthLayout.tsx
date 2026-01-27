import { Outlet } from 'react-router-dom';
import ThemeToggle from '../ui/ThemeToggle';
import './AuthLayout.scss';

const AuthLayout = () => {
    return (
        <div className="auth-layout">
            <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                <ThemeToggle />
            </div>
            <div className="auth-container">
                <Outlet />
            </div>
        </div>
    );
};

export default AuthLayout;
