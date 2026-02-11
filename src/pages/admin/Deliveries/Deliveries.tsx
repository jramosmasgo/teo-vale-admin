import { useState, useEffect, useCallback } from 'react';
import { Search, Pencil, XCircle, CheckCircle, Eye, Loader2, Calendar, DollarSign, History as HistoryIcon } from 'lucide-react';
import './Deliveries.scss';
import Modal from '../../../components/ui/Modal';
import { shipmentApi } from '../../../api/shipment.api';
import type { Shipment } from '../../../types/interfaces/shipment.interface';
import { toast } from 'react-hot-toast';

const Deliveries = () => {
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const limit = 15;

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [isPaidFilter, setIsPaidFilter] = useState('');

    const [selectedDelivery, setSelectedDelivery] = useState<Shipment | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isEditingAmount, setIsEditingAmount] = useState(false);
    const [editableAmount, setEditableAmount] = useState<number>(0);

    const fetchDeliveries = useCallback(async () => {
        setIsLoading(true);
        try {
            const filters: any = {};
            if (searchTerm) filters.clientName = searchTerm;
            if (dateFilter) filters.deliveryDate = dateFilter;
            if (isPaidFilter) filters.isPaid = isPaidFilter;

            const response = await shipmentApi.getAll(page, limit, filters);
            setShipments(response.shipments);
            setTotal(response.total);
        } catch (error) {
            console.error('Error fetching shipments:', error);
            toast.error('Error al cargar las entregas');
        } finally {
            setIsLoading(false);
        }
    }, [page, searchTerm, dateFilter, isPaidFilter]);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchDeliveries();
        }, 300);
        return () => clearTimeout(handler);
    }, [fetchDeliveries]);

    const handleViewDetails = (delivery: Shipment) => {
        setSelectedDelivery(delivery);
        setIsDetailModalOpen(true);
    };

    const handleEdit = (delivery: Shipment) => {
        setSelectedDelivery(delivery);
        setEditableAmount(delivery.amount || 0);
        setIsEditingAmount(false);
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
                                placeholder="Buscar por cliente..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <input
                            type="date"
                            className="date-filter"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                        />
                        <select
                            className="p-2 border border-border rounded-lg bg-bg-primary text-text-primary"
                            value={isPaidFilter}
                            onChange={(e) => setIsPaidFilter(e.target.value)}
                        >
                            <option value="">Todos los Pagos</option>
                            <option value="true">Pagado</option>
                            <option value="false">Pendiente de Pago</option>
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
                                            <td className="font-medium">#{shipment._id?.substring(shipment._id.length - 6)}</td>
                                            <td>{shipment.client?.fullName || 'Cliente no encontrado'}</td>
                                            <td>{formatDate(shipment.deliveryDate)}</td>
                                            <td className="font-semibold">S/ {(shipment.amount || 0).toFixed(2)}</td>
                                            <td>
                                                <span className={`badge ${shipment.isPaid ? 'paid' : 'pending'}`}>
                                                    {shipment.isPaid ? (
                                                        <div className="flex items-center gap-1">
                                                            <CheckCircle size={12} /> Pagado
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1">
                                                            <XCircle size={12} /> Pendiente
                                                        </div>
                                                    )}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${shipment.status === 'DELIVERED' ? 'paid' : 'pending'}`}>
                                                    {shipment.status === 'DELIVERED' ? 'Entregado' : (shipment.status === 'CANCELLED' ? 'Cancelado' : shipment.status)}
                                                </span>
                                            </td>
                                            <td>
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
                title={`Detalles de Entrega - ${selectedDelivery?._id?.substring(selectedDelivery._id.length - 6)}`}
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
                                <span className={`badge ${selectedDelivery.status === 'DELIVERED' ? 'paid' : 'pending'}`} style={{ display: 'inline-block', marginTop: '0.25rem' }}>
                                    {selectedDelivery.status === 'DELIVERED' ? 'Entregado' : 'Cancelado'}
                                </span>
                            </div>
                            <div className="detail-item">
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Fecha</label>
                                <p style={{ margin: 0, fontWeight: 500 }}>{formatDate(selectedDelivery.deliveryDate)}</p>
                            </div>
                            <div className="detail-item">
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Estado de Pago</label>
                                <span className={`badge ${selectedDelivery.isPaid ? 'paid' : 'pending'}`} style={{ display: 'inline-block', marginTop: '0.25rem' }}>
                                    {selectedDelivery.isPaid ? 'Pagado' : 'Pendiente'}
                                </span>
                            </div>
                            <div className="detail-item">
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Turno</label>
                                <p style={{ margin: 0, fontWeight: 500 }}>{selectedDelivery.order?.schedule || '-'}</p>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '0.75rem' }}>Descripción de la Orden</label>
                            <p style={{ margin: 0, color: 'var(--text-primary)' }}>{selectedDelivery.order?.description || 'Sin descripción'}</p>
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

            {/* Edit Delivery Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title={`Modificar Entrega`}
            >
                {selectedDelivery && (
                    <div className="p-4 pt-8">
                        {/* Amount Section */}
                        <div className="mb-10 text-center">
                            <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest mb-4">Monto de la Entrega</label>
                            <div className="relative inline-block w-full max-w-[280px]">
                                <DollarSign
                                    size={32}
                                    className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${isEditingAmount ? 'text-primary' : 'text-text-secondary'}`}
                                    strokeWidth={2.5}
                                />
                                <input
                                    type="number"
                                    value={editableAmount}
                                    onChange={(e) => setEditableAmount(Number(e.target.value))}
                                    disabled={!isEditingAmount}
                                    className={`w-full pl-16 pr-6 py-6 rounded-3xl border-2 transition-all duration-300 text-4xl font-black text-center outline-none
                                        ${isEditingAmount
                                            ? 'border-primary bg-bg-primary shadow-xl shadow-primary/15 text-text-primary scale-105'
                                            : 'border-border/50 bg-bg-secondary/50 text-text-secondary'}`}
                                    step="0.1"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-4 max-w-[320px] mx-auto">
                            {!isEditingAmount ? (
                                <button
                                    className="btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    onClick={() => setIsEditingAmount(true)}
                                >
                                    <Pencil size={20} strokeWidth={2.5} />
                                    Editar Monto
                                </button>
                            ) : (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-3">
                                    <p className="text-center text-xs text-text-secondary font-medium mb-4 uppercase tracking-wide">Confirmar cambio</p>

                                    <button
                                        className="btn-secondary w-full py-4 rounded-2xl flex items-center justify-between px-6 font-bold group border-2 hover:border-text-secondary/20 transition-all"
                                        onClick={() => {
                                            toast.success('Cambio aplicado solo por hoy');
                                            setIsEditModalOpen(false);
                                        }}
                                    >
                                        <span className="flex items-center gap-3">
                                            <Calendar size={20} className="text-text-secondary group-hover:text-primary transition-colors" />
                                            Solo por Hoy
                                        </span>
                                        <span className="text-xs font-normal text-text-secondary bg-text-secondary/10 px-2 py-1 rounded-md">Temporal</span>
                                    </button>

                                    <button
                                        className="btn-primary w-full py-4 rounded-2xl flex items-center justify-between px-6 font-bold shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 transition-all"
                                        onClick={() => {
                                            toast.success('Cambio aplicado permanentemente');
                                            setIsEditModalOpen(false);
                                        }}
                                    >
                                        <span className="flex items-center gap-3">
                                            <HistoryIcon size={20} />
                                            De ahora en adelante
                                        </span>
                                        <span className="text-xs font-normal bg-white/20 px-2 py-1 rounded-md text-white">Permanente</span>
                                    </button>

                                    <button
                                        className="w-full py-3 text-sm text-text-secondary font-medium hover:text-text-primary transition-colors mt-2"
                                        onClick={() => setIsEditingAmount(false)}
                                    >
                                        Cancelar edición
                                    </button>
                                </div>
                            )}

                            {!isEditingAmount && (
                                <button
                                    className="w-full py-2 text-sm text-text-secondary font-medium hover:text-red-500 transition-colors opacity-70 hover:opacity-100"
                                    onClick={() => setIsEditModalOpen(false)}
                                >
                                    Cerrar
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Deliveries;
