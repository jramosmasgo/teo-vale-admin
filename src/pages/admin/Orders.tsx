import { useState } from 'react';
import { Search, Filter, Pencil, DollarSign, Eye, User, Phone, MapPin, Calendar, Clock, FileText } from 'lucide-react';
import './Orders.scss';
import Modal from '../../components/ui/Modal';

interface Order {
  id: string;
  clientName: string;
  clientPhone?: string;
  clientAddress?: string;
  amount: number;
  date: string;
  deliveredAt?: string;
  days: string[];
  shift: 'Mañana' | 'Tarde';
  description?: string;
}

const TODAY = new Date().toISOString().split('T')[0];

const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-001',
    clientName: 'Carlos Ruiz',
    clientPhone: '987654321',
    clientAddress: 'Av. Principal 123',
    amount: 150.00,
    date: TODAY,
    days: ['Lun', 'Mie', 'Vie'],
    shift: 'Mañana',
    description: '50 panes franceses'
  },
  {
    id: 'ORD-002',
    clientName: 'Maria Campos',
    clientPhone: '912345678',
    clientAddress: 'Jr. Los Andes 456',
    amount: 85.50,
    date: TODAY,
    days: ['Mar', 'Jue', 'Sab'],
    shift: 'Tarde',
    description: 'Pasteles variados'
  },
  {
    id: 'ORD-003',
    clientName: 'Lucia Fer',
    clientPhone: '998877665',
    clientAddress: 'Urb. Los Jardines Mz A Lt 5',
    amount: 320.00,
    date: TODAY,
    days: ['Lun', 'Mie', 'Vie', 'Dom'],
    shift: 'Mañana',
    description: 'Pedido especial restaurante'
  },
  {
    id: 'ORD-004',
    clientName: 'Ana Torres',
    clientPhone: '955443322',
    clientAddress: 'Calle Las Flores 789',
    amount: 45.00,
    date: TODAY,
    days: ['Sab', 'Dom'],
    shift: 'Tarde',
    description: 'Bocaditos'
  },
  {
    id: 'ORD-005',
    clientName: 'Pedro Sola',
    clientPhone: '966332211',
    clientAddress: 'Av. El Sol 321',
    amount: 150.00,
    date: TODAY,
    days: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie'],
    shift: 'Mañana',
    description: 'Pan de yema diario'
  },
  {
    id: 'ORD-006',
    clientName: 'Luisa Lane',
    clientPhone: '944556677',
    clientAddress: 'Psje. Los Pinos 101',
    amount: 95.00,
    date: TODAY,
    days: ['Dom'],
    shift: 'Tarde',
    description: 'Torta de chocolate'
  },
];

const Orders = () => {
  const [orders] = useState<Order[]>(MOCK_ORDERS);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleEdit = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setIsEditModalOpen(true);
    }
  };

  const handleViewDetails = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setIsDetailModalOpen(true);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditModalOpen(false);
    // Logic to save
  }

  return (
    <div className="page-content">
      <div className="header-actions">
        <div>
          <h1 className="text-2xl font-bold text-primary mb-1">Pedidos</h1>
          <p className="subtitle">Gestiona los pedidos y entregas de tus clientes</p>
        </div>
      </div>

      <div className="card">
        <div className="table-actions-bar">
          <div className="filters-left">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Buscar por cliente o ID..."
              />
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-bg-primary transition-colors text-text-secondary">
            <Filter size={18} />
            <span>Filtros</span>
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Fecha Pedido</th>
                <th>Días</th>
                <th>Turno</th>
                <th>Monto (S/.)</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="font-medium">{order.id}</td>
                  <td>{order.clientName}</td>
                  <td>{order.date}</td>
                  <td>
                    <div className="flex gap-1 flex-wrap">
                      {order.days.map(day => (
                        <span key={day} style={{ fontSize: '0.75rem', padding: '2px 6px', background: 'var(--bg-secondary)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                          {day}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', padding: '4px 8px', borderRadius: '12px', background: order.shift === 'Mañana' ? '#e0f2fe' : '#fef3c7', color: order.shift === 'Mañana' ? '#0369a1' : '#b45309', border: `1px solid ${order.shift === 'Mañana' ? '#bae6fd' : '#fde68a'}` }}>
                      {order.shift}
                    </span>
                  </td>
                  <td className="font-semibold">S/ {order.amount.toFixed(2)}</td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        className="btn-action info"
                        onClick={() => handleViewDetails(order.id)}
                        title="Ver Detalles"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="btn-action info"
                        onClick={() => handleEdit(order.id)}
                        title="Modificar Pedido"
                      >
                        <Pencil size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Editar Pedido ${selectedOrder?.id || ''}`}
      >
        {selectedOrder && (
          <form onSubmit={handleSave}>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Monto (S/)</label>
              <div className="input-wrapper" style={{ position: 'relative' }}>
                <DollarSign size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="number"
                  step="0.10"
                  defaultValue={selectedOrder.amount}
                  style={{ width: '100%', paddingLeft: '2.5rem', paddingRight: '1rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Turno</label>
              <div style={{ display: 'flex', gap: '2rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="radio" name="shift" defaultChecked={selectedOrder.shift === 'Mañana'} style={{ accentColor: 'var(--accent-color)' }} /> Mañana
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="radio" name="shift" defaultChecked={selectedOrder.shift === 'Tarde'} style={{ accentColor: 'var(--accent-color)' }} /> Tarde
                </label>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Días</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'].map(day => (
                  <label key={day} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.25rem 0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    backgroundColor: selectedOrder.days.includes(day) ? 'var(--bg-secondary)' : 'transparent'
                  }}>
                    <input type="checkbox" defaultChecked={selectedOrder.days.includes(day)} style={{ accentColor: 'var(--accent-color)' }} />
                    <span style={{ fontSize: '0.85rem' }}>{day}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Descripción</label>
              <textarea
                rows={3}
                defaultValue={selectedOrder.description}
                placeholder="Detalles del pedido..."
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button
                type="button"
                className="btn-link"
                onClick={() => setIsEditModalOpen(false)}
                style={{ padding: '0.75rem 1.5rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: 'var(--accent-color)', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
                Guardar Cambios
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Details Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Detalles del Pedido - ${selectedOrder?.id || ''}`}
      >
        {selectedOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Client Info Section */}
            <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0', color: 'var(--text-primary)', fontSize: '1rem' }}>
                <User size={18} /> Información del Cliente
              </h4>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Nombre:</span>
                  <span style={{ fontWeight: 500 }}>{selectedOrder.clientName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Phone size={14} /> Teléfono:
                  </span>
                  <span style={{ fontWeight: 500 }}>{selectedOrder.clientPhone || 'No registrado'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <MapPin size={14} /> Dirección:
                  </span>
                  <span style={{ fontWeight: 500 }}>{selectedOrder.clientAddress || 'No registrado'}</span>
                </div>
              </div>
            </div>

            {/* Order Info Section */}
            <div>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0', color: 'var(--text-primary)', fontSize: '1rem' }}>
                <FileText size={18} /> Detalles del Pedido
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="detail-item">
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>ID Pedido</label>
                  <p style={{ margin: 0, fontWeight: 500 }}>{selectedOrder.id}</p>
                </div>
                <div className="detail-item">
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Fecha Inicio</label>
                  <p style={{ margin: 0, fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar size={14} /> {selectedOrder.date}
                  </p>
                </div>
                <div className="detail-item">
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Turno</label>
                  <p style={{ margin: 0, fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={14} /> {selectedOrder.shift}
                  </p>
                </div>
                <div className="detail-item">
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Monto</label>
                  <p style={{ margin: 0, fontWeight: 600, color: 'var(--accent-color)', fontSize: '1.1rem' }}>S/ {selectedOrder.amount.toFixed(2)}</p>
                </div>
              </div>

              <div className="detail-item">
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Días de Entrega</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {selectedOrder.days.map(day => (
                    <span key={day} style={{ fontSize: '0.75rem', padding: '2px 8px', background: 'var(--bg-secondary)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                      {day}
                    </span>
                  ))}
                </div>
              </div>

              <div className="detail-item" style={{ marginTop: '1rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Descripción / Notas</label>
                <p style={{ margin: 0, padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem', fontStyle: selectedOrder.description ? 'normal' : 'italic', color: selectedOrder.description ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  {selectedOrder.description || 'Sin descripción adicional.'}
                </p>
              </div>
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setIsDetailModalOpen(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;
