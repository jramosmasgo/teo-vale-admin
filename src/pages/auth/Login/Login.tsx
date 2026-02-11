import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import './Login.scss';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { userApi } from '../../../api/user.api';
import logoLight from '../../../assets/admin/admin-logo.png';
import logoDark from '../../../assets/admin/admin-logo-dark.png';

const Login = () => {
    const { theme } = useTheme();
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const logo = theme === 'dark' ? logoDark : logoLight;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const response = await userApi.login({ email, password });

            // Adjust based on actual API response structure
            // Assuming response contains user and token
            if (response) {
                // If the API returns the user object and token at the root or nested
                // This might need adjustment if the API structure is different
                // For now assuming: response = { token: '...', user: { ... } }
                const { token, user } = response;

                if (token && user) {
                    login(user, token);
                    navigate('/admin');
                } else {
                    setError('Respuesta del servidor inválida');
                }
            }
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'Error al iniciar sesión. Verifique sus credenciales.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-content">
            <div className="login-header">
                <img src={logo} alt="Teo Vale Logo" className="login-logo" />
                <p>Ingresa tus credenciales para continuar</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <div className="input-wrapper">
                        <Mail className="input-icon" size={20} />
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@teovale.com"
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="password">Contraseña</label>
                    <div className="input-wrapper">
                        <Lock className="input-icon" size={20} />
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                </div>

                {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

                <button type="submit" className="login-btn" disabled={isLoading}>
                    {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </button>
            </form>
        </div>
    );
};

export default Login;
