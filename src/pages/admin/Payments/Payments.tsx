import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Eye, User, Calendar, CreditCard, Hash, FileText, ChevronLeft, ChevronRight, X, FileDown, Loader2 } from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import { paymentApi } from '../../../api/payment.api';
import type { Payment } from '../../../types/interfaces/payment.interface';
import type { Client } from '../../../types/interfaces/client.interface';
import type { User as UserInterface } from '../../../types/interfaces/user.interface';
import toast from 'react-hot-toast';
import { excelApi } from '../../../api/excel.api';
import './Payments.scss';

const Payments = () => {
    const location = useLocation();
    const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

    const [payments, setPayments] = useState<Payment[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [totalPayments, setTotalPayments] = useState(0);
    const [page, setPage] = useState(1);
    const [limit] = useState(15);

    const [filters, setFilters] = useState({
        clientName: '',
        paymentDate: ''
    });

    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const fetchPayments = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await paymentApi.getAll(page, limit, {
                clientName: filters.clientName || undefined,
                paymentDate: filters.paymentDate || undefined
            });
            setPayments(data.payments);
            setTotalPayments(data.total);
        } catch (error) {
            console.error('Error fetching payments:', error);
            toast.error('Error al cargar los pagos');
        } finally {
            setIsLoading(false);
        }
    }, [page, limit, filters]);

    // Initialize filters from URL
    useEffect(() => {
        const dateParam = queryParams.get('paymentDate');
        if (dateParam) {
            setFilters(prev => ({ ...prev, paymentDate: dateParam }));
        }
    }, [queryParams]);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    const handleViewDetails = (payment: Payment) => {
        setSelectedPayment(payment);
        setIsModalOpen(true);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters(prev => ({ ...prev, clientName: e.target.value }));
        setPage(1);
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters(prev => ({ ...prev, paymentDate: e.target.value }));
        setPage(1);
    };

    const resetFilters = () => {
        setFilters({
            clientName: '',
            paymentDate: ''
        });
        setPage(1);
    };

    const totalPages = Math.ceil(totalPayments / limit);

    const handleDownloadExcel = async () => {
        try {
            setIsDownloading(true);
            await excelApi.downloadPayments({
                paymentDate: filters.paymentDate || undefined,
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
                    <h1 className="text-2xl font-bold text-primary mb-1">Gestión de Pagos</h1>
                    <p className="subtitle">Control y seguimiento de pagos de clientes</p>
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
                                placeholder="Buscar por cliente o código..."
                                value={filters.clientName}
                                onChange={handleSearchChange}
                            />
                        </div>
                        <div className="date-filter-box">
                            <Calendar size={16} />
                            <input
                                type="date"
                                className="filter-input"
                                value={filters.paymentDate}
                                onChange={handleDateChange}
                            />
                        </div>
                    </div>
                    {(filters.clientName || filters.paymentDate) && (
                        <button className="btn-link flex items-center gap-2 text-danger" onClick={resetFilters}>
                            <X size={16} />
                            <span>Limpiar</span>
                        </button>
                    )}
                </div>

                <div className="table-container">
                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>Cargando pagos...</div>
                    ) : payments.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                            No se encontraron pagos registrados.
                        </div>
                    ) : (
                        <>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Código</th>
                                        <th>Cliente</th>
                                        <th style={{ textAlign: 'right' }}>Monto</th>
                                        <th style={{ textAlign: 'center' }}>Fecha</th>
                                        <th style={{ textAlign: 'center' }}>Hora</th>
                                        <th style={{ textAlign: 'center' }}>Registrado Por</th>
                                        <th style={{ textAlign: 'center' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((payment) => (
                                        <tr key={payment._id}>
                                            <td className="font-medium">{payment.paymentCode}</td>
                                            <td>{typeof payment.client === 'object' ? (payment.client as Client).fullName : 'N/A'}</td>
                                            <td className="font-semibold" style={{ textAlign: 'right' }}>
                                                S/ {(payment.amountPaid || 0).toFixed(2)}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : '-'}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>{payment.paymentTime || '-'}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                {typeof payment.registeredBy === 'object' ? (payment.registeredBy as UserInterface).fullName : 'N/A'}
                                            </td>
                                            <td>
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        className="btn-icon-action info"
                                                        onClick={() => handleViewDetails(payment)}
                                                        title="Ver Detalles"
                                                        style={{ background: 'transparent', border: 'none', color: 'var(--accent-color)', cursor: 'pointer' }}
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="pagination" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        Mostrando {payments.length} de {totalPayments} pagos
                                    </span>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            className="btn-icon"
                                            disabled={page === 1}
                                            onClick={() => setPage(page - 1)}
                                            style={{ opacity: page === 1 ? 0.5 : 1 }}
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 0.5rem' }}>
                                            <span style={{ fontWeight: 600 }}>{page}</span>
                                            <span style={{ color: 'var(--text-secondary)' }}>de</span>
                                            <span>{totalPages}</span>
                                        </div>
                                        <button
                                            className="btn-icon"
                                            disabled={page === totalPages}
                                            onClick={() => setPage(page + 1)}
                                            style={{ opacity: page === totalPages ? 0.5 : 1 }}
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Detalle del Pago"
            >
                {selectedPayment && (
                    <div className="payment-details-modal" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="amount-header" style={{ textAlign: 'center', padding: '2rem', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
                            <span className="label" style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Monto Pagado</span>
                            <span className="amount" style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--success-color)' }}>
                                S/ {(selectedPayment.amountPaid || 0).toFixed(2)}
                            </span>
                            <div className="status-badge" style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success-color)', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
                                <CreditCard size={14} /> Pago Procesado
                            </div>
                        </div>

                        <div className="details-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                            <div className="info-group">
                                <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                                    <User size={16} /> Información del Cliente
                                </h3>
                                <div className="info-card" style={{ padding: '1rem', background: 'var(--bg-primary)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                                    <div className="info-item" style={{ marginBottom: '0.75rem' }}>
                                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Nombre Completo</label>
                                        <p style={{ fontWeight: 500 }}>{typeof selectedPayment.client === 'object' ? (selectedPayment.client as Client).fullName : 'N/A'}</p>
                                    </div>
                                    <div className="info-item">
                                        <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Alias</label>
                                        <p style={{ fontWeight: 500 }}>{typeof selectedPayment.client === 'object' ? (selectedPayment.client as Client).alias || '-' : '-'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="info-group">
                                <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                                    <FileText size={16} /> Detalles de la Transacción
                                </h3>
                                <div className="info-card" style={{ padding: '1rem', background: 'var(--bg-primary)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div className="info-item">
                                            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Código de Pago</label>
                                            <p style={{ fontWeight: 500 }}><Hash size={14} style={{ display: 'inline', marginRight: '4px' }} /> {selectedPayment.paymentCode}</p>
                                        </div>
                                        <div className="info-item">
                                            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Registrado por</label>
                                            <p style={{ fontWeight: 500 }}>{typeof selectedPayment.registeredBy === 'object' ? (selectedPayment.registeredBy as UserInterface).fullName : 'Sistema'}</p>
                                        </div>
                                        <div className="info-item">
                                            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Fecha</label>
                                            <p style={{ fontWeight: 500 }}><Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} /> {selectedPayment.paymentDate ? new Date(selectedPayment.paymentDate).toLocaleDateString() : '-'}</p>
                                        </div>
                                        <div className="info-item">
                                            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Hora</label>
                                            <p style={{ fontWeight: 500 }}>{selectedPayment.paymentTime || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                className="btn-primary"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Cerrar Detalle
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Payments;
