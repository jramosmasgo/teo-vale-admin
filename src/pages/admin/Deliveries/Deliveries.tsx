import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Pencil, XCircle, CheckCircle, Eye, Loader2, DollarSign, History as HistoryIcon, Clock, User, FileDown, MessageSquare } from 'lucide-react';
import './Deliveries.scss';
import Modal from '../../../components/ui/Modal';
import { shipmentApi } from '../../../api/shipment.api';
import type { Shipment } from '../../../types/interfaces/shipment.interface';
import { toast } from 'react-hot-toast';
import { excelApi } from '../../../api/excel.api';

const Deliveries = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit] = useState(15);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
    const [deliveryStatusFilter, setDeliveryStatusFilter] = useState('');

    const [selectedDelivery, setSelectedDelivery] = useState<Shipment | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isEditingAmount, setIsEditingAmount] = useState(false);
    const [editableAmount, setEditableAmount] = useState<number>(0);
    const [editableNotes, setEditableNotes] = useState<string>('');
    const [isAskingToEditOrder, setIsAskingToEditOrder] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const fetchDeliveries = useCallback(async () => {
        setIsLoading(true);
        try {
            const filters: any = {};
            if (searchTerm) filters.clientName = searchTerm;
            if (dateFilter) filters.deliveryDate = dateFilter;
            if (paymentStatusFilter) filters.paymentStatus = paymentStatusFilter;
            if (deliveryStatusFilter) filters.status = deliveryStatusFilter;

            const response = await shipmentApi.getAll(page, limit, filters);
            setShipments(response.shipments);
            setTotal(response.total);
        } catch (error) {
            console.error('Error fetching shipments:', error);
            toast.error('Error al cargar las entregas');
        } finally {
            setIsLoading(false);
        }
    }, [page, searchTerm, dateFilter, paymentStatusFilter, deliveryStatusFilter]);

    // Initialize filters from URL
    useEffect(() => {
        const dateParam = queryParams.get('deliveryDate');
        const pStatusParam = queryParams.get('paymentStatus');
        const statusParam = queryParams.get('status');

        if (dateParam) setDateFilter(dateParam);
        if (pStatusParam) setPaymentStatusFilter(pStatusParam);
        if (statusParam) setDeliveryStatusFilter(statusParam);
    }, [queryParams]);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchDeliveries();
        }, 300);
        return () => clearTimeout(handler);
    }, [fetchDeliveries]);

    useEffect(() => {
        setPage(1);
    }, [searchTerm, dateFilter, paymentStatusFilter, deliveryStatusFilter]);

    // Handle viewId from URL (for notifications)
    useEffect(() => {
        const viewId = queryParams.get('viewId');
        if (!viewId) return;

        const deliveryInList = shipments.find(s => s._id === viewId);
        if (deliveryInList) {
            setSelectedDelivery(deliveryInList);
            setIsDetailModalOpen(true);
        } else {
            // Fetch single shipment if not in current list
            const fetchSingleShipment = async () => {
                try {
                    const shipment = await shipmentApi.getById(viewId);
                    if (shipment) {
                        setSelectedDelivery(shipment);
                        setIsDetailModalOpen(true);
                    }
                } catch (error) {
                    console.error('Error fetching single shipment:', error);
                }
            };
            fetchSingleShipment();
        }
    }, [queryParams, shipments]);

    const handleViewDetails = (delivery: Shipment) => {
        setSelectedDelivery(delivery);
        setIsDetailModalOpen(true);
    };

    const handleEdit = (delivery: Shipment) => {
        setSelectedDelivery(delivery);
        setEditableAmount(delivery.amount || 0);
        setEditableNotes(delivery.notes || '');
        setIsEditingAmount(false);
        setIsAskingToEditOrder(false);
        setIsEditModalOpen(true);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch (e) {
            return dateString;
        }
    };

    const handleDownloadExcel = async () => {
        try {
            setIsDownloading(true);
            await excelApi.downloadDeliveries({
                deliveryDate: dateFilter || undefined,
                paymentStatus: paymentStatusFilter || undefined,
                status: deliveryStatusFilter || undefined,
            });
            toast.success('Reporte descargado correctamente');
        } catch (error) {
            console.error('Error downloading Excel:', error);
            toast.error('Error al generar el reporte Excel');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="page-content">
            <div className="header-actions">
                <div>
                    <h1 className="text-2xl font-bold text-primary mb-1">Entregas</h1>
                    <p className="subtitle">Gestiona el estado de las entregas a clientes</p>
                </div>
                <button
                    className="btn-excel"
                    onClick={handleDownloadExcel}
                    disabled={isDownloading}
                    title="Descargar reporte Excel"
                >
                    {isDownloading
                        ? <Loader2 size={18} className="spin" />
                        : <FileDown size={18} />}
                    <span>{isDownloading ? 'Generando...' : 'Exportar Excel'}</span>
                </button>
            </div>

            <div className="card">
                <div className="table-actions-bar">
                    <div className="filters-left">
                        <div className="search-box">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Buscar por cliente..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <input
                            type="date"
                            className="filter-input date-filter"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                        />
                        <select
                            className="filter-select"
                            value={paymentStatusFilter}
                            onChange={(e) => setPaymentStatusFilter(e.target.value)}
                        >
                            <option value="">Todos los Pagos</option>
                            <option value="COMPLETED">Pagado</option>
                            <option value="INCOMPLETE">Pago Parcial</option>
                            <option value="UNPAID">Sin Pagar</option>
                        </select>
                        <select
                            className="filter-select"
                            value={deliveryStatusFilter}
                            onChange={(e) => setDeliveryStatusFilter(e.target.value)}
                        >
                            <option value="">Cualquier Estado</option>
                            <option value="DELIVERED">Entregado</option>
                            <option value="CANCELLED">Cancelado</option>
                        </select>
                    </div>
                    {/* <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-bg-primary transition-colors text-text-secondary">
                        <Filter size={18} />
                        <span>Filtros</span>
                    </button> */}
                </div>

                <div className="table-container">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="animate-spin text-primary" size={40} />
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID Entrega</th>
                                    <th>Cliente</th>
                                    <th>Fecha Entrega</th>
                                    <th>Monto (S/.)</th>
                                    <th>Pago</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shipments.length > 0 ? (
                                    shipments.map((shipment) => (
                                        <tr key={shipment._id}>
                                            <td data-label="ID Entrega" className="font-medium">#{shipment._id?.substring(shipment._id.length - 6)}</td>
                                            <td data-label="Cliente">{shipment.client?.fullName || 'Cliente no encontrado'}</td>
                                            <td data-label="Fecha Entrega">{formatDate(shipment.deliveryDate)}</td>
                                            <td data-label="Monto (S/.)" className="font-semibold">S/ {(shipment.amount || 0).toFixed(2)}</td>
                                            <td data-label="Pago">
                                                <span className={`badge ${shipment.paymentStatus === 'COMPLETED' ? 'paid' :
                                                    shipment.paymentStatus === 'INCOMPLETE' ? 'partial' :
                                                        'pending'
                                                    } `}>
                                                    {shipment.paymentStatus === 'COMPLETED' ? (
                                                        <div className="flex items-center gap-1">
                                                            <CheckCircle size={12} /> Pagado
                                                        </div>
                                                    ) : shipment.paymentStatus === 'INCOMPLETE' ? (
                                                        <div className="flex items-center gap-1">
                                                            <Clock size={12} /> Parcial
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1">
                                                            <XCircle size={12} /> Sin Pagar
                                                        </div>
                                                    )}
                                                </span>
                                            </td>
                                            <td data-label="Estado">
                                                <span className={`badge ${shipment.status === 'DELIVERED' ? 'paid' : 'pending'} `}>
                                                    {shipment.status === 'DELIVERED' ? 'Entregado' : (shipment.status === 'CANCELLED' ? 'Cancelado' : shipment.status)}
                                                </span>
                                            </td>
                                            <td data-label="Acciones">
                                                <div className="flex gap-2">
                                                    <button
                                                        className="btn-action info"
                                                        onClick={() => handleViewDetails(shipment)}
                                                        title="Ver Detalles"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        className="btn-action info"
                                                        onClick={() => handleEdit(shipment)}
                                                        title="Modificar Entrega"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="text-center py-10 text-text-secondary">
                                            No se encontraron entregas
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {!isLoading && shipments.length > 0 && (
                    <div className="pagination" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
                        <span className="text-text-secondary text-sm">Mostrando {shipments.length} de {total} entregas</span>
                        <div className="flex gap-2">
                            <button
                                className="btn-secondary"
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                            >
                                Anterior
                            </button>
                            <button
                                className="btn-secondary"
                                disabled={page * limit >= total}
                                onClick={() => setPage(page + 1)}
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delivery Details Modal */}
            <Modal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                title={`Detalles de Entrega - ${selectedDelivery?._id?.substring(selectedDelivery._id.length - 6)} `}
            >
                {selectedDelivery && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="detail-item">
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Cliente</label>
                                <p style={{ margin: 0, fontWeight: 500, fontSize: '1rem' }}>{selectedDelivery.client?.fullName}</p>
                            </div>
                            <div className="detail-item">
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Estado de Entrega</label>
                                <span className={`badge ${selectedDelivery.status === 'DELIVERED' ? 'paid' : 'pending'} `} style={{ display: 'inline-block', marginTop: '0.25rem' }}>
                                    {selectedDelivery.status === 'DELIVERED' ? 'Entregado' : 'Cancelado'}
                                </span>
                            </div>
                            <div className="detail-item">
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Fecha</label>
                                <p style={{ margin: 0, fontWeight: 500 }}>{formatDate(selectedDelivery.deliveryDate)}</p>
                            </div>
                            <div className="detail-item">
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Estado de Pago</label>
                                <span className={`badge ${selectedDelivery.paymentStatus === 'COMPLETED' ? 'paid' :
                                    selectedDelivery.paymentStatus === 'INCOMPLETE' ? 'partial' :
                                        'pending'
                                    } `} style={{ display: 'inline-block', marginTop: '0.25rem' }}>
                                    {selectedDelivery.paymentStatus === 'COMPLETED' ? 'Pagado Completo' :
                                        selectedDelivery.paymentStatus === 'INCOMPLETE' ? 'Pago Parcial' :
                                            'Sin Pagar'}
                                </span>
                            </div>
                            <div className="detail-item">
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Turno</label>
                                <p style={{ margin: 0, fontWeight: 500 }}>{selectedDelivery.order?.schedule || '-'}</p>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '0.75rem' }}>Descripción de la Orden</label>
                            <p style={{ margin: 0, color: 'var(--text-primary)' }}>
                                {selectedDelivery.order?.items?.map(item => `${item.name} - S/ ${item.price?.toFixed(2)}`).join(' | ') || 'Sin descripción'}
                            </p>
                        </div>

                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '0.75rem' }}>Notas del Envío</label>
                            <p style={{ margin: 0, color: 'var(--text-primary)' }}>{selectedDelivery.notes || 'Sin observaciones'}</p>
                        </div>

                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '1rem', fontWeight: 600 }}>Monto del Pedido</span>
                            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-color)' }}>S/ {(selectedDelivery.amount || 0).toFixed(2)}</span>
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

            {/* Edit Shipment Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => !isLoading && setIsEditModalOpen(false)}
                title={isAskingToEditOrder ? "¿Desea modificar el pedido base?" : "Modificar Entrega"}
            >
                {selectedDelivery && (
                    <div className="edit-delivery-container">
                        {!isAskingToEditOrder ? (
                            <>
                                {/* Client Context Header */}
                                <div className="delivery-context-card">
                                    <div className="client-brief">
                                        <div className="avatar-mini">
                                            <User size={16} />
                                        </div>
                                        <div>
                                            <h3>{selectedDelivery.client?.fullName}</h3>
                                            <p>{formatDate(selectedDelivery.deliveryDate)} • {selectedDelivery.order?.schedule === 'morning' ? 'Turno Mañana' : 'Turno Tarde'}</p>
                                        </div>
                                    </div>
                                    <div className="current-amount-badge">
                                        <span className="label">Monto Actual</span>
                                        <span className="value">S/ {(selectedDelivery.amount || 0).toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="amount-edit-section">
                                    <label>Monto de la Entrega</label>
                                    <div className={`amount-input-wrapper ${isEditingAmount ? 'focused' : ''}`}>
                                        <DollarSign size={24} className="currency-icon" />
                                        <input
                                            type="number"
                                            value={editableAmount}
                                            onChange={(e) => setEditableAmount(Number(e.target.value))}
                                            onFocus={() => setIsEditingAmount(true)}
                                            onBlur={() => setIsEditingAmount(false)}
                                            placeholder="0.00"
                                            step="0.1"
                                        />
                                        <span className="currency-label">PEN</span>
                                    </div>
                                </div>

                                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                                        Notas del Envío
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <MessageSquare size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
                                        <textarea
                                            value={editableNotes}
                                            onChange={(e) => setEditableNotes(e.target.value)}
                                            placeholder="Ej: Dejar en portería, cliente pagará después..."
                                            style={{
                                                width: '100%',
                                                padding: '10px 10px 10px 40px',
                                                borderRadius: '12px',
                                                border: '1px solid var(--border-color)',
                                                background: 'var(--bg-primary)',
                                                color: 'var(--text-primary)',
                                                minHeight: '100px',
                                                resize: 'vertical',
                                                fontSize: '0.95rem'
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="modal-actions-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                    <button
                                        className="btn-link"
                                        onClick={() => setIsEditModalOpen(false)}
                                        disabled={isLoading}
                                        style={{ padding: '0.75rem 1.5rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-primary"
                                        disabled={isLoading}
                                        onClick={async () => {
                                            if (!selectedDelivery._id) return;
                                            try {
                                                setIsLoading(true);
                                                await shipmentApi.update(selectedDelivery._id, {
                                                    amount: editableAmount,
                                                    notes: editableNotes
                                                });
                                                toast.success('Entrega actualizada');
                                                fetchDeliveries();
                                                setIsAskingToEditOrder(true);
                                            } catch (error) {
                                                toast.error('Error al actualizar la entrega');
                                            } finally {
                                                setIsLoading(false);
                                            }
                                        }}
                                        style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: 'var(--accent-color)', color: 'white', cursor: 'pointer', fontWeight: 600 }}
                                    >
                                        {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="prompt-container">
                                <div className="icon-circle">
                                    <HistoryIcon size={32} />
                                </div>
                                <p>
                                    La entrega ha sido actualizada. <br />
                                    <strong>¿Desea modificar también el pedido original</strong> para que todas las futuras entregas usen estos nuevos datos?
                                </p>

                                <div className="prompt-actions">
                                    <button
                                        className="btn-secondary"
                                        onClick={() => setIsEditModalOpen(false)}
                                        style={{ padding: '0.75rem 2rem' }}
                                    >
                                        No, solo esta
                                    </button>
                                    <button
                                        className="btn-primary"
                                        onClick={() => {
                                            const orderId = selectedDelivery.order?._id;
                                            if (orderId) {
                                                navigate(`/admin/orders?editId=${orderId}`);
                                            } else {
                                                toast.error('No se pudo encontrar el pedido original');
                                                setIsEditModalOpen(false);
                                            }
                                        }}
                                        style={{ padding: '0.75rem 2rem' }}
                                    >
                                        Sí, modificar pedido
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )
                }
            </Modal >
        </div >
    );
};

export default Deliveries;
