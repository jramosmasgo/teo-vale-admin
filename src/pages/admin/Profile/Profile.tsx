import { Camera, Lock, Mail, Save, Shield, User, Trash2, Phone, MapPin } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { userApi } from '../../../api/user.api';
import './Profile.scss';

const Profile = () => {
    const { user, login } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                fullName: user.fullName || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || ''
            }));
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
            toast.error('Por favor selecciona una imagen válida');
            return;
        }

        // Validar tamaño (5MB máximo)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('La imagen no debe superar los 5MB');
            return;
        }

        setIsUploadingImage(true);
        try {
            const response = await userApi.uploadProfileImage(user?._id || '', file);
            toast.success('Imagen de perfil actualizada');

            // Actualizar el contexto con el nuevo usuario
            if (response.user) {
                const token = localStorage.getItem('token') || '';
                login(response.user, token);
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Error al subir la imagen');
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleDeleteImage = async () => {
        if (!user?.profileImageUrl) return;

        if (!confirm('¿Estás seguro de que deseas eliminar tu foto de perfil?')) {
            return;
        }

        setIsUploadingImage(true);
        try {
            const response = await userApi.deleteProfileImage(user._id || '');
            toast.success('Imagen de perfil eliminada');

            // Actualizar el contexto con el nuevo usuario
            if (response.user) {
                const token = localStorage.getItem('token') || '';
                login(response.user, token);
            }
        } catch (error) {
            console.error('Error deleting image:', error);
            toast.error('Error al eliminar la imagen');
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validaciones
        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            toast.error('Las contraseñas no coinciden');
            return;
        }

        // Aviso si se va a cambiar la contraseña
        if (formData.newPassword) {
            const confirmChange = window.confirm('Estás a punto de cambiar tu contraseña. ¿Deseas continuar?');
            if (!confirmChange) return;
        }

        setIsLoading(true);

        try {
            const updateData: any = {
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address
            };

            // Solo enviar la contraseña si se ha ingresado una nueva
            if (formData.newPassword) {
                updateData.password = formData.newPassword;
            }

            const updatedUser = await userApi.update(user?._id || '', updateData);

            if (updatedUser) {
                // Actualizar el contexto de autenticación
                const token = localStorage.getItem('token') || '';
                login(updatedUser, token);
                toast.success('Perfil actualizado correctamente');
            }

            setIsEditing(false);
            setFormData(prev => ({
                ...prev,
                newPassword: '',
                confirmPassword: ''
            }));
        } catch (error: any) {
            console.error('Error updating profile:', error);
            toast.error(error.response?.data?.message || 'Error al actualizar el perfil');
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
                            src={user?.profileImageUrl || `https://ui-avatars.com/api/?name=${user?.fullName}&background=random&size=200`}
                            alt={user?.fullName}
                        />
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                        />
                        <button
                            className="edit-avatar-btn"
                            title="Cambiar foto"
                            onClick={handleImageClick}
                            disabled={isUploadingImage}
                        >
                            <Camera size={16} />
                        </button>
                        {user?.profileImageUrl && (
                            <button
                                className="delete-avatar-btn"
                                title="Eliminar foto"
                                onClick={handleDeleteImage}
                                disabled={isUploadingImage}
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
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

                            <div className="form-group">
                                <label>Teléfono</label>
                                <div className="input-wrapper">
                                    <Phone size={18} />
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        placeholder="Tu número de teléfono"
                                    />
                                </div>
                            </div>

                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label>Dirección</label>
                                <div className="input-wrapper">
                                    <MapPin size={18} />
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        placeholder="Tu dirección de residencia"
                                    />
                                </div>
                            </div>
                        </div>

                        {isEditing && (
                            <>
                                <h4 className="section-title">Cambiar Contraseña</h4>
                                <div className="form-grid">


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
                                        <label>Repetir Contraseña</label>
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
                                                phone: user?.phone || '',
                                                address: user?.address || '',
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
