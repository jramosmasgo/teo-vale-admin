import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Phone, MapPin, Calendar, DollarSign, FileText, Plus, Eye, User, X, Camera, Trash2, QrCode, Download, CreditCard, Truck } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { qrApi } from '../../../api/qr.api';
import Modal from '../../../components/ui/Modal';
import { clientApi } from '../../../api/client.api';
import { orderApi } from '../../../api/order.api';
import { shipmentApi } from '../../../api/shipment.api';
import { paymentApi } from '../../../api/payment.api';
import { useAuth } from '../../../context/AuthContext';
import type { Client } from '../../../types/interfaces/client.interface';
import type { Order } from '../../../types/interfaces/order.interface';
import type { Shipment } from '../../../types/interfaces/shipment.interface';
import type { Payment } from '../../../types/interfaces/payment.interface';
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
    const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [paymentAmount, setPaymentAmount] = useState<number | string>('');
    const { user } = useAuth();
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Shipment state
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [isShipmentsLoading, setIsShipmentsLoading] = useState(false);
    const [shipmentFilters, setShipmentFilters] = useState({
        startDate: '',
        endDate: '',
        paymentStatus: ''
    });
    const [shipmentsPage, setShipmentsPage] = useState(1);
    const [totalShipments, setTotalShipments] = useState(0);
    const [totalDebt, setTotalDebt] = useState(0);
    const [pendingPaymentsCount, setPendingPaymentsCount] = useState(0);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [qrToken, setQrToken] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'shipments' | 'payments'>('shipments');
    const [generatingShipmentForOrder, setGeneratingShipmentForOrder] = useState<string | null>(null);

    // Payments state
    const [payments, setPayments] = useState<Payment[]>([]);
    const [isPaymentsLoading, setIsPaymentsLoading] = useState(false);
    const [paymentsPage, setPaymentsPage] = useState(1);
    const [totalPayments, setTotalPayments] = useState(0);

    const fetchClientOrders = async () => {
        if (!id) return;
        try {
            const data = await orderApi.getByClient(id);
            setOrders(data);
        } catch (error) {
            console.error('Error fetching client orders:', error);
        }
    };

    const handleGenerateShipmentForOrder = async (orderId: string) => {
        setGeneratingShipmentForOrder(orderId);
        try {
            const result = await shipmentApi.generateForOrder(orderId);
            if (result.alreadyExists) {
                toast('Ya existe una entrega para este pedido hoy.', { icon: '⚠️' });
            } else {
                toast.success('Entrega generada correctamente para hoy.');
                fetchShipments(); // Refrescar la lista de shipments
            }
        } catch (error) {
            toast.error('Error al generar la entrega.');
        } finally {
            setGeneratingShipmentForOrder(null);
        }
    };

    const fetchShipments = useCallback(async () => {
        if (!id) return;
        try {
            setIsShipmentsLoading(true);
            const data = await shipmentApi.getByClient(id, shipmentsPage, 10, {
                startDate: shipmentFilters.startDate || undefined,
                endDate: shipmentFilters.endDate || undefined,
                paymentStatus: shipmentFilters.paymentStatus || undefined
            });
            console.log(data);
            setShipments(data.shipments);
            setTotalShipments(data.total);
            setTotalDebt(data.totalDebt);
            setPendingPaymentsCount(data.pendingCount);
        } catch (error) {
            console.error('Error fetching shipments:', error);
            toast.error('Error al cargar envíos');
        } finally {
            setIsShipmentsLoading(false);
        }
    }, [id, shipmentsPage, shipmentFilters]);

    const fetchPayments = useCallback(async () => {
        if (!id) return;
        try {
            setIsPaymentsLoading(true);
            const data = await paymentApi.getAll(paymentsPage, 10, { clientId: id });
            setPayments(data.payments);
            setTotalPayments(data.total);
        } catch (error) {
            console.error('Error fetching payments:', error);
            toast.error('Error al cargar pagos');
        } finally {
            setIsPaymentsLoading(false);
        }
    }, [id, paymentsPage]);

    useEffect(() => {
        if (id) {
            fetchShipments();
        }
    }, [fetchShipments]);

    useEffect(() => {
        if (id) {
            fetchPayments();
        }
    }, [fetchPayments]);

    // Order form state
    const [orderData, setOrderData] = useState<Partial<Order>>({
        amount: 0,
        items: [{ name: '', price: 0 }],
        orderDays: [],
        schedule: 'morning'
    });

    const handleAddItem = () => {
        setOrderData(prev => ({
            ...prev,
            items: [...(prev.items || []), { name: '', price: 0 }]
        }));
    };

    const handleRemoveItem = (index: number) => {
        setOrderData(prev => ({
            ...prev,
            items: (prev.items || []).filter((_, i) => i !== index)
        }));
    };

    const handleItemChange = (index: number, field: 'name' | 'price', value: string | number) => {
        setOrderData(prev => {
            const newItems = [...(prev.items || [])];
            newItems[index] = { ...newItems[index], [field]: value };

            // Recalculate amount
            const newAmount = newItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

            return { ...prev, items: newItems, amount: newAmount };
        });
    };

    const daysOptions = [
        { label: 'Lunes', value: 'MONDAY' },
        { label: 'Martes', value: 'TUESDAY' },
        { label: 'Miércoles', value: 'WEDNESDAY' },
        { label: 'Jueves', value: 'THURSDAY' },
        { label: 'Viernes', value: 'FRIDAY' },
        { label: 'Sábado', value: 'SATURDAY' },
        { label: 'Domingo', value: 'SUNDAY' }
    ];

    const fetchClientDetails = async () => {
        if (!id) return;
        try {
            setIsLoading(true);
            const data = await clientApi.getById(id);
            setClient(data);
        } catch (error) {
            console.error('Error fetching client details:', error);
            toast.error('Error al cargar detalles del cliente');
        } finally {
            setIsLoading(false);
        }
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
            const response = await clientApi.uploadProfileImage(id || '', file);
            toast.success('Imagen de perfil actualizada');

            // Actualizar el cliente con la nueva imagen
            if (response.client) {
                setClient(response.client);
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Error al subir la imagen');
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleDeleteImage = async () => {
        if (!client?.imageUrl) return;

        if (!confirm('¿Estás seguro de que deseas eliminar la foto de perfil del cliente?')) {
            return;
        }

        setIsUploadingImage(true);
        try {
            const response = await clientApi.deleteProfileImage(id || '');
            toast.success('Imagen de perfil eliminada');

            // Actualizar el cliente
            if (response.client) {
                setClient(response.client);
            }
        } catch (error) {
            console.error('Error deleting image:', error);
            toast.error('Error al eliminar la imagen');
        } finally {
            setIsUploadingImage(false);
        }
    };

    useEffect(() => {
        setQrToken('');
        fetchClientDetails();
        fetchClientOrders();
    }, [id]);

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
        const nameSource = client?.fullName || client?.alias || 'CLIENTE';
        const initials = nameSource
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 3);

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
                items: [{ name: '', price: 0 }],
                orderDays: [],
                schedule: 'morning'
            });
            fetchClientOrders();
        } catch (error: any) {
            console.error('Error creating order:', error);
            toast.error(error.response?.data?.message || 'Error al crear el pedido');
        }
    }

    const handleSavePayment = async (e: React.FormEvent) => {
        e.preventDefault();

        const amount = Number(paymentAmount);

        if (!id || !amount || amount <= 0) {
            toast.error('Ingrese un monto válido');
            return;
        }

        if (amount > totalDebt) {
            toast.error(`El monto no puede ser mayor a la deuda total (S/ ${totalDebt.toFixed(2)})`);
            return;
        }

        const confirmPayment = window.confirm(`¿Está seguro de registrar un pago de S/ ${amount.toFixed(2)}?`);

        if (!confirmPayment) return;

        try {
            const now = new Date();
            const paymentCode = `PAY-${Date.now()}`;
            const paymentTime = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false });

            await paymentApi.create({
                client: id,
                amountPaid: amount,
                paymentCode,
                registeredBy: user?._id || '',
                paymentDate: now.toISOString(),
                paymentTime
            });

            toast.success('Pago registrado exitosamente');
            setIsPaymentModalOpen(false);
            setPaymentAmount('');

            // Recargar datos
            fetchShipments();
            fetchPayments();
        } catch (error: any) {
            console.error('Error registering payment:', error);
            toast.error(error.response?.data?.message || 'Error al registrar el pago');
        }
    }

    const resetFilters = () => {
        setShipmentFilters({
            startDate: '',
            endDate: '',
            paymentStatus: ''
        });
        setShipmentsPage(1);
        setPaymentsPage(1);
    };

    const handleShowQr = async () => {
        if (!id) return;
        try {
            if (!qrToken) {
                const data = await qrApi.getClientQr(id);
                setQrToken(data.qrToken);
            }
            setIsQrModalOpen(true);
        } catch (error) {
            console.error(error);
            toast.error('Error al obtener el código QR');
        }
    };

    const handleDownloadQr = () => {
        const canvas = document.getElementById('qr-code-canvas') as HTMLCanvasElement;
        if (canvas) {
            const pngUrl = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.href = pngUrl;
            downloadLink.download = `QR-${client?.fullName || 'cliente'}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    };

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
                <div className="header-identity">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                    </button>
                    <div className="client-title">
                        <h1>{client.fullName}</h1>
                        <p className="subtitle">Alias: {client.alias || 'Sin alias'}</p>
                    </div>
                </div>

                <div className="header-actions">
                    <div className="secondary-actions">
                        <button
                            className="btn-secondary"
                            onClick={() => setIsOrdersListModalOpen(true)}
                        >
                            Ver Pedidos
                        </button>
                        <button
                            className="btn-secondary"
                            onClick={handleShowQr}
                        >
                            <QrCode size={16} />
                            Ver QR
                        </button>
                    </div>

                    <button
                        className="btn-primary flex items-center gap-2 register-payment-btn"
                        onClick={() => setIsPaymentModalOpen(true)}
                    >
                        <DollarSign size={20} />
                        Registrar Pago
                    </button>
                </div>
            </div>


            <div className="details-grid">
                {/* Left Col: Info */}
                <div className="info-card">
                    <div className="card-header">
                        <h2>Información Personal</h2>
                    </div>

                    <div className="client-profile-header">
                        <div className="profile-image-section">
                            <img
                                src={client.imageUrl || `https://ui-avatars.com/api/?name=${client.fullName}&background=random&size=200`}
                                alt={client.fullName}
                                className="profile-img"
                            />
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                            />
                            <button
                                onClick={handleImageClick}
                                disabled={isUploadingImage}
                                className="img-action-btn edit-img"
                                title="Cambiar foto"
                            >
                                <Camera size={14} />
                            </button>
                            {client.imageUrl && (
                                <button
                                    onClick={handleDeleteImage}
                                    disabled={isUploadingImage}
                                    className="img-action-btn delete-img"
                                    title="Eliminar foto"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>

                        <div className="financial-stats-grid">
                            <div className="stat-item">
                                <span className="stat-label">Deuda Total</span>
                                <span className="stat-value debt">S/ {totalDebt.toFixed(2)}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Pendientes</span>
                                <span className="stat-value">{pendingPaymentsCount}</span>
                            </div>
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
                            <p
                                className={client.address ? "clickable-address" : ""}
                                onClick={() => client.address && window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${client.address}, Huancayo, Peru`)}`, '_blank')}
                                title={client.address ? "Ver en Google Maps" : ""}
                            >
                                {client.address || '-'}
                            </p>
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

                {/* Right Col: Tabs and Tables */}
                <div className="debt-card">
                    <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                        <div className="stat-box" style={{ background: 'var(--bg-primary)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Deuda Total</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: totalDebt > 0 ? 'var(--danger-color)' : 'var(--success-color)' }}>
                                S/ {totalDebt.toFixed(2)}
                            </span>
                        </div>
                        <div className="stat-box" style={{ background: 'var(--bg-primary)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Pagos Pendientes</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                                {pendingPaymentsCount}
                            </span>
                        </div>
                    </div>

                    <div className="tabs-header">
                        <div className="tabs-buttons">
                            <button
                                className={`tab-btn ${activeTab === 'shipments' ? 'active' : ''}`}
                                onClick={() => setActiveTab('shipments')}
                            >
                                <Calendar size={18} />
                                Historial de Envíos
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
                                onClick={() => setActiveTab('payments')}
                            >
                                <DollarSign size={18} />
                                Lista de Pagos
                            </button>
                        </div>
                        <button className="btn-icon" onClick={resetFilters} title="Limpiar filtros">
                            <X size={18} />
                        </button>
                    </div>

                    {activeTab === 'shipments' ? (
                        <>
                            <div className="section-header">
                                <h2>Envíos Realizados</h2>
                            </div>

                            <div className="filters-container">
                                <div className="filter-group">
                                    <label>Desde</label>
                                    <div className="input-wrapper" style={{ position: 'relative' }}>
                                        <Calendar size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', zIndex: 10 }} />
                                        <input
                                            type="date"
                                            className="filter-input"
                                            value={shipmentFilters.startDate}
                                            onChange={(e) => setShipmentFilters({ ...shipmentFilters, startDate: e.target.value })}
                                            style={{ paddingLeft: '2.75rem' }}
                                        />
                                    </div>
                                </div>
                                <div className="filter-group">
                                    <label>Hasta</label>
                                    <div className="input-wrapper" style={{ position: 'relative' }}>
                                        <Calendar size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', zIndex: 10 }} />
                                        <input
                                            type="date"
                                            className="filter-input"
                                            value={shipmentFilters.endDate}
                                            onChange={(e) => setShipmentFilters({ ...shipmentFilters, endDate: e.target.value })}
                                            style={{ paddingLeft: '2.75rem' }}
                                        />
                                    </div>
                                </div>
                                <div className="filter-group">
                                    <label>Estado Pago</label>
                                    <div className="input-wrapper" style={{ position: 'relative' }}>
                                        <CreditCard size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', zIndex: 10 }} />
                                        <select
                                            className="filter-select"
                                            value={shipmentFilters.paymentStatus}
                                            onChange={(e) => setShipmentFilters({ ...shipmentFilters, paymentStatus: e.target.value })}
                                            style={{ paddingLeft: '2.75rem' }}
                                        >
                                            <option value="">Todos</option>
                                            <option value="COMPLETED">Completado</option>
                                            <option value="INCOMPLETE">Incompleto</option>
                                            <option value="UNPAID">No Completado</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {isShipmentsLoading ? (
                                <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando envíos...</div>
                            ) : shipments.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No se encontraron envíos con estos filtros.</div>
                            ) : (
                                <>
                                    <table className="transactions-table">
                                        <thead>
                                            <tr>
                                                <th>Fecha Delivery</th>
                                                <th>Monto (S/)</th>
                                                <th>Monto Pagado</th>
                                                <th style={{ textAlign: 'center' }}>Estado</th>
                                                <th style={{ textAlign: 'center' }}>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {shipments.map(shipment => (
                                                <tr key={shipment._id}>
                                                    <td data-label="Fecha">
                                                        <span className="date">{shipment.deliveryDate ? new Date(shipment.deliveryDate).toLocaleDateString() : '-'}</span>
                                                    </td>
                                                    <td data-label="Monto" style={{ fontWeight: 600 }}>S/ {shipment.amount?.toFixed(2)}</td>
                                                    <td data-label="Pagado">S/ {shipment.amountPaid?.toFixed(2)}</td>
                                                    <td data-label="Estado" style={{ textAlign: 'center' }}>
                                                        <span className={`status-badge ${shipment.paymentStatus?.toLowerCase()}`}>
                                                            {shipment.paymentStatus === 'COMPLETED' ? 'Completado' :
                                                                shipment.paymentStatus === 'INCOMPLETE' ? 'Incompleto' : 'No Completado'}
                                                        </span>
                                                    </td>
                                                    <td data-label="Acciones" style={{ textAlign: 'center' }}>
                                                        <button
                                                            className="action-btn view"
                                                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.25rem' }}
                                                            onClick={() => {
                                                                setSelectedShipment(shipment);
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

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        <span>Mostrando {shipments.length} de {totalShipments} envíos</span>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                disabled={shipmentsPage === 1}
                                                onClick={() => setShipmentsPage(prev => prev - 1)}
                                                className="btn-link"
                                                style={{ opacity: shipmentsPage === 1 ? 0.5 : 1 }}
                                            >
                                                Anterior
                                            </button>
                                            <button
                                                disabled={shipments.length < 10 || (shipmentsPage * 10) >= totalShipments}
                                                onClick={() => setShipmentsPage(prev => prev + 1)}
                                                className="btn-link"
                                                style={{ opacity: (shipments.length < 10 || (shipmentsPage * 10) >= totalShipments) ? 0.5 : 1 }}
                                            >
                                                Siguiente
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="section-header">
                                <h2>Pagos Registrados</h2>
                            </div>

                            {isPaymentsLoading ? (
                                <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando pagos...</div>
                            ) : payments.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No se encontraron pagos registrados.</div>
                            ) : (
                                <>
                                    <table className="transactions-table">
                                        <thead>
                                            <tr>
                                                <th>Fecha Pago</th>
                                                <th>Código</th>
                                                <th style={{ textAlign: 'right' }}>Monto (S/)</th>
                                                <th style={{ textAlign: 'center' }}>Registrado por</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {payments.map(payment => {
                                                const date = payment.paymentDate ? new Date(payment.paymentDate) : null;
                                                const formattedDate = date ? new Intl.DateTimeFormat('es-ES', {
                                                    weekday: 'long',
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                }).format(date).replace(/^\w/, (c) => c.toUpperCase()) : '-';

                                                return (
                                                    <tr key={payment._id}>
                                                        <td data-label="Fecha">
                                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                <span className="date" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{formattedDate}</span>
                                                                <span className="date" style={{ fontSize: '0.75rem' }}>{payment.paymentTime || ''}</span>
                                                            </div>
                                                        </td>
                                                        <td data-label="Código">
                                                            <span style={{ fontSize: '0.85rem', color: 'var(--accent-color)', fontWeight: 600 }}>{payment.paymentCode}</span>
                                                        </td>
                                                        <td data-label="Monto" style={{ textAlign: 'right', fontWeight: 800, color: 'var(--success-color)' }}>
                                                            S/ {payment.amountPaid?.toFixed(2)}
                                                        </td>
                                                        <td data-label="Registrado por" style={{ textAlign: 'center' }}>
                                                            <span style={{ fontSize: '0.85rem' }}>
                                                                {typeof payment.registeredBy === 'object' && payment.registeredBy ? (payment.registeredBy as any).fullName : 'Admin'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        <span>Mostrando {payments.length} de {totalPayments} pagos</span>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                disabled={paymentsPage === 1}
                                                onClick={() => setPaymentsPage(prev => prev - 1)}
                                                className="btn-link"
                                                style={{ opacity: paymentsPage === 1 ? 0.5 : 1 }}
                                            >
                                                Anterior
                                            </button>
                                            <button
                                                disabled={payments.length < 10 || (paymentsPage * 10) >= totalPayments}
                                                onClick={() => setPaymentsPage(prev => prev + 1)}
                                                className="btn-link"
                                                style={{ opacity: (payments.length < 10 || (paymentsPage * 10) >= totalPayments) ? 0.5 : 1 }}
                                            >
                                                Siguiente
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>

            <Modal
                isOpen={isOrderModalOpen}
                onClose={() => setIsOrderModalOpen(false)}
                title="Registrar Nuevo Pedido"
            >
                <form onSubmit={handleSaveOrder}>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>Items del Pedido</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {(orderData.items || []).map((item, index) => (
                                <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <input
                                            type="text"
                                            placeholder="Nombre del item (ej. Pan francés)"
                                            value={item.name}
                                            onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                            style={{ width: '100%' }}
                                            required
                                        />
                                    </div>
                                    <div style={{ width: '100px' }}>
                                        <div className="input-wrapper" style={{ position: 'relative' }}>
                                            <span style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>S/</span>
                                            <input
                                                type="number"
                                                step="0.10"
                                                placeholder="0.00"
                                                value={item.price || ''}
                                                onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value))}
                                                style={{ paddingLeft: '1.5rem', width: '100%' }}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveItem(index)}
                                        style={{ marginTop: '8px', background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', padding: '0.25rem' }}
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="btn-secondary"
                                style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                            >
                                <Plus size={16} /> Agregar Item
                            </button>
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Monto Total:</span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-color)' }}>
                            S/ {(orderData.amount || 0).toFixed(2)}
                        </span>
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
                                        <th style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Acciones</th>
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
                                            <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                                                {order.status && (
                                                    <button
                                                        title="Generar entrega de hoy para este pedido"
                                                        disabled={generatingShipmentForOrder === order._id}
                                                        onClick={() => handleGenerateShipmentForOrder(order._id!)}
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '0.35rem',
                                                            padding: '0.35rem 0.65rem',
                                                            borderRadius: '6px',
                                                            border: '1px solid var(--accent-color)',
                                                            background: 'transparent',
                                                            color: 'var(--accent-color)',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 600,
                                                            cursor: generatingShipmentForOrder === order._id ? 'not-allowed' : 'pointer',
                                                            opacity: generatingShipmentForOrder === order._id ? 0.6 : 1,
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        <Truck size={13} />
                                                        {generatingShipmentForOrder === order._id ? 'Generando...' : 'Generar hoy'}
                                                    </button>
                                                )}
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

            <Modal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                title="Registrar Pago"
            >
                <form onSubmit={handleSavePayment}>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label>Monto a Pagar (S/)</label>
                        <div className="input-wrapper" style={{ position: 'relative' }}>
                            <DollarSign size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', zIndex: 10 }} />
                            <input
                                type="number"
                                step="0.10"
                                min="0"
                                placeholder="0.00"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                style={{ paddingLeft: '2.75rem' }}
                                required
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => setIsPaymentModalOpen(false)}
                        >
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary">
                            Registrar Pago
                        </button>
                    </div>
                </form>
            </Modal>

            {/* QR Modal */}
            <Modal
                isOpen={isQrModalOpen}
                onClose={() => setIsQrModalOpen(false)}
                title="Código QR del Cliente"
            >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem' }}>
                    <div style={{ padding: '1rem', background: 'white', borderRadius: '10px' }}>
                        {qrToken && (
                            <QRCodeCanvas
                                id="qr-code-canvas"
                                value={`${window.location.origin}/client?token=${qrToken}`}
                                size={256}
                                level="H"
                            />
                        )}
                    </div>
                    <p style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        Escanea este código para acceder al portal del cliente
                    </p>
                    <button
                        className="btn-primary"
                        style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        onClick={handleDownloadQr}
                    >
                        <Download size={18} />
                        Descargar QR
                    </button>
                </div>
            </Modal>

            {/* Shipment Detail Modal */}
            <Modal
                isOpen={isPaymentDetailModalOpen}
                onClose={() => setIsPaymentDetailModalOpen(false)}
                title="Detalle del Envío"
            >
                {selectedShipment && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                            <span style={{
                                fontSize: '2.5rem',
                                fontWeight: 700,
                                color: selectedShipment.paymentStatus === 'COMPLETED' ? 'var(--success-color)' :
                                    selectedShipment.paymentStatus === 'INCOMPLETE' ? 'var(--warning-color)' :
                                        'var(--danger-color)'
                            }}>
                                S/ {selectedShipment.amount?.toFixed(2)}
                            </span>
                            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                {selectedShipment.paymentStatus === 'COMPLETED' ? 'Envío Completado' :
                                    selectedShipment.paymentStatus === 'INCOMPLETE' ? 'Pago Incompleto' :
                                        'Pago No Completado'}
                            </p>
                        </div>

                        <div className="info-card" style={{ padding: '0', border: 'none', boxShadow: 'none' }}>
                            <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Monto Total</span>
                                <span style={{ fontWeight: 600 }}>S/ {selectedShipment.amount?.toFixed(2)}</span>
                            </div>
                            <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Monto Abonado</span>
                                <span style={{ fontWeight: 600, color: 'var(--success-color)' }}>S/ {(selectedShipment.amountPaid || 0).toFixed(2)}</span>
                            </div>
                            <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Resta por Pagar</span>
                                <span style={{ fontWeight: 600, color: (selectedShipment.amount || 0) - (selectedShipment.amountPaid || 0) > 0 ? 'var(--danger-color)' : 'inherit' }}>
                                    S/ {((selectedShipment.amount || 0) - (selectedShipment.amountPaid || 0)).toFixed(2)}
                                </span>
                            </div>
                            <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Fecha de Entrega</span>
                                <span style={{ fontWeight: 500 }}>{selectedShipment.deliveryDate ? new Date(selectedShipment.deliveryDate).toLocaleDateString() : '-'}</span>
                            </div>
                            <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Código de Orden</span>
                                <span style={{ fontWeight: 500 }}>{selectedShipment.order?.orderCode || '-'}</span>
                            </div>
                            <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Notas</span>
                                <span style={{ fontWeight: 500 }}>{selectedShipment.notes || 'Sin notas'}</span>
                            </div>
                            <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>ID Interno</span>
                                <span style={{ fontWeight: 500 }}>{selectedShipment._id}</span>
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
