import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Pencil, Search, Filter, Plus, User, PlusCircle, MoreVertical } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import './Clients.scss';

interface Client {
  id: number;
  nickname: string;
  fullName: string;
  phone: string;
  address: string;
  reference: string;
  email: string;
  status: 'active' | 'inactive';
  orderCount: number;
}

const MOCK_CLIENTS: Client[] = [
  {
    id: 1,
    nickname: "Juancho",
    fullName: "Juan Perez",
    phone: "+51 987 654 321",
    address: "Av. Principal 123, Miraflores",
    reference: "Frente al parque Kennedy",
    email: "juan.perez@example.com",
    status: "active",
    orderCount: 2
  },
  {
    id: 2,
    nickname: "MariaC",
    fullName: "Maria Campos",
    phone: "+51 999 888 777",
    address: "Jr. Los Pinos 456, San Isidro",
    reference: "Casa color verde",
    email: "maria.campos@example.com",
    status: "active",
    orderCount: 1
  },
  {
    id: 3,
    nickname: "Pepe",
    fullName: "Jose Luis",
    phone: "+51 955 444 333",
    address: "Av. Arequipa 789, Lince",
    reference: "Al costado del banco",
    email: "jose.luis@example.com",
    status: "inactive",
    orderCount: 1
  },
  {
    id: 4,
    nickname: "Ana",
    fullName: "Ana Torres",
    phone: "+51 922 333 444",
    address: "Calle Las Begonias 101, San Borja",
    reference: "Edificio blanco",
    email: "ana.torres@example.com",
    status: "active",
    orderCount: 2
  },
  {
    id: 5,
    nickname: "Luiggi",
    fullName: "Luis Gomez",
    phone: "+51 911 222 333",
    address: "Av. Javier Prado 2020, La Molina",
    reference: "Cerca al centro comercial",
    email: "luis.gomez@example.com",
    status: "active",
    orderCount: 1
  }
];

type ModalMode = 'create' | 'edit' | 'view';

const Clients = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('create');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const handleCreate = () => {
    setModalMode('create');
    setSelectedClient(null);
    setIsModalOpen(true);
  };

  const handleEdit = (client: Client) => {
    setModalMode('edit');
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    // Logic to save client would go here
    console.log('Saving client...', selectedClient);
    setIsModalOpen(false);
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
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-bg-primary transition-colors text-text-secondary">
            <Filter size={18} />
            <span>Filtros</span>
          </button>
        </div>

        {/* Desktop Table */}
        <div className="table-container desktop-view">
          <table className="data-table">
            <thead>
              <tr>
                <th className="col-actions">Acciones</th>
                <th>Nombre</th>
                <th>Nickname</th>
                <th>Dirección</th>
                <th>Celular</th>
                <th>Pedidos</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_CLIENTS.map((client) => (
                <tr key={client.id}>
                  <td>
                    <div className="action-buttons" style={{ justifyContent: 'center' }}>
                      <button
                        className="action-btn view"
                        onClick={() => navigate(`/admin/clients/${client.id}`)}
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
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-semibold text-sm">
                        {client.nickname.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium">{client.nickname}</span>
                    </div>
                  </td>
                  <td className="max-w-[200px] truncate" title={client.address}>
                    {client.address}
                  </td>
                  <td>{client.phone}</td>
                  <td>
                    <span className="font-semibold text-accent">{client.orderCount}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile List View - Dark Theme Row Design */}
        <div className="mobile-view dark-theme-list">
          <div className="search-bar-mobile">
            <Search size={20} />
            <input type="text" placeholder="Buscar clientes..." />
          </div>

          {MOCK_CLIENTS.map((client) => {
            // Split name for stacking if needed, or just let CSS handle wrapping
            const nameParts = client.fullName.split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ');

            return (
              <div
                key={client.id}
                className="mobile-client-row"
                onClick={() => navigate(`/admin/clients/${client.id}`)}
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
                      <span className="val">{client.nickname}</span>
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
          })}

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
                defaultValue={modalMode === 'edit' ? selectedClient?.nickname : ''}
              />
            </div>

            <div className="form-group">
              <label>Nombre Completo</label>
              <input
                type="text"
                placeholder="Ej. Juan Perez"
                defaultValue={modalMode === 'edit' ? selectedClient?.fullName : ''}
              />
            </div>

            <div className="form-group">
              <label>Número de Celular</label>
              <input
                type="tel"
                placeholder="+51 900 000 000"
                defaultValue={modalMode === 'edit' ? selectedClient?.phone : ''}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="ejemplo@correo.com"
                defaultValue={modalMode === 'edit' ? selectedClient?.email : ''}
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Dirección</label>
              <input
                type="text"
                placeholder="Av. Principal 123, Distrito"
                defaultValue={modalMode === 'edit' ? selectedClient?.address : ''}
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Referencia</label>
              <textarea
                rows={3}
                placeholder="Ej. Frente al parque, puerta azul..."
                style={{ resize: 'none' }}
                defaultValue={modalMode === 'edit' ? selectedClient?.reference : ''}
              />
            </div>

            <div className="form-group">
              <label>Foto de Perfil</label>
              <input type="file" accept="image/*" />
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
