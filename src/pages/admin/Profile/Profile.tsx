import { Camera, Lock, Mail, Save, Shield, User } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import './Profile.scss';

const Profile = () => {
    const { user, login } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        email: user?.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Update profile logic here
            // const updatedUser = await userApi.updateProfile(formData);
            // login(updatedUser, token); 

            // Mock success for now
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Perfil actualizado correctamente');
            setIsEditing(false);
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Error al actualizar el perfil');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page-content profile-page">
            <div className="header-section">
                <h1>Mi Perfil</h1>
                <p className="subtitle">Gestiona tu información personal y seguridad</p>
            </div>

            <div className="profile-grid">
                {/* Left Column: Identity Card */}
                <div className="identity-card">
                    <div className="avatar-container">
                        <img
                            src={`https://ui-avatars.com/api/?name=${user?.fullName}&background=random&size=200`}
                            alt={user?.fullName}
                        />
                        <button className="edit-avatar-btn" title="Cambiar foto">
                            <Camera size={16} />
                        </button>
                    </div>

                    <h2>{user?.fullName}</h2>
                    <span className="role-badge">
                        {user?.role === 'admin' ? 'Administrador' : 'Editor'}
                    </span>

                    <div className="stats-mini">
                        <div className="stat-item">
                            <span className="val">12</span>
                            <span className="lbl">Meses</span>
                        </div>
                        <div className="stat-item">
                            <span className="val">Active</span>
                            <span className="lbl">Estado</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Details Form */}
                <div className="details-card">
                    <div className="card-header">
                        <h3><User size={20} /> Información Personal</h3>
                        {!isEditing && (
                            <button
                                className="btn-secondary"
                                onClick={() => setIsEditing(true)}
                            >
                                Editar Perfil
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="card-body">
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Nombre Completo</label>
                                <div className="input-wrapper">
                                    <User />
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        placeholder="Tu nombre completo"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Correo Electrónico</label>
                                <div className="input-wrapper">
                                    <Mail />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        disabled={!isEditing} // Email usually read-only or requires verify
                                        placeholder="correo@ejemplo.com"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Rol de Usuario</label>
                                <div className="input-wrapper">
                                    <Shield />
                                    <input
                                        type="text"
                                        value={user?.role === 'admin' ? 'Administrador' : 'Editor'}
                                        disabled
                                        className="bg-gray-50"
                                    />
                                </div>
                            </div>
                        </div>

                        {isEditing && (
                            <>
                                <h4 className="section-title">Cambiar Contraseña</h4>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Contraseña Actual</label>
                                        <div className="input-wrapper">
                                            <Lock />
                                            <input
                                                type="password"
                                                name="currentPassword"
                                                value={formData.currentPassword}
                                                onChange={handleInputChange}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Nueva Contraseña</label>
                                        <div className="input-wrapper">
                                            <Lock />
                                            <input
                                                type="password"
                                                name="newPassword"
                                                value={formData.newPassword}
                                                onChange={handleInputChange}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Confirmar Contraseña</label>
                                        <div className="input-wrapper">
                                            <Lock />
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button
                                        type="button"
                                        className="btn-link"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setFormData(prev => ({
                                                ...prev,
                                                fullName: user?.fullName || '',
                                                email: user?.email || '',
                                                currentPassword: '',
                                                newPassword: '',
                                                confirmPassword: ''
                                            }));
                                        }}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-primary flex items-center gap-2"
                                        disabled={isLoading}
                                    >
                                        <Save size={18} />
                                        {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                </div>
                            </>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
