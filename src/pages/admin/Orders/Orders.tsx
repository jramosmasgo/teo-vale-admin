import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Filter, Pencil, Plus, Eye, User, Phone, MapPin, Calendar, Clock, FileText, X } from 'lucide-react';
import toast from 'react-hot-toast';
import './Orders.scss';
import Modal from '../../../components/ui/Modal';
import { orderApi } from '../../../api/order.api';
import type { Order } from '../../../types/interfaces/order.interface';

const Orders = () => {
    const location = useLocation();
    const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [formData, setFormData] = useState<Partial<Order>>({});

    // Filter states
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [clientNameSearch, setClientNameSearch] = useState('');
    const [scheduleFilter, setScheduleFilter] = useState<string>('');
    const [daysFilter, setDaysFilter] = useState<string[]>([]);

    const fetchOrders = async (filters?: { schedule?: string; days?: string[]; clientName?: string }) => {
        try {
            setIsLoading(true);
            const response = await orderApi.getAll(filters);
            setOrders(response.orders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Error al cargar pedidos');
        } finally {
            setIsLoading(false);
        }
    };

    // Initialize filters from URL params
    useEffect(() => {
        const dayParam = queryParams.get('day');
        if (dayParam) {
            setDaysFilter([dayParam]);
        }
    }, [queryParams]);

    // Debounced search by client name
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            const filters: any = {};
            if (clientNameSearch) filters.clientName = clientNameSearch;
            if (scheduleFilter) filters.schedule = scheduleFilter;
            if (daysFilter.length > 0) filters.days = daysFilter;

            fetchOrders(Object.keys(filters).length > 0 ? filters : undefined);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [clientNameSearch, scheduleFilter, daysFilter]);

    // Handle viewId from URL (for notifications)
    useEffect(() => {
        const viewId = queryParams.get('viewId');
        if (!viewId) return;

        const orderInList = orders.find(o => o._id === viewId);
        if (orderInList) {
            setSelectedOrder(orderInList);
            setIsDetailModalOpen(true);
        } else {
            // Fetch single order if not in current list
            const fetchSingleOrder = async () => {
                try {
                    const order = await orderApi.getById(viewId);
                    if (order) {
                        setSelectedOrder(order);
                        setIsDetailModalOpen(true);
                    }
                } catch (error) {
                    console.error('Error fetching single order:', error);
                }
            };
            fetchSingleOrder();
        }
    }, [queryParams, orders]);

    const handleEdit = (orderId: string) => {
        const order = orders.find(o => o._id === orderId);
        if (order) {
            setSelectedOrder(order);
            setFormData({
                _id: order._id,
                amount: order.amount,
                schedule: order.schedule,
                orderDays: order.orderDays || [],
                items: order.items || [],
            });
            setIsEditModalOpen(true);
        }
    };

    const handleAddItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...(prev.items || []), { name: '', price: 0 }]
        }));
    };

    const handleRemoveItem = (index: number) => {
        setFormData(prev => ({
            ...prev,
            items: (prev.items || []).filter((_, i) => i !== index)
        }));
    };

    const handleItemChange = (index: number, field: 'name' | 'price', value: string | number) => {
        setFormData(prev => {
            const newItems = [...(prev.items || [])];
            newItems[index] = { ...newItems[index], [field]: value };

            // Recalculate amount
            const newAmount = newItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

            return { ...prev, items: newItems, amount: newAmount };
        });
    };

    const handleViewDetails = (orderId: string) => {
        const order = orders.find(o => o._id === orderId);
        if (order) {
            setSelectedOrder(order);
            setIsDetailModalOpen(true);
        }
    };

    const dayLabels: Record<string, string> = {
        'MONDAY': 'Lun', 'TUESDAY': 'Mar', 'WEDNESDAY': 'Mie',
        'THURSDAY': 'Jue', 'FRIDAY': 'Vie', 'SATURDAY': 'Sab', 'SUNDAY': 'Dom'
    };



    const handleScheduleChange = (schedule: string) => {
        setFormData(prev => ({ ...prev, schedule }));
    };

    const handleDayChange = (day: string) => {
        setFormData(prev => {
            const currentDays = prev.orderDays || [];
            if (currentDays.includes(day)) {
                return { ...prev, orderDays: currentDays.filter(d => d !== day) };
            } else {
                return { ...prev, orderDays: [...currentDays, day] };
            }
        });
    };

    const handleFilterDayToggle = (day: string) => {
        setDaysFilter(prev => {
            if (prev.includes(day)) {
                return prev.filter(d => d !== day);
            } else {
                return [...prev, day];
            }
        });
    };

    const handleClearFilters = () => {
        setScheduleFilter('');
        setDaysFilter([]);
        setClientNameSearch('');
        setIsFilterModalOpen(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.amount || !formData.schedule || !formData.orderDays?.length) {
            toast.error('Por favor complete todos los campos requeridos');
            return;
        }

        try {
            if (formData._id) {
                await orderApi.update(formData._id, formData);
                toast.success('Pedido actualizado correctamente');
                setIsEditModalOpen(false);
                fetchOrders();
            }
        } catch (error) {
            console.error('Error updating order:', error);
            toast.error('Error al actualizar el pedido');
        }
    };

    if (isLoading) {
        return <div className="page-content center-content">Cargando pedidos...</div>;
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
                    <div className="filters-left" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div className="search-box">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Buscar por cliente..."
                                value={clientNameSearch}
                                onChange={(e) => setClientNameSearch(e.target.value)}
                            />
                        </div>

                        <select
                            className="filter-select"
                            value={scheduleFilter}
                            onChange={(e) => setScheduleFilter(e.target.value)}
                        >
                            <option value="">Turnos (Todos)</option>
                            <option value="morning">Mañana</option>
                            <option value="afternoon">Tarde</option>
                        </select>

                        <select
                            className="filter-select"
                            value={daysFilter.length === 1 ? daysFilter[0] : ''}
                            onChange={(e) => setDaysFilter(e.target.value ? [e.target.value] : [])}
                        >
                            <option value="">Días (Todos)</option>
                            {Object.entries(dayLabels).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-bg-primary transition-colors text-text-secondary"
                        onClick={() => setIsFilterModalOpen(true)}
                    >
                        <Filter size={18} />
                        <span>Filtros</span>
                        {(scheduleFilter || daysFilter.length > 0) && (
                            <span className="badge badge-primary" style={{ marginLeft: '0.25rem' }}>
                                {(scheduleFilter ? 1 : 0) + (daysFilter.length > 1 ? 1 : daysFilter.length)}
                            </span>
                        )}
                    </button>
                </div>

                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Pedido</th>
                                <th>Cliente</th>
                                <th>Fecha Creación</th>
                                <th>Días</th>
                                <th>Turno</th>
                                <th>Monto (S/.)</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order._id}>
                                    <td className="font-medium">{order.orderCode}</td>
                                    <td>{(order.client as any)?.fullName || 'Cliente'}</td>
                                    <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}</td>
                                    <td>
                                        <div className="flex gap-1 flex-wrap">
                                            {order.orderDays?.map(day => (
                                                <span key={day} style={{ fontSize: '0.75rem', padding: '2px 6px', background: 'var(--bg-secondary)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                                                    {dayLabels[day] || day.substring(0, 3)}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ fontSize: '0.85rem', padding: '4px 8px', borderRadius: '12px', background: order.schedule === 'morning' ? '#e0f2fe' : '#fef3c7', color: order.schedule === 'morning' ? '#0369a1' : '#b45309', border: `1px solid ${order.schedule === 'morning' ? '#bae6fd' : '#fde68a'}` }}>
                                            {order.schedule === 'morning' ? 'Mañana' : 'Tarde'}
                                        </span>
                                    </td>
                                    <td className="font-semibold">S/ {order.amount?.toFixed(2)}</td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button
                                                className="btn-action info"
                                                onClick={() => handleViewDetails(order._id!)}
                                                title="Ver Detalles"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                className="btn-action info"
                                                onClick={() => handleEdit(order._id!)}
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
                title={`Editar Pedido ${selectedOrder?.orderCode || ''}`}
            >
                {selectedOrder && (
                    <form onSubmit={handleSave}>
                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-primary)', fontSize: '1.1rem' }}>Items del Pedido</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {(formData.items || []).map((item, index) => (
                                    <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                                        <div style={{ flex: 1 }}>
                                            <input
                                                type="text"
                                                placeholder="Nombre del item"
                                                value={item.name}
                                                onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                                style={{ width: '100%' }}
                                                required
                                            />
                                        </div>
                                        <div style={{ width: '120px' }}>
                                            <div className="input-wrapper" style={{ position: 'relative' }}>
                                                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>S/</span>
                                                <input
                                                    type="number"
                                                    step="0.10"
                                                    placeholder="0.00"
                                                    value={item.price || ''}
                                                    onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value))}
                                                    style={{ paddingLeft: '1.75rem', width: '100%' }}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem(index)}
                                            className="btn-action danger"
                                            style={{ marginTop: '8px' }}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={handleAddItem}
                                    className="btn-secondary"
                                    style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
                                >
                                    <Plus size={16} /> Agregar Item
                                </button>
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Monto Total:</span>
                                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-color)' }}>
                                    S/ {(formData.amount || 0).toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Turno</label>
                            <div style={{ display: 'flex', gap: '2rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="schedule"
                                        checked={formData.schedule === 'morning'}
                                        onChange={() => handleScheduleChange('morning')}
                                        style={{ accentColor: 'var(--accent-color)' }}
                                    /> Mañana
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="schedule"
                                        checked={formData.schedule === 'afternoon'}
                                        onChange={() => handleScheduleChange('afternoon')}
                                        style={{ accentColor: 'var(--accent-color)' }}
                                    /> Tarde
                                </label>
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Días</label>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {Object.entries(dayLabels).map(([value, label]) => (
                                    <label key={value} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        padding: '0.25rem 0.75rem',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '20px',
                                        cursor: 'pointer',
                                        backgroundColor: formData.orderDays?.includes(value) ? 'var(--bg-secondary)' : 'transparent'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.orderDays?.includes(value) || false}
                                            onChange={() => handleDayChange(value)}
                                            style={{ accentColor: 'var(--accent-color)' }}
                                        />
                                        <span style={{ fontSize: '0.85rem' }}>{label}</span>
                                    </label>
                                ))}
                            </div>
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
                title={`Detalles del Pedido - ${selectedOrder?.orderCode || ''}`}
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
                                    <span style={{ fontWeight: 500 }}>{(selectedOrder.client as any)?.fullName || 'Cliente'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Phone size={14} /> Teléfono:
                                    </span>
                                    <span style={{ fontWeight: 500 }}>{(selectedOrder.client as any)?.phone || 'No registrado'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <MapPin size={14} /> Dirección:
                                    </span>
                                    <span style={{ fontWeight: 500 }}>{(selectedOrder.client as any)?.address || 'No registrado'}</span>
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
                                    <p style={{ margin: 0, fontWeight: 500 }}>{selectedOrder.orderCode}</p>
                                </div>
                                <div className="detail-item">
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Fecha Creación</label>
                                    <p style={{ margin: 0, fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Calendar size={14} /> {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString() : '-'}
                                    </p>
                                </div>
                                <div className="detail-item">
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Turno</label>
                                    <p style={{ margin: 0, fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Clock size={14} /> {selectedOrder.schedule === 'morning' ? 'Mañana' : 'Tarde'}
                                    </p>
                                </div>
                                <div className="detail-item">
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Monto</label>
                                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--accent-color)', fontSize: '1.1rem' }}>S/ {selectedOrder.amount?.toFixed(2)}</p>
                                </div>
                            </div>

                            <div className="detail-item">
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Días de Entrega</label>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {selectedOrder.orderDays?.map(day => (
                                        <span key={day} style={{ fontSize: '0.75rem', padding: '2px 8px', background: 'var(--bg-secondary)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                                            {dayLabels[day] || day}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="detail-item" style={{ marginTop: '1rem' }}>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Items del Pedido</label>
                                <div style={{ background: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                            <thead>
                                                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                                                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Item</th>
                                                    <th style={{ textAlign: 'right', padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Precio</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedOrder.items.map((item, index) => (
                                                    <tr key={index} style={{ borderBottom: index === selectedOrder.items!.length - 1 ? 'none' : '1px solid var(--border-color)' }}>
                                                        <td style={{ padding: '0.75rem 1rem' }}>{item.name}</td>
                                                        <td style={{ textAlign: 'right', padding: '0.75rem 1rem', fontWeight: 500 }}>S/ {item.price.toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p style={{ margin: 0, padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                            No hay items registrados.
                                        </p>
                                    )}
                                </div>
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

            {/* Filter Modal */}
            <Modal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                title="Filtrar Pedidos"
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Schedule Filter */}
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Turno</label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="scheduleFilter"
                                    checked={scheduleFilter === ''}
                                    onChange={() => setScheduleFilter('')}
                                    style={{ accentColor: 'var(--accent-color)' }}
                                /> Todos
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="scheduleFilter"
                                    checked={scheduleFilter === 'morning'}
                                    onChange={() => setScheduleFilter('morning')}
                                    style={{ accentColor: 'var(--accent-color)' }}
                                /> Mañana
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="scheduleFilter"
                                    checked={scheduleFilter === 'afternoon'}
                                    onChange={() => setScheduleFilter('afternoon')}
                                    style={{ accentColor: 'var(--accent-color)' }}
                                /> Tarde
                            </label>
                        </div>
                    </div>

                    {/* Days Filter */}
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Días de Entrega</label>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {Object.entries(dayLabels).map(([value, label]) => (
                                <label key={value} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    padding: '0.25rem 0.75rem',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '20px',
                                    cursor: 'pointer',
                                    backgroundColor: daysFilter.includes(value) ? 'var(--bg-secondary)' : 'transparent'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={daysFilter.includes(value)}
                                        onChange={() => handleFilterDayToggle(value)}
                                        style={{ accentColor: 'var(--accent-color)' }}
                                    />
                                    <span style={{ fontSize: '0.85rem' }}>{label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                        <button
                            type="button"
                            className="btn-link"
                            onClick={handleClearFilters}
                            style={{ padding: '0.75rem 1.5rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}
                        >
                            Limpiar Filtros
                        </button>
                        <button
                            type="button"
                            className="btn-primary"
                            onClick={() => setIsFilterModalOpen(false)}
                            style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: 'var(--accent-color)', color: 'white', cursor: 'pointer', fontWeight: 600 }}
                        >
                            Aplicar
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Orders;
