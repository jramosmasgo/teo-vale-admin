import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import './Login.scss';
import { useTheme } from '../../context/ThemeContext';
import logoLight from '../../assets/admin/admin-logo.png';
import logoDark from '../../assets/admin/admin-logo-dark.png';

const Login = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const logo = theme === 'dark' ? logoDark : logoLight;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Add actual authentication logic here
        console.log('Login attempt:', { email, password });
        navigate('/admin');
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

                <button type="submit" className="login-btn">
                    Iniciar Sesión
                </button>
            </form>
        </div>
    );
};

export default Login;
