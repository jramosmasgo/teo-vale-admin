import { useState } from 'react';
import { User, Mail, Phone, MapPin, Camera, Save, Lock, Shield } from 'lucide-react';
import './Profile.scss';

const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Mock data for the current user
    const [userData, setUserData] = useState({
        firstName: 'Michael',
        lastName: 'Huaman',
        email: 'michael.huaman@teoyvale.com',
        phone: '+51 987 654 321',
        role: 'Administrador Principal',
        address: 'Av. Larco 101, Miraflores',
        joinDate: 'Enero 2023'
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setIsEditing(false);
        }, 1000);
    };

    return (
        <div className="page-content profile-page">
            <div className="header-section">
                <h1>Mi Perfil</h1>
                <p className="subtitle">Administra tu información personal y seguridad</p>
            </div>

            <div className="profile-grid">
                {/* Left Column: Identity */}
                <div className="identity-card">
                    <div className="avatar-container">
                        <img
                            src="https://ui-avatars.com/api/?name=Michael+Huaman&background=D6A865&color=fff&size=200"
                            alt="Profile"
                        />
                        <button className="edit-avatar-btn" title="Cambiar foto">
                            <Camera size={16} />
                        </button>
                    </div>

                    <h2>{userData.firstName} {userData.lastName}</h2>
                    <span className="role-badge">{userData.role}</span>

                    <div className="stats-mini">
                        <div className="stat-item">
                            <span className="val">24</span>
                            <span className="lbl">Meses</span>
                        </div>
                        <div className="stat-item">
                            <span className="val">Active</span>
                            <span className="lbl">Status</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Details */}
                <div className="details-card">
                    <div className="card-header">
                        <h3><User size={20} /> Información Personal</h3>
                        {!isEditing ? (
                            <button
                                className="btn-secondary"
                                onClick={() => setIsEditing(true)}
                            >
                                Editar Datos
                            </button>
                        ) : (
                            <button
                                className="btn-ghost"
                                onClick={() => setIsEditing(false)} // Cancel
                            >
                                Cancelar
                            </button>
                        )}
                    </div>

                    <div className="card-body">
                        <form onSubmit={handleSave}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Nombre</label>
                                    <div className="input-wrapper">
                                        <User />
                                        <input
                                            type="text"
                                            value={userData.firstName}
                                            onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Apellido</label>
                                    <div className="input-wrapper">
                                        <User />
                                        <input
                                            type="text"
                                            value={userData.lastName}
                                            onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Correo Electrónico</label>
                                    <div className="input-wrapper">
                                        <Mail />
                                        <input
                                            type="email"
                                            value={userData.email}
                                            onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Teléfono</label>
                                    <div className="input-wrapper">
                                        <Phone />
                                        <input
                                            type="tel"
                                            value={userData.phone}
                                            onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                </div>

                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label>Dirección</label>
                                    <div className="input-wrapper">
                                        <MapPin />
                                        <input
                                            type="text"
                                            value={userData.address}
                                            onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                </div>

                                {/* Security Section */}
                                <h4 className="section-title">Seguridad</h4>

                                <div className="form-group">
                                    <label>Contraseña Actual</label>
                                    <div className="input-wrapper">
                                        <Lock />
                                        <input
                                            type="password"
                                            placeholder="••••••••••••"
                                            disabled={!isEditing}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Nueva Contraseña</label>
                                    <div className="input-wrapper">
                                        <Shield />
                                        <input
                                            type="password"
                                            placeholder="Opcional"
                                            disabled={!isEditing}
                                        />
                                    </div>
                                </div>
                            </div>

                            {isEditing && (
                                <div className="form-actions">
                                    <button
                                        type="submit"
                                        className="btn-primary"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                                        {!isLoading && <Save size={18} style={{ marginLeft: '0.5rem' }} />}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
