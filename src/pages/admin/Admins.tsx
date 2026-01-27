import { useState } from 'react';
import { Plus, User, Mail, Lock, Shield, Edit2, Trash2 } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import './Admins.scss';

interface Admin {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'editor';
  status: 'active' | 'inactive';
}

const MOCK_ADMINS: Admin[] = [
  { id: 1, name: 'Juan Perez', email: 'juan.perez@teovale.com', role: 'admin', status: 'active' },
  { id: 2, name: 'Maria Campos', email: 'maria.campos@teovale.com', role: 'editor', status: 'active' },
];

const Admins = () => {
  const [admins, setAdmins] = useState<Admin[]>(MOCK_ADMINS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'editor',
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      console.log("Updating admin:", editingId, formData);
      setAdmins(prev => prev.map(admin =>
        admin.id === editingId
          ? { ...admin, name: formData.name, email: formData.email, role: formData.role as 'admin' | 'editor' }
          : admin
      ));
    } else {
      console.log("Saving new admin:", formData);
      const newAdmin: Admin = {
        id: Date.now(),
        name: formData.name,
        email: formData.email,
        role: formData.role as 'admin' | 'editor',
        status: 'active'
      };
      setAdmins(prev => [...prev, newAdmin]);
    }
    closeModal();
  };

  const handleEdit = (admin: Admin) => {
    setFormData({
      name: admin.name,
      email: admin.email,
      role: admin.role,
      password: '' // Keep empty, only send if changing
    });
    setEditingId(admin.id);
    setIsModalOpen(true);
  };

  const openNewModal = () => {
    setFormData({ name: '', email: '', role: 'editor', password: '' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ name: '', email: '', role: 'editor', password: '' });
    setEditingId(null);
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
              {admins.map((admin) => (
                <tr key={admin.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar-sm">
                        {admin.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium">
                        {admin.name}
                      </span>
                    </div>
                  </td>
                  <td>{admin.email}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Shield size={14} className="text-text-secondary" />
                      {admin.role === 'admin' ? 'Super Admin' : 'Editor'}
                    </div>
                  </td>
                  <td><span className="badge-success">Activo</span></td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        className="btn-icon-action info"
                        title="Editar"
                        onClick={() => handleEdit(admin)}
                      >
                        <Edit2 size={18} />
                      </button>
                      {admin.id !== 1 && (
                        <button className="btn-icon-action danger" style={{ color: 'var(--error-color)' }} title="Eliminar">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                name="name"
                placeholder="Ej. Juan Perez"
                value={formData.name}
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
                <option value="editor">Editor (Acceso limitado)</option>
                <option value="admin">Administrador (Acceso total)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Contraseña {editingId && <span style={{ fontWeight: 400, fontSize: '0.8em', color: 'var(--text-secondary)' }}>(Opcional)</span>}</label>
            <div className="input-wrapper">
              <Lock size={18} />
              <input
                type="password"
                name="password"
                placeholder={editingId ? "Dejar en blanco para mantener" : "••••••••"}
                value={formData.password}
                onChange={handleInputChange}
                required={!editingId}
                minLength={6}
              />
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
