import { useState, useEffect, useCallback } from 'react';
import {
    Pencil, Eye, Loader2, Calendar,
    Plus, DollarSign, Tag, FileText
} from 'lucide-react';
import './Expenses.scss';
import Modal from '../../../components/ui/Modal';
import { expenseApi } from '../../../api/expense.api';
import type { Expense, ExpenseCategory } from '../../../types/interfaces/expense.interface';
import { toast } from 'react-hot-toast';

const CATEGORIES: ExpenseCategory[] = ['HARINA', 'MANTECA', 'LENA', 'SUELDO', 'AGUA', 'LUZ', 'ARRIENDO', 'OTRO'];

const Expenses = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const page = 1; // Simplified for now
    const [limit] = useState(15);

    // Filters
    const [categoryFilter, setCategoryFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Modals
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        category: 'HARINA' as ExpenseCategory,
        description: '',
        amount: '',
        expenseDate: new Date().toISOString().split('T')[0],
        notes: ''
    });

    const fetchExpenses = useCallback(async () => {
        setIsLoading(true);
        try {
            const filters: any = {};
            if (categoryFilter) filters.category = categoryFilter;
            if (startDate) filters.startDate = startDate;
            if (endDate) filters.endDate = endDate;

            const response = await expenseApi.getAll(page, limit, filters);
            setExpenses(response.expenses);
            setTotalAmount(response.totalAmount);
        } catch (error) {
            console.error('Error fetching expenses:', error);
            toast.error('Error al cargar gastos');
        } finally {
            setIsLoading(false);
        }
    }, [page, limit, categoryFilter, startDate, endDate]);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    const handleOpenCreate = () => {
        setSelectedExpense(null);
        setFormData({
            category: 'HARINA',
            description: '',
            amount: '',
            expenseDate: new Date().toISOString().split('T')[0],
            notes: ''
        });
        setIsFormModalOpen(true);
    };

    const handleOpenEdit = (expense: Expense) => {
        setSelectedExpense(expense);
        setFormData({
            category: expense.category,
            description: expense.description,
            amount: expense.amount.toString(),
            expenseDate: new Date(expense.expenseDate).toISOString().split('T')[0],
            notes: expense.notes || ''
        });
        setIsFormModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = {
                ...formData,
                amount: parseFloat(formData.amount)
            };

            if (selectedExpense) {
                await expenseApi.update(selectedExpense._id, data);
                toast.success('Gasto actualizado correctamente');
            } else {
                await expenseApi.create(data);
                toast.success('Gasto registrado correctamente');
            }
            setIsFormModalOpen(false);
            fetchExpenses();
        } catch (error) {
            console.error('Error saving expense:', error);
            toast.error('Error al guardar el gasto');
        }
    };



    return (
        <div className="expenses-page">
            <header className="page-header">
                <div className="header-content">
                    <h1>Gastos de Panadería</h1>
                    <p>Gestiona y controla los egresos operativos</p>
                </div>
                <button className="btn-primary" onClick={handleOpenCreate}>
                    <Plus size={20} />
                    Nuevo Gasto
                </button>
            </header>

            <div className="stats-summary">
                <div className="stat-card">
                    <div className="stat-icon">
                        <DollarSign size={24} />
                    </div>
                    <div className="stat-data">
                        <span className="label">Total Gasto (filtros)</span>
                        <span className="value">S/ {totalAmount.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="filters-bar">
                <div className="filter-group">
                    <label><Tag size={16} /> Categoría</label>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="">Todas</option>
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <label><Calendar size={16} /> Desde</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <label><Calendar size={16} /> Hasta</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
                {(categoryFilter || startDate || endDate) && (
                    <button className="btn-clear" onClick={() => {
                        setCategoryFilter('');
                        setStartDate('');
                        setEndDate('');
                    }}>
                        Limpiar filtros
                    </button>
                )}
            </div>

            <div className="table-container">
                {isLoading ? (
                    <div className="loading-state">
                        <Loader2 className="animate-spin" size={40} />
                        <p>Cargando gastos...</p>
                    </div>
                ) : expenses.length === 0 ? (
                    <div className="empty-state">
                        <FileText size={48} />
                        <p>No se encontraron gastos</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Categoría</th>
                                <th>Descripción</th>
                                <th>Monto</th>
                                <th>Registrado por</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.map((expense) => (
                                <tr key={expense._id}>
                                    <td data-label="Fecha">{new Date(expense.expenseDate).toLocaleDateString()}</td>
                                    <td data-label="Categoría">
                                        <span className={`category-badge ${expense.category.toLowerCase()}`}>
                                            {expense.category}
                                        </span>
                                    </td>
                                    <td data-label="Descripción">{expense.description}</td>
                                    <td data-label="Monto" className="amount">S/ {expense.amount.toFixed(2)}</td>
                                    <td data-label="Registrado por">{typeof expense.registeredBy === 'object' ? expense.registeredBy.fullName : '-'}</td>
                                    <td data-label="Acciones">
                                        <div className="actions">
                                            <button
                                                className="btn-icon"
                                                title="Ver detalle"
                                                onClick={() => {
                                                    setSelectedExpense(expense);
                                                    setIsDetailModalOpen(true);
                                                }}
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                className="btn-icon"
                                                title="Editar"
                                                onClick={() => handleOpenEdit(expense)}
                                            >
                                                <Pencil size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Form Modal */}
            <Modal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                title={selectedExpense ? 'Editar Gasto' : 'Nuevo Gasto'}
            >
                <form className="expense-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Categoría</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                            required
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Descripción</label>
                        <input
                            type="text"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Ej: 5 sacos de harina"
                            required
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Monto (S/)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Fecha</label>
                            <input
                                type="date"
                                value={formData.expenseDate}
                                onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Notas (opcional)</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                        />
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn-text" onClick={() => setIsFormModalOpen(false)}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary">
                            {selectedExpense ? 'Actualizar' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Detail Modal */}
            <Modal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                title="Detalle del Gasto"
            >
                {selectedExpense && (
                    <div className="expense-detail">
                        <div className="detail-item">
                            <span className="label">Categoría</span>
                            <span className={`category-badge ${selectedExpense.category.toLowerCase()}`}>
                                {selectedExpense.category}
                            </span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Descripción</span>
                            <p className="value">{selectedExpense.description}</p>
                        </div>
                        <div className="detail-item">
                            <span className="label">Monto</span>
                            <p className="value large">S/ {selectedExpense.amount.toFixed(2)}</p>
                        </div>
                        <div className="detail-item">
                            <span className="label">Fecha</span>
                            <p className="value">{new Date(selectedExpense.expenseDate).toLocaleDateString()}</p>
                        </div>
                        <div className="detail-item">
                            <span className="label">Registrado por</span>
                            <p className="value">{typeof selectedExpense.registeredBy === 'object' ? selectedExpense.registeredBy.fullName : '-'}</p>
                        </div>
                        {selectedExpense.notes && (
                            <div className="detail-item">
                                <span className="label">Notas</span>
                                <p className="value">{selectedExpense.notes}</p>
                            </div>
                        )}
                        <div className="modal-footer">
                            <button className="btn-primary" onClick={() => setIsDetailModalOpen(false)}>
                                Cerrar
                            </button>
                        </div>
                    </div>
                )}
            </Modal>


        </div>
    );
};

export default Expenses;
