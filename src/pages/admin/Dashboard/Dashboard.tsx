import { useState, useEffect } from 'react';
import { TrendingUp, CheckCircle, XCircle, FileText, Wallet } from 'lucide-react';
import { analyticsApi } from '../../../api/analytics.api';
import { expenseApi } from '../../../api/expense.api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './Dashboard.scss';

const StatCard = ({ title, value, subtext, icon: Icon, variant = 'default', isLoading = false, onClick }: any) => (
    <div className={`stat-card ${variant}`} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
        <div className="stat-content">
            <h2 className="stat-value">{isLoading ? '...' : value}</h2>
            <span className="stat-title">{title}</span>
            <p className="stat-subtext">{subtext}</p>
        </div>
        <div className="stat-icon-wrapper">
            <Icon size={24} strokeWidth={2.5} />
        </div>
    </div>
);

const Dashboard = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        todayOrders: 0,
        todayPaymentsTotal: 0,
        clientsWithDebt: 0,
        ordersUpdatedThisWeek: 0,
        shipmentsCancelledThisWeek: 0,
        totalUnpaidAmount: 0,
        todayExpenses: 0,
    });

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setIsLoading(true);
                const now = new Date();
                const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
                const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

                const [
                    todayOrders,
                    todayPaymentsTotal,
                    clientsWithDebt,
                    ordersUpdatedThisWeek,
                    shipmentsCancelledThisWeek,
                    totalUnpaidAmount,
                    expenseData,
                ] = await Promise.all([
                    analyticsApi.getTodayOrders(),
                    analyticsApi.getTodayPaymentsTotal(),
                    analyticsApi.getClientsWithDebtCount(),
                    analyticsApi.getOrdersUpdatedThisWeek(),
                    analyticsApi.getShipmentsCancelledThisWeek(),
                    analyticsApi.getTotalUnpaidAmount(),
                    expenseApi.getAll(1, 1, { startDate: firstDayOfMonth, endDate: lastDayOfMonth }),
                ]);

                setStats({
                    todayOrders: todayOrders.length,
                    todayPaymentsTotal: todayPaymentsTotal.total,
                    clientsWithDebt: clientsWithDebt.count,
                    ordersUpdatedThisWeek: ordersUpdatedThisWeek.length,
                    shipmentsCancelledThisWeek: shipmentsCancelledThisWeek.length,
                    totalUnpaidAmount: totalUnpaidAmount.total,
                    todayExpenses: expenseData.totalAmount || 0,
                });
            } catch (error) {
                console.error('Error fetching analytics:', error);
                toast.error('Error al cargar las estadísticas');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    const todayDate = new Date().toISOString().split('T')[0];
    const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const today = new Date();
    const todayDayName = dayNames[today.getDay()];
    const currentMonthName = monthNames[today.getMonth()];

    return (
        <div className="dashboard">
            <div className="page-header">
                <h1 className="page-title">
                    <span className="brand-circle">IPSUM</span>
                    Resumen de hoy
                </h1>
            </div>

            <div className="stats-grid">
                <StatCard
                    value={stats.todayOrders}
                    title="Pedidos de Hoy"
                    subtext="Pedidos programados para hoy"
                    icon={TrendingUp}
                    variant="blue"
                    isLoading={isLoading}
                    onClick={() => navigate(`/admin/orders?day=${todayDayName}`)}
                />
                <StatCard
                    value={`S/ ${stats.todayPaymentsTotal.toFixed(2)}`}
                    title="Pagos recibidos hoy"
                    subtext="Total recibido en el día"
                    icon={CheckCircle}
                    variant="green"
                    isLoading={isLoading}
                    onClick={() => navigate(`/admin/payments?paymentDate=${todayDate}`)}
                />
                <StatCard
                    value={stats.clientsWithDebt}
                    title="Clientes con deuda"
                    subtext={`S/ ${stats.totalUnpaidAmount.toFixed(2)} por cobrar`}
                    icon={XCircle}
                    variant="red"
                    isLoading={isLoading}
                    onClick={() => navigate(`/admin/deliveries?paymentStatus=UNPAID`)}
                />
                <StatCard
                    value={stats.ordersUpdatedThisWeek}
                    title="Pedidos Modificados"
                    subtext="Actualizados esta semana"
                    icon={FileText}
                    variant="yellow"
                    isLoading={isLoading}
                    onClick={() => navigate('/admin/orders')}
                />
                <StatCard
                    value={stats.shipmentsCancelledThisWeek}
                    title="Pedidos Cancelados"
                    subtext="Cancelados esta semana"
                    icon={TrendingUp}
                    variant="gray"
                    isLoading={isLoading}
                    onClick={() => navigate(`/admin/deliveries?status=CANCELLED&deliveryDate=${todayDate}`)}
                />
                <StatCard
                    value={`S/ ${stats.todayExpenses.toFixed(2)}`}
                    title={`Gastos de ${currentMonthName}`}
                    subtext="Egresos este mes"
                    icon={Wallet}
                    variant="purple"
                    isLoading={isLoading}
                    onClick={() => {
                        const now = new Date();
                        const firstDayString = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
                        const lastDayString = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
                        navigate(`/admin/expenses?startDate=${firstDayString}&endDate=${lastDayString}`);
                    }}
                />
            </div>
        </div>
    );
};

export default Dashboard;
