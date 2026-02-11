import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Phone, MapPin, Calendar, DollarSign, FileText, Plus, Eye, User } from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import { clientApi } from '../../../api/client.api';
import { orderApi } from '../../../api/order.api';
import type { Client } from '../../../types/interfaces/client.interface';
import type { Order } from '../../../types/interfaces/order.interface';
import toast from 'react-hot-toast';
import './ClientDetails.scss';

const ClientDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [client, setClient] = useState<Client | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [isOrdersListModalOpen, setIsOrdersListModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isPaymentDetailModalOpen, setIsPaymentDetailModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<any>(null);
    const [orders, setOrders] = useState<Order[]>([]);

    const fetchClientOrders = async () => {
        if (!id) return;
        try {
            const data = await orderApi.getByClient(id);
            setOrders(data);
        } catch (error) {
            console.error('Error fetching client orders:', error);
            // toast.error('Error al cargar pedidos'); // Optional: silent fail or toast
        }
    };

    useEffect(() => {
        if (isOrdersListModalOpen) {
            fetchClientOrders();
        }
    }, [isOrdersListModalOpen, id]);

    // Order form state
    const [orderData, setOrderData] = useState<Partial<Order>>({
        amount: 0,
        description: '',
        orderDays: [],
        schedule: 'morning'
    });

    const daysOptions = [
        { label: 'Lunes', value: 'MONDAY' },
        { label: 'Martes', value: 'TUESDAY' },
        { label: 'Miércoles', value: 'WEDNESDAY' },
        { label: 'Jueves', value: 'THURSDAY' },
        { label: 'Viernes', value: 'FRIDAY' },
        { label: 'Sábado', value: 'SATURDAY' },
        { label: 'Domingo', value: 'SUNDAY' }
    ];

    // Mock debt data - preserved as requested
    const debtData = {
        totalDebt: 350.50,
        lastPaymentDate: "2023-10-15"
    };

    const fetchClientDetails = async () => {
        if (!id) return;
        try {
            setIsLoading(true);
            const data = await clientApi.getById(id);
            setClient(data);
        } catch (error) {
            console.error('Error fetching client details:', error);
            toast.error('Error al cargar detalles del cliente');
            // navigate('/admin/clients'); // Optional: redirect on error
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchClientDetails();
    }, [id]);

    const transactions = [
        { id: 1, date: "20/10/2023", time: "10:30 AM", amount: 15.00, type: 'debt', status: 'incomplete', user: 'Sistema' },
        { id: 2, date: "15/10/2023", time: "02:15 PM", amount: 50.00, type: 'payment', status: 'completed', user: 'Juan Perez' },
        { id: 3, date: "10/10/2023", time: "09:45 AM", amount: 25.50, type: 'debt', status: 'unpaid', user: 'Sistema' },
        { id: 4, date: "01/10/2023", time: "04:20 PM", amount: 10.00, type: 'payment', status: 'completed', user: 'Maria Caja' },
    ];

    const handleDayToggle = (day: string) => {
        setOrderData(prev => {
            const currentDays = prev.orderDays || [];
            if (currentDays.includes(day)) {
                return { ...prev, orderDays: currentDays.filter(d => d !== day) };
            } else {
                return { ...prev, orderDays: [...currentDays, day] };
            }
        });
    };

    const handleSaveOrder = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!id) return;
        if (!orderData.amount || orderData.amount <= 0) {
            toast.error('Ingrese un monto válido');
            return;
        }
        if (!orderData.orderDays || orderData.orderDays.length === 0) {
            toast.error('Seleccione al menos un día');
            return;
        }

        const currentYear = new Date().getFullYear();
        // Generate initials from fullName or alias
        const nameSource = client?.fullName || client?.alias || 'CLIENTE';
        const initials = nameSource
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 3);

        // Simple counter based on current loaded orders + 1
        // Note: For a robust multi-user system, this logic should ideall reside on the backend
        // or fetch the accurate count first. Here we use the client-side list count.
        const orderCount = (orders.length + 1).toString().padStart(3, '0');
        const generatedOrderCode = `${initials}${currentYear}-${orderCount}`;

        try {
            await orderApi.create({
                ...orderData,
                client: id,
                orderCode: generatedOrderCode,
                status: true
            } as Order);

            toast.success('Pedido creado exitosamente');
            setIsOrderModalOpen(false);
            setOrderData({
                amount: 0,
                description: '',
                orderDays: [],
                schedule: 'morning'
            });
            fetchClientOrders(); // Refresh orders list
        } catch (error: any) {
            console.error('Error creating order:', error);
            toast.error(error.response?.data?.message || 'Error al crear el pedido');
        }
    }

    const handleSavePayment = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Saving payment...");
        setIsPaymentModalOpen(false);
    }

    if (isLoading) {
        return <div className="page-content center-content">Cargando detalles...</div>;
    }

    if (!client) {
        return <div className="page-content center-content">Cliente no encontrado</div>;
    }

    return (
        <div className="page-content client-details-page">
            {/* Header */}
            <div className="header-section">
                <div className="flex items-center gap-4">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                    </button>
                    <div className="client-title">
                        <h1>{client.fullName}</h1>
                        <p className="subtitle">Alias: {client.alias || 'Sin alias'}</p>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                        <h2 style={{ margin: 0, border: 'none', padding: 0 }}>Información Personal</h2>
                    </div>

                    <div className="client-image-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                            <img
                                src={client.imageUrl || `https://ui-avatars.com/api/?name=${client.fullName}&background=random&size=200`}
                                alt={client.fullName}
                                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--bg-secondary)', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                            />
                            <button
                                className="edit-image-btn"
                                style={{
                                    position: 'absolute',
                                    bottom: '0',
                                    right: '0',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: 'var(--accent-color)',
                                    color: 'white',
                                    border: '2px solid var(--bg-secondary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                            </button>
                        </div>
                    </div>

                    <div className="info-row">
                        <div className="icon"><Phone size={18} /></div>
                        <div className="data">
                            <label>Teléfono</label>
                            <p>{client.phone || '-'}</p>
                        </div>
                    </div>

                    <div className="info-row">
                        <div className="icon"><MapPin size={18} /></div>
                        <div className="data">
                            <label>Dirección</label>
                            <p>{client.address || '-'}</p>
                        </div>
                    </div>

                    <div className="info-row">
                        <div className="icon"><FileText size={18} /></div>
                        <div className="data">
                            <label>Referencia</label>
                            <p>{client.reference || '-'}</p>
                        </div>
                    </div>

                    <div className="info-row">
                        <div className="icon"><Calendar size={18} /></div>
                        <div className="data">
                            <label>Fecha Registro</label>
                            <p>{client.createdAt ? new Date(client.createdAt).toLocaleDateString() : '-'}</p>
                        </div>
                    </div>

                    <div className="info-row">
                        <div className="icon"><User size={18} /></div>
                        <div className="data">
                            <label>Estado</label>
                            <span className={`badge ${client.active ? 'badge-success' : 'badge-danger'}`}>
                                {client.active ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Col: Debt Table */}
                <div className="debt-card">
                    <h2>Estado de Cuenta</h2>

                    <div className="stats-row">
                        <div className="stat-box">
                            <label>Deuda Total</label>
                            <div className="value debt">S/ {debtData.totalDebt.toFixed(2)}</div>
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
                                value={orderData.amount || ''}
                                onChange={(e) => setOrderData({ ...orderData, amount: parseFloat(e.target.value) })}
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
                            value={orderData.description}
                            onChange={(e) => setOrderData({ ...orderData, description: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)', resize: 'none', fontFamily: 'inherit' }}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.75rem' }}>Días que recibirá el pedido</label>
                        <div className="days-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.75rem' }}>
                            {daysOptions.map(option => (
                                <label key={option.value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                                    <input
                                        type="checkbox"
                                        checked={orderData.orderDays?.includes(option.value)}
                                        onChange={() => handleDayToggle(option.value)}
                                        style={{ width: '16px', height: '16px', accentColor: 'var(--accent-color)' }}
                                    />
                                    {option.label}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.75rem' }}>Turno de entrega</label>
                        <div className="radio-group" style={{ display: 'flex', gap: '2rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="shift"
                                    value="morning"
                                    checked={orderData.schedule === 'morning'}
                                    onChange={() => setOrderData({ ...orderData, schedule: 'morning' })}
                                    style={{ width: '18px', height: '18px', accentColor: 'var(--accent-color)' }}
                                />
                                Mañana
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="shift"
                                    value="afternoon"
                                    checked={orderData.schedule === 'afternoon'}
                                    onChange={() => setOrderData({ ...orderData, schedule: 'afternoon' })}
                                    style={{ width: '18px', height: '18px', accentColor: 'var(--accent-color)' }}
                                />
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
                        {orders.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                No hay pedidos registrados.
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                        <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>ID</th>
                                        <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Fecha Creación</th>
                                        <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Días</th>
                                        <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Turno</th>
                                        <th style={{ textAlign: 'right', padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Monto</th>
                                        <th style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '1rem', fontWeight: 500 }}>{order.orderCode || order._id?.substring(0, 6)}</td>
                                            <td style={{ padding: '1rem' }}>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}</td>
                                            <td style={{ padding: '1rem' }}>
                                                {order.orderDays?.map(day =>
                                                    daysOptions.find(opt => opt.value === day)?.label || day
                                                ).join(', ')}
                                            </td>
                                            <td style={{ padding: '1rem' }}>{order.schedule === 'morning' ? 'Mañana' : 'Tarde'}</td>
                                            <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>S/ {order.amount?.toFixed(2) || '0.00'}</td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '20px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    backgroundColor: order.status ? 'var(--success-color)' : 'var(--text-secondary)',
                                                    color: 'white',
                                                    opacity: 0.9
                                                }}>
                                                    {order.status ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
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
        </div >
    );
};

export default ClientDetails;
