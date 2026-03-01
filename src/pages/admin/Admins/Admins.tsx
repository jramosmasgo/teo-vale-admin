import { useState, useEffect, useCallback } from 'react';
import { Plus, User, Mail, Lock, Shield, Edit2, UserX, UserCheck, MapPin, Eye, EyeOff } from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import { userApi } from '../../../api/user.api';
import type { User as UserInterface } from '../../../types/interfaces/user.interface';
import toast from 'react-hot-toast';
import './Admins.scss';

const Admins = () => {
    const [users, setUsers] = useState<UserInterface[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        role: 'USER',
        password: '',
        phone: '',
        address: '',
        status: 'ACTIVE'
    });

    const fetchUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await userApi.getAll(1, 50);
            setUsers(data.users);

        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Error al cargar usuarios');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveAdmin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingId) {
                // Update existing user
                const updateData: Partial<UserInterface> = {
                    fullName: formData.fullName,
                    email: formData.email,
                    role: formData.role,
                    phone: formData.phone,
                    address: formData.address,
                    status: formData.status
                };

                // Only include password if it was provided
                if (formData.password) {
                    updateData.password = formData.password;
                }

                await userApi.update(editingId, updateData);
                toast.success('Usuario actualizado exitosamente');
            } else {
                // Create new user
                await userApi.create({
                    fullName: formData.fullName,
                    email: formData.email,
                    role: formData.role,
                    password: formData.password,
                    phone: formData.phone,
                    address: formData.address,
                    status: 'ACTIVE'
                });
                toast.success('Usuario creado exitosamente');
            }

            closeModal();
            fetchUsers();
        } catch (error: any) {
            console.error('Error saving user:', error);
            toast.error(error.response?.data?.message || 'Error al guardar usuario');
        }
    };

    const handleEdit = (user: UserInterface) => {
        setFormData({
            fullName: user.fullName || '',
            email: user.email || '',
            role: user.role || 'USER',
            password: '',
            phone: user.phone || '',
            address: user.address || '',
            status: user.status || 'ACTIVE'
        });
        setEditingId(user._id || null);
        setIsModalOpen(true);
    };

    const handleToggleStatus = async (user: UserInterface) => {
        const isActive = user.status === 'ACTIVE';
        const action = isActive ? 'desactivar' : 'activar';
        const confirmed = window.confirm(`¿Está seguro de ${action} al usuario "${user.fullName}"?`);

        if (!confirmed) return;

        try {
            await userApi.update(user._id || '', { status: isActive ? 'INACTIVE' : 'ACTIVE' });
            toast.success(`Usuario ${isActive ? 'desactivado' : 'activado'} exitosamente`);
            fetchUsers();
        } catch (error: any) {
            console.error('Error updating user status:', error);
            toast.error(error.response?.data?.message || 'Error al actualizar estado del usuario');
        }
    };

    const openNewModal = () => {
        setFormData({ fullName: '', email: '', role: 'USER', password: '', phone: '', address: '', status: 'ACTIVE' });
        setEditingId(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({ fullName: '', email: '', role: 'USER', password: '', phone: '', address: '', status: 'ACTIVE' });
        setEditingId(null);
        setShowPassword(false);
    };

    return (
        <div className="page-content">
            <div className="header-actions">
                <div>
                    <h1 className="text-2xl">Gestión de Usuarios Admin</h1>
                    <p className="subtitle">Administra los accesos y roles del sistema</p>
                </div>
                <button
                    className="btn-primary flex items-center gap-2"
                    onClick={openNewModal}
                >
                    <Plus size={20} />
                    Nuevo Usuario
                </button>
            </div>

            <div className="card">
                <div className="table-container">
                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>Cargando usuarios...</div>
                    ) : users.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                            No se encontraron usuarios registrados.
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Email</th>
                                    <th>Rol</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user._id}>
                                        <td data-label="Nombre">
                                            <div className="flex items-center gap-4">
                                                <div className="avatar-sm">
                                                    {user.profileImageUrl ? (
                                                        <img src={user.profileImageUrl} alt={user.fullName} />
                                                    ) : (
                                                        (user.fullName || 'U').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                                                    )}
                                                </div>
                                                <span className="font-medium">
                                                    {user.fullName}
                                                </span>
                                            </div>
                                        </td>
                                        <td data-label="Email">{user.email}</td>
                                        <td data-label="Rol">
                                            <div className="flex items-center gap-3">
                                                <Shield size={14} className="text-text-secondary" />
                                                {user.role === 'ADMIN' ? 'Administrador' : 'Usuario'}
                                            </div>
                                        </td>
                                        <td data-label="Estado">
                                            <span className={user.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}>
                                                {user.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td data-label="Acciones">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    className="btn-icon-action info"
                                                    title="Editar"
                                                    onClick={() => handleEdit(user)}
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    className={`btn-icon-action ${user.status === 'ACTIVE' ? 'danger' : 'success'}`}
                                                    title={user.status === 'ACTIVE' ? 'Desactivar usuario' : 'Activar usuario'}
                                                    onClick={() => handleToggleStatus(user)}
                                                >
                                                    {user.status === 'ACTIVE'
                                                        ? <UserX size={18} />
                                                        : <UserCheck size={18} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingId ? "Editar Usuario" : "Nuevo Administrador"}
            >
                <form onSubmit={handleSaveAdmin} className="admin-form">
                    <div className="form-group">
                        <label>Nombre Completo</label>
                        <div className="input-wrapper">
                            <User size={18} />
                            <input
                                type="text"
                                name="fullName"
                                placeholder="Ej. Juan Perez"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Correo Electrónico</label>
                        <div className="input-wrapper">
                            <Mail size={18} />
                            <input
                                type="email"
                                name="email"
                                placeholder="Ej. juan@teovale.com"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Rol de Usuario</label>
                        <div className="input-wrapper">
                            <Shield size={18} />
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="USER">Usuario (Acceso limitado)</option>
                                <option value="ADMIN">Administrador (Acceso total)</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Teléfono (Opcional)</label>
                        <div className="input-wrapper">
                            <Plus size={18} />
                            <input
                                type="text"
                                name="phone"
                                placeholder="Ej. 987654321"
                                value={formData.phone}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Dirección (Opcional)</label>
                        <div className="input-wrapper">
                            <MapPin size={18} />
                            <input
                                type="text"
                                name="address"
                                placeholder="Ej. Av. Siempre Viva 123"
                                value={formData.address}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Contraseña {editingId && <span style={{ fontWeight: 400, fontSize: '0.8em', color: 'var(--text-secondary)' }}>(Opcional)</span>}</label>
                        <div className="input-wrapper">
                            <Lock size={18} />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder={editingId ? "Dejar en blanco para mantener" : "••••••••"}
                                value={formData.password}
                                onChange={handleInputChange}
                                required={!editingId}
                                minLength={6}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={closeModal}
                        >
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary">
                            {editingId ? "Guardar Cambios" : "Crear Usuario"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
export default Admins;

