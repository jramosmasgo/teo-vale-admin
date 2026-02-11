import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Pencil, Search, Filter, Plus, User, PlusCircle } from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import { clientApi } from '../../../api/client.api';
import type { Client } from '../../../types/interfaces/client.interface';
import toast from 'react-hot-toast';
import './Clients.scss';

type ModalMode = 'create' | 'edit';

const Clients = () => {
    const navigate = useNavigate();
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<ModalMode>('create');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    // Form state
    const [formData, setFormData] = useState<Partial<Client>>({
        fullName: '',
        alias: '',
        phone: '',
        address: '',
        reference: '',
        active: true
    });

    const fetchClients = async (search: string = '') => {
        try {
            setIsLoading(true);
            const data = await clientApi.getAll(search);
            setClients(data);
        } catch (error) {
            console.error('Error fetching clients:', error);
            toast.error('Error al cargar clientes');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchClients(searchTerm);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleCreate = () => {
        setModalMode('create');
        setSelectedClient(null);
        setFormData({
            fullName: '',
            alias: '',
            phone: '',
            address: '',
            reference: '',
            active: true
        });
        setIsModalOpen(true);
    };

    const handleEdit = (client: Client) => {
        setModalMode('edit');
        setSelectedClient(client);
        setFormData({
            fullName: client.fullName || '',
            alias: client.alias || '',
            phone: client.phone || '',
            address: client.address || '',
            reference: client.reference || '',
            active: client.active
        });
        setIsModalOpen(true);
    };

    const handleSave = async (e: FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!formData.fullName || !formData.phone) {
            toast.error('Nombre y teléfono son obligatorios');
            return;
        }

        try {
            if (modalMode === 'create') {
                await clientApi.create(formData as Client);
                toast.success('Cliente creado exitosamente');
            } else {
                if (selectedClient?._id) {
                    await clientApi.update(selectedClient._id, formData);
                    toast.success('Cliente actualizado exitosamente');
                }
            }
            setIsModalOpen(false);
            fetchClients(searchTerm);
        } catch (error: any) {
            console.error('Error saving client:', error);
            toast.error(error.response?.data?.message || 'Error al guardar cliente');
        }
    };

    const getModalTitle = () => {
        return modalMode === 'create' ? 'Nuevo Cliente' : 'Editar Cliente';
    };

    return (
        <div className="page-content">
            <div className="flex justify-between items-center mb-6 header-actions">
                <div>
                    <h1 className="text-2xl font-bold text-primary mb-1">Gestión de Clientes</h1>
                    <p className="subtitle">Administra la información de tus clientes</p>
                </div>
                <button
                    className="btn-primary flex items-center gap-2"
                    onClick={handleCreate}
                >
                    <Plus size={20} />
                    Nuevo Cliente
                </button>
            </div>

            <div className="card">
                {/* Adds a simple search/filter bar aesthetic */}
                <div className="table-actions-bar">
                    <div className="search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Buscar clientes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-bg-primary transition-colors text-text-secondary">
                        <Filter size={18} />
                        <span>Filtros</span>
                    </button>
                </div>

                {/* Desktop Table */}
                <div className="table-container desktop-view">
                    {isLoading ? (
                        <div className="p-4 text-center">Cargando clientes...</div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th className="col-actions">Acciones</th>
                                    <th>Nombre</th>
                                    <th>Nickname</th>
                                    <th>Dirección</th>
                                    <th>Celular</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clients.map((client) => (
                                    <tr key={client._id}>
                                        <td>
                                            <div className="action-buttons" style={{ justifyContent: 'center' }}>
                                                <button
                                                    className="action-btn view"
                                                    onClick={() => navigate(`/admin/clients/${client._id}`)}
                                                    title="Ver detalles"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    className="action-btn edit"
                                                    onClick={() => handleEdit(client)}
                                                    title="Editar"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                            </div>
                                        </td>
                                        <td>{client.fullName}</td>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <span className="font-medium">{client.alias || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="max-w-[200px] truncate" title={client.address}>
                                            {client.address || '-'}
                                        </td>
                                        <td>{client.phone || '-'}</td>
                                        <td>
                                            <span className={`badge ${client.active ? 'badge-success' : 'badge-danger'}`}>
                                                {client.active ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {clients.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-4">No hay clientes registrados</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Mobile List View - Dark Theme Row Design */}
                <div className="mobile-view dark-theme-list">
                    <div className="search-bar-mobile">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Buscar clientes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {isLoading ? (
                        <div className="p-4 text-center">Cargando...</div>
                    ) : (
                        clients.map((client) => {
                            // Split name for stacking if needed, or just let CSS handle wrapping
                            const nameParts = (client.fullName || '').split(' ');
                            const firstName = nameParts[0] || 'Cliente';
                            const lastName = nameParts.slice(1).join(' ');

                            return (
                                <div
                                    key={client._id}
                                    className="mobile-client-row"
                                    onClick={() => navigate(`/admin/clients/${client._id}`)}
                                >
                                    {/* LEFT SIDE */}
                                    <div className="row-left">
                                        {/* Icon */}
                                        <div className="col-icon">
                                            <User size={24} strokeWidth={1.5} />
                                        </div>

                                        {/* Main info */}
                                        <div className="col-info">
                                            <div className="col-name">
                                                <span className="name-top">{firstName}</span>
                                                <span className="name-bottom">{lastName}</span>
                                            </div>

                                            <div className="col-nick">
                                                <span className="lbl">Nick:</span>
                                                <span className="val">{client.alias || '-'}</span>
                                            </div>

                                            <div className="col-phone">
                                                {client.phone}
                                            </div>
                                        </div>
                                    </div>

                                    {/* RIGHT SIDE */}
                                    <div className="col-action">
                                        <PlusCircle size={22} className="action-icon" />
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {/* Floating Add Button */}
                    <button
                        className="floating-fab"
                        onClick={handleCreate}
                    >
                        <Plus size={28} />
                    </button>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={getModalTitle()}
            >
                <form onSubmit={handleSave}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label>Nickname</label>
                            <input
                                type="text"
                                placeholder="Ej. Juancho"
                                value={formData.alias}
                                onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Nombre Completo</label>
                            <input
                                type="text"
                                placeholder="Ej. Juan Perez"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Número de Celular</label>
                            <input
                                type="tel"
                                placeholder="+51 900 000 000"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                required
                            />
                        </div>



                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label>Dirección</label>
                            <input
                                type="text"
                                placeholder="Av. Principal 123, Distrito"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>

                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label>Referencia</label>
                            <textarea
                                rows={3}
                                placeholder="Ej. Frente al parque, puerta azul..."
                                style={{ resize: 'none' }}
                                value={formData.reference}
                                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                            />
                        </div>

                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label>Estado</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <input
                                    type="checkbox"
                                    id="active-status"
                                    checked={formData.active}
                                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                    style={{ width: 'auto', margin: 0 }}
                                />
                                <label htmlFor="active-status" style={{ margin: 0, cursor: 'pointer', fontWeight: 400 }}>
                                    {formData.active ? 'Activo' : 'Inactivo'}
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn-link"
                            onClick={() => setIsModalOpen(false)}
                            style={{ padding: '0.75rem 1.5rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                        >
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary">
                            {modalMode === 'create' ? 'Guardar Cliente' : 'Actualizar Cliente'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Clients;
