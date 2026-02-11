import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../ui/ThemeToggle';
import './AuthLayout.scss';

const AuthLayout = () => {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return <Navigate to="/admin" replace />;
    }

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
