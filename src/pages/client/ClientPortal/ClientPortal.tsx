import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { qrApi } from '../../../api/qr.api';
import { FileText, Package, DollarSign, Calendar, Info, Hash, Clock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../../components/ui/Modal';
import './ClientPortal.scss';

const ClientPortal = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [clientData, setClientData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'shipments' | 'payments' | 'orders'>('shipments');
    const [selectedShipment, setSelectedShipment] = useState<any>(null);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [selectedPayment, setSelectedPayment] = useState<any>(null);
    const token = searchParams.get('token');

    useEffect(() => {
        const fetchClientData = async () => {
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                const data = await qrApi.getByToken(token);
                if (!data) {
                    toast.error('Código QR inválido o expirado');
                    setIsLoading(false);
                    return;
                }

                if (isAuthenticated) {
                    // Si es admin, redirigir a los detalles del cliente en el panel admin
                    navigate(`/admin/clients/${data.client._id}`);
                    return;
                }

                setClientData(data);
            } catch (error) {
                console.error('Error fetching client data:', error);
                toast.error('Error al cargar la información del cliente');
            } finally {
                setIsLoading(false);
            }
        };

        fetchClientData();
    }, [token, isAuthenticated, navigate]);

    if (isLoading) {
        return (
            <div className="client-portal loading">
                <div className="spinner"></div>
                <p>Cargando información...</p>
            </div>
        );
    }

    if (!token || !clientData) {
        return (
            <div className="client-portal error">
                <div className="error-card">
                    <h1>¡Ups!</h1>
                    <p>No se pudo encontrar información con este código QR.</p>
                    <button className="btn-primary" onClick={() => navigate('/auth/login')}>
                        Ir al Inicio de Sesión
                    </button>
                </div>
            </div>
        );
    }

    const { client, summary, recentShipments } = clientData;

    return (
        <div className="client-portal-wrapper">
            <div className="client-portal">
                <div className="welcome-banner">
                    <div className="client-profile-header">
                        <img
                            src={client.imageUrl || `https://ui-avatars.com/api/?name=${client.fullName}&background=random&size=200`}
                            alt={client.fullName}
                            className="profile-img"
                        />
                        <div className="header-info">
                            <h1>¡Hola, {client.fullName}!</h1>
                            <p>Aquí tienes el resumen de tus pedidos y pagos.</p>
                        </div>
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <span className="label">Saldo Pendiente</span>
                        <span className={`value ${summary.balance > 0 ? 'danger' : 'success'}`}>
                            S/ {(summary.balance || 0).toFixed(2)}
                        </span>
                    </div>
                    <div className="stat-card">
                        <span className="label">Total Pedidos</span>
                        <span className="value">S/ {(summary.totalOrdered || 0).toFixed(2)}</span>
                    </div>
                    <div className="stat-card">
                        <span className="label">Total Pagado</span>
                        <span className="value success">S/ {(summary.totalPaid || 0).toFixed(2)}</span>
                    </div>
                </div>

                <div className="portal-tabs-section">
                    <div className="tabs-header">
                        <button
                            className={`tab-btn ${activeTab === 'shipments' ? 'active' : ''}`}
                            onClick={() => setActiveTab('shipments')}
                        >
                            <Package size={18} />
                            <span>Entregas</span>
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                            onClick={() => setActiveTab('orders')}
                        >
                            <FileText size={18} />
                            <span>Pedidos</span>
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
                            onClick={() => setActiveTab('payments')}
                        >
                            <DollarSign size={18} />
                            <span>Pagos</span>
                        </button>
                    </div>

                    <div className="tab-content">
                        {activeTab === 'shipments' && (
                            <div className="card history-card">
                                <h2>Últimas Entregas</h2>
                                <div className="shipment-list">
                                    {recentShipments && recentShipments.length > 0 ? (
                                        recentShipments.map((shipment: any) => (
                                            <div
                                                key={shipment._id}
                                                className="shipment-item"
                                                onClick={() => setSelectedShipment(shipment)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div className="shipment-icon">
                                                    <Package size={20} />
                                                </div>
                                                <div className="shipment-details">
                                                    <div className="top-row">
                                                        <span className="date">
                                                            {new Date(shipment.deliveryDate).toLocaleDateString('es-ES', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric'
                                                            })}
                                                        </span>
                                                        <span className="amount">S/ {(shipment.amount || 0).toFixed(2)}</span>
                                                    </div>
                                                    <div className="bottom-row">
                                                        <span className={`status ${shipment.paymentStatus}`}>
                                                            {shipment.paymentStatus === 'COMPLETED' ? 'Pagado' :
                                                                shipment.paymentStatus === 'INCOMPLETE' ? 'Parcial' : 'Pendiente'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="no-data">No se registraron entregas recientes.</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div className="card orders-card">
                                <h2>Mis Pedidos Activos</h2>
                                <div className="shipment-list">
                                    {clientData?.orders && clientData.orders.length > 0 ? (
                                        clientData.orders.map((order: any) => (
                                            <div
                                                key={order._id}
                                                className="shipment-item order-item"
                                                onClick={() => setSelectedOrder(order)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div className="shipment-icon">
                                                    <FileText size={20} />
                                                </div>
                                                <div className="shipment-details">
                                                    <div className="top-row">
                                                        <span className="order-code">{order.orderCode}</span>
                                                        <span className="amount">S/ {(order.amount || 0).toFixed(2)}</span>
                                                    </div>
                                                    <div className="bottom-row">
                                                        <span className="days">
                                                            {order.orderDays?.map((day: string) => {
                                                                const translations: { [key: string]: string } = {
                                                                    'MONDAY': 'Lunes',
                                                                    'TUESDAY': 'Martes',
                                                                    'WEDNESDAY': 'Miércoles',
                                                                    'THURSDAY': 'Jueves',
                                                                    'FRIDAY': 'Viernes',
                                                                    'SATURDAY': 'Sábado',
                                                                    'SUNDAY': 'Domingo'
                                                                };
                                                                return translations[day] || day;
                                                            }).join(', ')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="no-data">No tienes pedidos activos.</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'payments' && (
                            <div className="card payments-card">
                                <h2>Historial de Pagos</h2>
                                <div className="shipment-list">
                                    {clientData?.payments && clientData.payments.length > 0 ? (
                                        clientData.payments.map((payment: any) => (
                                            <div
                                                key={payment._id}
                                                className="shipment-item payment-item"
                                                onClick={() => setSelectedPayment(payment)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div className="shipment-icon payment-icon">
                                                    <DollarSign size={20} />
                                                </div>
                                                <div className="shipment-details">
                                                    <div className="top-row">
                                                        <span className="date">
                                                            {new Date(payment.paymentDate).toLocaleDateString('es-ES', {
                                                                day: 'numeric',
                                                                month: 'long',
                                                                year: 'numeric'
                                                            })}
                                                        </span>
                                                        <span className="amount success">S/ {(payment.amountPaid || 0).toFixed(2)}</span>
                                                    </div>
                                                    <div className="bottom-row">
                                                        <span className="code">{payment.paymentCode}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="no-data">No se registraron pagos aún.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Shipment Detail Modal */}
            <Modal
                isOpen={!!selectedShipment}
                onClose={() => setSelectedShipment(null)}
                title="Detalle de Entrega"
            >
                {selectedShipment && (
                    <div className="portal-detail-modal">
                        <div className="detail-header-stats">
                            <div className="stat">
                                <label>Monto Total</label>
                                <span className="value">S/ {(selectedShipment.amount || 0).toFixed(2)}</span>
                            </div>
                            <div className="stat">
                                <label>Monto Pagado</label>
                                <span className="value success">S/ {selectedShipment.amountPaid?.toFixed(2) || '0.00'}</span>
                            </div>
                        </div>

                        <div className="detail-info-list">
                            <div className="detail-row">
                                <Calendar size={18} />
                                <div className="info">
                                    <label>Fecha de Entrega</label>
                                    <p>{new Date(selectedShipment.deliveryDate).toLocaleDateString('es-ES', {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}</p>
                                </div>
                            </div>
                            <div className="detail-row">
                                <Info size={18} />
                                <div className="info">
                                    <label>Estado de Pago</label>
                                    <p>
                                        <span className={`status-badge ${selectedShipment.paymentStatus}`}>
                                            {selectedShipment.paymentStatus === 'COMPLETED' ? 'Totalmente Pagado' :
                                                selectedShipment.paymentStatus === 'INCOMPLETE' ? 'Pago Parcial' : 'Pendiente de Pago'}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            {selectedShipment.order?.orderCode && (
                                <div className="detail-row">
                                    <Hash size={18} />
                                    <div className="info">
                                        <label>Código de Pedido</label>
                                        <p>{selectedShipment.order.orderCode}</p>
                                    </div>
                                </div>
                            )}
                            {selectedShipment.notes && (
                                <div className="detail-row">
                                    <FileText size={18} />
                                    <div className="info">
                                        <label>Notas / Observaciones</label>
                                        <p className="description">{selectedShipment.notes}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            {/* Order Detail Modal */}
            <Modal
                isOpen={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
                title="Detalle del Pedido"
            >
                {selectedOrder && (
                    <div className="portal-detail-modal">
                        <div className="detail-header-stats">
                            <div className="stat">
                                <label>Monto por Entrega</label>
                                <span className="value">S/ {(selectedOrder.amount || 0).toFixed(2)}</span>
                            </div>
                            <div className="stat">
                                <label>Código</label>
                                <span className="value accent">{selectedOrder.orderCode}</span>
                            </div>
                        </div>

                        <div className="detail-info-list">
                            <div className="detail-row">
                                <Clock size={18} />
                                <div className="info">
                                    <label>Horario de Entrega</label>
                                    <p>{selectedOrder.schedule || 'No especificado'}</p>
                                </div>
                            </div>
                            <div className="detail-row">
                                <Calendar size={18} />
                                <div className="info">
                                    <label>Días de Entrega</label>
                                    <p>{selectedOrder.orderDays?.map((day: string) => {
                                        const translations: { [key: string]: string } = {
                                            'MONDAY': 'Lunes', 'TUESDAY': 'Martes', 'WEDNESDAY': 'Miércoles',
                                            'THURSDAY': 'Jueves', 'FRIDAY': 'Viernes', 'SATURDAY': 'Sábado', 'SUNDAY': 'Domingo'
                                        };
                                        return translations[day] || day;
                                    }).join(', ') || 'No especificados'}</p>
                                </div>
                            </div>
                            <div className="detail-row">
                                <FileText size={18} />
                                <div className="info" style={{ width: '100%' }}>
                                    <label>Detalle de Productos</label>
                                    <div className="items-table-container">
                                        {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                            <table className="items-table">
                                                <thead>
                                                    <tr>
                                                        <th>Producto</th>
                                                        <th className="price-col">Precio</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedOrder.items.map((item: any, index: number) => (
                                                        <tr key={index}>
                                                            <td>{item.name}</td>
                                                            <td className="price-col">S/ {item.price.toFixed(2)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <p className="description" style={{ margin: 0 }}>No hay items registrados.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="detail-row">
                                <CheckCircle2 size={18} />
                                <div className="info">
                                    <label>Estado del Pedido</label>
                                    <p>
                                        <span className={`status-badge ${selectedOrder.status ? 'COMPLETED' : 'UNPAID'}`}>
                                            {selectedOrder.status ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Payment Detail Modal */}
            <Modal
                isOpen={!!selectedPayment}
                onClose={() => setSelectedPayment(null)}
                title="Detalle de Pago"
            >
                {selectedPayment && (
                    <div className="portal-detail-modal">
                        <div className="detail-header-stats">
                            <div className="stat">
                                <label>Monto Pagado</label>
                                <span className="value success">S/ {(selectedPayment.amountPaid || 0).toFixed(2)}</span>
                            </div>
                            <div className="stat">
                                <label>Código de Pago</label>
                                <span className="value accent">{selectedPayment.paymentCode}</span>
                            </div>
                        </div>

                        <div className="detail-info-list">
                            <div className="detail-row">
                                <Calendar size={18} />
                                <div className="info">
                                    <label>Fecha de Pago</label>
                                    <p>{new Date(selectedPayment.paymentDate).toLocaleDateString('es-ES', {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}</p>
                                </div>
                            </div>
                            <div className="detail-row">
                                <Clock size={18} />
                                <div className="info">
                                    <label>Registrado el</label>
                                    <p>{new Date(selectedPayment.createdAt).toLocaleDateString('es-ES', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}</p>
                                </div>
                            </div>
                            {selectedPayment.notes && (
                                <div className="detail-row">
                                    <FileText size={18} />
                                    <div className="info">
                                        <label>Notas / Concepto</label>
                                        <p className="description">{selectedPayment.notes}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ClientPortal;

