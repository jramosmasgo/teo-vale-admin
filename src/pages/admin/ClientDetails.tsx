import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, User, Phone, MapPin, Mail, Calendar, DollarSign, FileText, Plus, Eye } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import './ClientDetails.scss';

const ClientDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [isOrdersListModalOpen, setIsOrdersListModalOpen] = useState(false);
    const [isOrderDetailModalOpen, setIsOrderDetailModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isPaymentDetailModalOpen, setIsPaymentDetailModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [selectedPayment, setSelectedPayment] = useState<any>(null);

    // Mock data - in real app fetch by ID
    const defaultClientData = {
        id: 1,
        fullName: "Juan Perez",
        nickname: "Juancho",
        phone: "+51 987 654 321",
        email: "juan.perez@example.com",
        address: "Av. Principal 123, Miraflores",
        reference: "Frente al parque Kennedy",
        status: 'active',
        totalDebt: 350.50,
        lastPaymentDate: "2023-10-15"
    };

    const clientData = { ...defaultClientData, ...(location.state?.client || {}) };

    const transactions = [
        { id: 1, date: "20/10/2023", time: "10:30 AM", amount: 15.00, type: 'debt', status: 'incomplete', user: 'Sistema' },
        { id: 2, date: "15/10/2023", time: "02:15 PM", amount: 50.00, type: 'payment', status: 'completed', user: 'Juan Perez' },
        { id: 3, date: "10/10/2023", time: "09:45 AM", amount: 25.50, type: 'debt', status: 'unpaid', user: 'Sistema' },
        { id: 4, date: "01/10/2023", time: "04:20 PM", amount: 10.00, type: 'payment', status: 'completed', user: 'Maria Caja' },
    ];

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'unpaid': return 'No Pagado';
            case 'incomplete': return 'Incompleto';
            case 'completed': return 'Completado';
            default: return status;
        }
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'unpaid': return 'status-unpaid';
            case 'incomplete': return 'status-incomplete';
            case 'completed': return 'status-completed';
            default: return '';
        }
    };

    const handleSaveOrder = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Saving order...");
        setIsOrderModalOpen(false);
    }

    const handleSavePayment = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Saving payment...");
        setIsPaymentModalOpen(false);
    }

    const handleViewOrder = (orderId: string) => {
        if (orderId === '-') return;
        // Mock fetching order details
        setSelectedOrder({
            id: orderId,
            status: 'Activo',
            startDate: '01/10/2023',
            amount: 15.00,
            days: ['Lunes', 'Miércoles', 'Viernes'],
            shift: 'Mañana',
            items: [
                { name: 'Pan Francés x 5', price: 2.50 },
                { name: 'Jugo de Naranja', price: 5.00 }
            ]
        });
        setIsOrderDetailModalOpen(true);
    };

    return (
        <div className="page-content client-details-page">
            {/* Header */}
            <div className="header-section">
                <div className="flex items-center gap-4">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                    </button>
                    <div className="client-title">
                        <h1>{clientData.fullName}</h1>
                        <p className="subtitle">ID: {id} • {clientData.nickname}</p>
                    </div>
                    <button
                        className="btn-secondary"
                        style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem', height: 'auto', minHeight: '32px' }}
                        onClick={() => setIsOrdersListModalOpen(true)}
                    >
                        Ver Pedidos
                    </button>
                </div>

                <button
                    className="btn-primary flex items-center gap-2"
                    onClick={() => setIsPaymentModalOpen(true)}
                >
                    <DollarSign size={20} />
                    Registrar Pago
                </button>
            </div>

            <div className="details-grid">
                {/* Left Col: Info */}
                <div className="info-card">
                    <h2>Información Personal</h2>

                    <div className="info-row">
                        <div className="icon"><Phone size={18} /></div>
                        <div className="data">
                            <label>Teléfono</label>
                            <p>{clientData.phone}</p>
                        </div>
                    </div>

                    <div className="info-row">
                        <div className="icon"><Mail size={18} /></div>
                        <div className="data">
                            <label>Email</label>
                            <p>{clientData.email}</p>
                        </div>
                    </div>

                    <div className="info-row">
                        <div className="icon"><MapPin size={18} /></div>
                        <div className="data">
                            <label>Dirección</label>
                            <p>{clientData.address}</p>
                        </div>
                    </div>

                    <div className="info-row">
                        <div className="icon"><FileText size={18} /></div>
                        <div className="data">
                            <label>Referencia</label>
                            <p>{clientData.reference}</p>
                        </div>
                    </div>

                    <div className="info-row">
                        <div className="icon"><Calendar size={18} /></div>
                        <div className="data">
                            <label>Fecha Registro</label>
                            <p>12 Enero 2023</p>
                        </div>
                    </div>
                </div>

                {/* Right Col: Debt Table */}
                <div className="debt-card">
                    <h2>Estado de Cuenta</h2>

                    <div className="stats-row">
                        <div className="stat-box">
                            <label>Deuda Total</label>
                            <div className="value debt">S/ {clientData.totalDebt.toFixed(2)}</div>
                        </div>
                        <div className="stat-box">
                            <label>Pagos no completados</label>
                            <div className="value">{9}</div>
                        </div>
                    </div>

                    <h3>Lista de Pagos</h3>
                    <table className="transactions-table">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Hora</th>
                                <th style={{ textAlign: 'right' }}>Monto (S/)</th>
                                <th style={{ textAlign: 'center' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(t => (
                                <tr key={t.id}>
                                    <td data-label="Fecha">
                                        <span className="date">{t.date}</span>
                                    </td>
                                    <td data-label="Hora">
                                        <span className="date">{t.time}</span>
                                    </td>
                                    <td data-label="Monto" style={{ textAlign: 'right' }} className={t.type === 'payment' ? 'amount-positive' : ''}>
                                        S/ {Math.abs(t.amount).toFixed(2)}
                                    </td>
                                    <td data-label="Acciones" style={{ textAlign: 'center' }}>
                                        <button
                                            className="action-btn view"
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: 'var(--text-secondary)',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: '0.25rem'
                                            }}
                                            onClick={() => {
                                                setSelectedPayment(t);
                                                setIsPaymentDetailModalOpen(true);
                                            }}
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isOrderModalOpen}
                onClose={() => setIsOrderModalOpen(false)}
                title="Registrar Nuevo Pedido"
            >
                <form onSubmit={handleSaveOrder}>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label>Monto del Pedido (S/)</label>
                        <div className="input-wrapper" style={{ position: 'relative' }}>
                            <DollarSign size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="number"
                                step="0.10"
                                min="0"
                                placeholder="0.00"
                                style={{ width: '100%', paddingLeft: '2.5rem', paddingRight: '1rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label>Descripción</label>
                        <textarea
                            placeholder="Detalles del pedido: ej. 5 panes francés, 1 leche gloria..."
                            rows={3}
                            style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', resize: 'none', fontFamily: 'inherit' }}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.75rem' }}>Días que recibirá el pedido</label>
                        <div className="days-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.75rem' }}>
                            {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(day => (
                                <label key={day} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                                    <input type="checkbox" value={day} style={{ width: '16px', height: '16px', accentColor: 'var(--accent-color)' }} />
                                    {day}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.75rem' }}>Turno de entrega</label>
                        <div className="radio-group" style={{ display: 'flex', gap: '2rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input type="radio" name="shift" value="morning" defaultChecked style={{ width: '18px', height: '18px', accentColor: 'var(--accent-color)' }} />
                                Mañana
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input type="radio" name="shift" value="afternoon" style={{ width: '18px', height: '18px', accentColor: 'var(--accent-color)' }} />
                                Tarde
                            </label>
                        </div>
                    </div>

                    <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button
                            type="button"
                            className="btn-link"
                            onClick={() => setIsOrderModalOpen(false)}
                            style={{ padding: '0.75rem 1.5rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}
                        >
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary">
                            Guardar Pedido
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Orders List Modal */}
            <Modal displayCustomContent={true} title="Lista de Pedidos" isOpen={isOrdersListModalOpen} onClose={() => setIsOrdersListModalOpen(false)}>
                <div style={{ padding: '1rem 0' }}>
                    <div className="table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                    <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>ID</th>
                                    <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Fecha Inicio</th>
                                    <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Días</th>
                                    <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Turno</th>
                                    <th style={{ textAlign: 'right', padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Monto</th>
                                    <th style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { id: '#ORD-001', start: '01/10/2023', days: 'L-M-V', shift: 'Mañana', amount: 150.00, status: 'Activo' },
                                    { id: '#ORD-002', start: '15/09/2023', days: 'S-D', shift: 'Tarde', amount: 80.50, status: 'Completado' },
                                    { id: '#ORD-003', start: '20/08/2023', days: 'L-M-X-J-V', shift: 'Mañana', amount: 250.00, status: 'Cancelado' }
                                ].map((order) => (
                                    <tr key={order.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '1rem', fontWeight: 500 }}>{order.id}</td>
                                        <td style={{ padding: '1rem' }}>{order.start}</td>
                                        <td style={{ padding: '1rem' }}>{order.days}</td>
                                        <td style={{ padding: '1rem' }}>{order.shift}</td>
                                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>S/ {order.amount.toFixed(2)}</td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                backgroundColor: order.status === 'Activo' ? 'var(--success-color)' : order.status === 'Completado' ? 'var(--accent-color)' : 'var(--text-secondary)',
                                                color: 'white',
                                                opacity: 0.9
                                            }}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                        className="btn-primary flex items-center gap-2"
                        onClick={() => {
                            setIsOrdersListModalOpen(false);
                            setIsOrderModalOpen(true);
                        }}
                    >
                        <Plus size={18} />
                        Nuevo Pedido
                    </button>
                    <button
                        type="button"
                        className="btn-link"
                        onClick={() => setIsOrdersListModalOpen(false)}
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        Cerrar
                    </button>
                </div>
            </Modal>

            {/* Order Detail Modal */}
            <Modal title={`Detalle del Pedido ${selectedOrder?.id || ''}`} isOpen={isOrderDetailModalOpen} onClose={() => setIsOrderDetailModalOpen(false)}>
                {selectedOrder && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="detail-item">
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Estado</label>
                                <span className={`status-badge ${selectedOrder.status === 'Activo' ? 'active' : 'inactive'}`} style={{ width: 'fit-content' }}>
                                    {selectedOrder.status}
                                </span>
                            </div>
                            <div className="detail-item">
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Fecha Inicio</label>
                                <p style={{ margin: 0, fontWeight: 500 }}>{selectedOrder.startDate}</p>
                            </div>
                            <div className="detail-item">
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Monto Diario</label>
                                <p style={{ margin: 0, fontWeight: 500 }}>S/ {selectedOrder.amount.toFixed(2)}</p>
                            </div>
                            <div className="detail-item">
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Turno</label>
                                <p style={{ margin: 0, fontWeight: 500 }}>{selectedOrder.shift}</p>
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Días de Entrega</label>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {selectedOrder.days.map((day: string) => (
                                    <span key={day} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.85rem' }}>
                                        {day}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Productos Incluidos</label>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {selectedOrder.items.map((item: any, idx: number) => (
                                    <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px dashed var(--border-color)' }}>
                                        <span>{item.name}</span>
                                        <span style={{ fontWeight: 600 }}>S/ {item.price.toFixed(2)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
                <div className="modal-footer" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        className="btn-primary"
                        onClick={() => setIsOrderDetailModalOpen(false)}
                    >
                        Cerrar
                    </button>
                </div>
            </Modal>

            {/* Register Payment Modal */}
            <Modal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                title="Registrar Pago"
            >
                <form onSubmit={handleSavePayment}>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label>Monto a Pagar (S/)</label>
                        <div className="input-wrapper" style={{ position: 'relative' }}>
                            <DollarSign size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="number"
                                step="0.10"
                                min="0"
                                placeholder="0.00"
                                style={{ width: '100%', paddingLeft: '2.5rem', paddingRight: '1rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                                required
                            />
                        </div>
                    </div>

                    <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button
                            type="button"
                            className="btn-link"
                            onClick={() => setIsPaymentModalOpen(false)}
                            style={{ padding: '0.75rem 1.5rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}
                        >
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary">
                            Registrar Pago
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Payment Detail Modal */}
            <Modal
                isOpen={isPaymentDetailModalOpen}
                onClose={() => setIsPaymentDetailModalOpen(false)}
                title="Detalle del Movimiento"
            >
                {selectedPayment && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                            <span style={{
                                fontSize: '2.5rem',
                                fontWeight: 700,
                                color: selectedPayment.type === 'payment' ? 'var(--success-color)' : 'var(--text-primary)'
                            }}>
                                S/ {Math.abs(selectedPayment.amount).toFixed(2)}
                            </span>
                            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                {selectedPayment.type === 'payment' ? 'Pago Realizado' : 'Deuda Generada'}
                            </p>
                        </div>

                        <div className="info-card" style={{ padding: '0', border: 'none', boxShadow: 'none' }}>
                            <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Fecha</span>
                                <span style={{ fontWeight: 500 }}>{selectedPayment.date}</span>
                            </div>
                            <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Hora</span>
                                <span style={{ fontWeight: 500 }}>{selectedPayment.time}</span>
                            </div>
                            <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Usuario Responsable</span>
                                <span style={{ fontWeight: 500 }}>{selectedPayment.user}</span>
                            </div>
                            <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>ID Transacción</span>
                                <span style={{ fontWeight: 500 }}>#{String(selectedPayment.id).padStart(6, '0')}</span>
                            </div>
                        </div>
                    </div>
                )}
                <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        className="btn-primary"
                        onClick={() => setIsPaymentDetailModalOpen(false)}
                    >
                        Cerrar
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default ClientDetails;
