import { useState } from 'react';
import { Search, Filter, Pencil, XCircle, CheckCircle, Eye } from 'lucide-react';
import './Deliveries.scss';
import Modal from '../../components/ui/Modal';

interface Delivery {
    id: string;
    clientName: string;
    amount: number;
    status: 'entregado' | 'pendiente';
    date: string;
    shift: 'Mañana' | 'Tarde';
    items?: { name: string; quantity: number }[];
}

const TODAY = new Date().toISOString().split('T')[0];

const MOCK_DELIVERIES: Delivery[] = [
    {
        id: 'ENT-001',
        clientName: 'Carlos Ruiz',
        amount: 150.00,
        status: 'entregado',
        date: TODAY,
        shift: 'Mañana',
        items: [{ name: 'Pan Francés', quantity: 50 }, { name: 'Kekes', quantity: 10 }]
    },
    {
        id: 'ENT-002',
        clientName: 'Maria Campos',
        amount: 85.50,
        status: 'pendiente',
        date: TODAY,
        shift: 'Tarde',
        items: [{ name: 'Pasteles Surtidos', quantity: 20 }]
    },
    {
        id: 'ENT-003',
        clientName: 'Lucia Fer',
        amount: 320.00,
        status: 'entregado',
        date: TODAY,
        shift: 'Mañana',
        items: [{ name: 'Pan Ciabatta', quantity: 100 }, { name: 'Empanadas', quantity: 30 }]
    },
    {
        id: 'ENT-004',
        clientName: 'Ana Torres',
        amount: 45.00,
        status: 'pendiente',
        date: TODAY,
        shift: 'Tarde',
        items: [{ name: 'Alfajores', quantity: 15 }]
    },
    {
        id: 'ENT-005',
        clientName: 'Pedro Sola',
        amount: 150.00,
        status: 'pendiente',
        date: TODAY,
        shift: 'Mañana',
        items: [{ name: 'Pan de Yema', quantity: 80 }]
    },
    {
        id: 'ENT-006',
        clientName: 'Luisa Lane',
        amount: 95.00,
        status: 'entregado',
        date: TODAY,
        shift: 'Tarde',
        items: [{ name: 'Tartas', quantity: 5 }]
    },
];

const Deliveries = () => {
    const [deliveries] = useState<Delivery[]>(MOCK_DELIVERIES);
    const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleViewDetails = (delivery: Delivery) => {
        setSelectedDelivery(delivery);
        setIsDetailModalOpen(true);
    };

    const handleEdit = (delivery: Delivery) => {
        setSelectedDelivery(delivery);
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = (type: 'today' | 'future') => {
        console.log(`Saving edit type: ${type} for delivery ${selectedDelivery?.id}`);
        setIsEditModalOpen(false);
    };

    return (
        <div className="page-content">
            <div className="header-actions">
                <div>
                    <h1 className="text-2xl font-bold text-primary mb-1">Entregas</h1>
                    <p className="subtitle">Gestiona el estado de las entregas a clientes</p>
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
                        <input
                            type="date"
                            className="date-filter"
                        />
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
                                <th>ID Entrega</th>
                                <th>Cliente</th>
                                <th>Fecha Entrega</th>
                                <th>Turno</th>
                                <th>Monto (S/.)</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deliveries.map((delivery) => (
                                <tr key={delivery.id}>
                                    <td className="font-medium">{delivery.id}</td>
                                    <td>{delivery.clientName}</td>
                                    <td>{delivery.date}</td>
                                    <td>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '12px',
                                            backgroundColor: 'var(--bg-primary)',
                                            border: '1px solid var(--border-color)',
                                            fontSize: '0.85rem'
                                        }}>
                                            {delivery.shift}
                                        </span>
                                    </td>
                                    <td className="font-semibold">S/ {delivery.amount.toFixed(2)}</td>
                                    <td>
                                        <span className={`badge ${delivery.status === 'entregado' ? 'paid' : 'pending'}`}>
                                            {delivery.status === 'entregado' ? (
                                                <div className="flex items-center gap-1">
                                                    <CheckCircle size={12} /> Entregado
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1">
                                                    <XCircle size={12} /> Pendiente
                                                </div>
                                            )}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button
                                                className="btn-action info"
                                                onClick={() => handleViewDetails(delivery)}
                                                title="Ver Detalles"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                className="btn-action info"
                                                onClick={() => handleEdit(delivery)}
                                                title="Modificar Entrega"
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

            {/* Delivery Details Modal */}
            <Modal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                title={`Detalles de Entrega - ${selectedDelivery?.id}`}
            >
                {selectedDelivery && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="detail-item">
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Cliente</label>
                                <p style={{ margin: 0, fontWeight: 500, fontSize: '1rem' }}>{selectedDelivery.clientName}</p>
                            </div>
                            <div className="detail-item">
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Estado</label>
                                <span className={`badge ${selectedDelivery.status === 'entregado' ? 'paid' : 'pending'}`} style={{ display: 'inline-block', marginTop: '0.25rem' }}>
                                    {selectedDelivery.status === 'entregado' ? 'Entregado' : 'Pendiente'}
                                </span>
                            </div>
                            <div className="detail-item">
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Fecha</label>
                                <p style={{ margin: 0, fontWeight: 500 }}>{selectedDelivery.date}</p>
                            </div>
                            <div className="detail-item">
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Turno</label>
                                <p style={{ margin: 0, fontWeight: 500 }}>{selectedDelivery.shift}</p>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '0.75rem' }}>Productos a Entregar</label>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {selectedDelivery.items?.map((item, idx) => (
                                    <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px dashed var(--border-color)' }}>
                                        <span>{item.name}</span>
                                        <span style={{ fontWeight: 600 }}>x{item.quantity}</span>
                                    </li>
                                )) || <li style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No hay items registrados</li>}
                            </ul>
                        </div>

                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '1rem', fontWeight: 600 }}>Total del Pedido</span>
                            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-color)' }}>S/ {selectedDelivery.amount.toFixed(2)}</span>
                        </div>
                    </div>
                )}
                <div className="modal-footer" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        className="btn-primary"
                        onClick={() => setIsDetailModalOpen(false)}
                    >
                        Cerrar
                    </button>
                </div>
            </Modal>

            {/* Edit Delivery Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title={`Modificar Entrega - ${selectedDelivery?.id}`}
            >
                {selectedDelivery && (
                    <form onSubmit={(e) => e.preventDefault()}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Monto (S/)</label>
                            <input
                                type="number"
                                defaultValue={selectedDelivery.amount}
                                step="0.10"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--bg-primary)',
                                    color: 'var(--text-primary)'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Productos</label>
                            <textarea
                                rows={4}
                                defaultValue={selectedDelivery.items?.map(i => `${i.quantity} x ${i.name}`).join('\n')}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--bg-primary)',
                                    color: 'var(--text-primary)',
                                    fontFamily: 'inherit',
                                    resize: 'vertical'
                                }}
                            />
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                Edite los productos línea por línea.
                            </p>
                        </div>

                        <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => handleSaveEdit('today')}
                                style={{ flex: 1 }}
                            >
                                Modificar por Hoy
                            </button>
                            <button
                                type="button"
                                className="btn-primary"
                                onClick={() => handleSaveEdit('future')}
                                style={{ flex: 1 }}
                            >
                                De Ahora en Adelante
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default Deliveries;
