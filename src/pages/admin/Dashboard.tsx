import { TrendingUp, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import './Dashboard.scss';

const StatCard = ({ title, value, subtext, icon: Icon, variant = 'default' }: any) => (
    <div className={`stat-card ${variant}`}>
        <div className="stat-content">
            <h2 className="stat-value">{value}</h2>
            <span className="stat-title">{title}</span>
            <p className="stat-subtext">{subtext}</p>
        </div>
        <div className="stat-icon-wrapper">
            <Icon size={24} strokeWidth={2.5} />
        </div>
    </div>
);

const Dashboard = () => {
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
                    value="111"
                    title="Pedidos"
                    subtext="10% más que ayer"
                    icon={TrendingUp}
                    variant="blue"
                />
                <StatCard
                    value="S/ 320.00"
                    title="Pagos recibidos"
                    subtext="60 transacciones"
                    icon={CheckCircle}
                    variant="green"
                />
                <StatCard
                    value="15"
                    title="Clientes con deuda"
                    subtext="S/ 1,200.50 por cobrar"
                    icon={XCircle}
                    variant="red"
                />
                <StatCard
                    value="2"
                    title="Pedidos Modificados"
                    subtext=""
                    icon={FileText}
                    variant="yellow"
                />
                <StatCard
                    value="1"
                    title="Pedido Cancelado"
                    subtext="10% decrease from last week"
                    icon={TrendingUp}
                    variant="gray"
                />
                <StatCard
                    value="S/ 3,450.00"
                    title="Total de deudas pendientes"
                    subtext="Deuda acumulada global"
                    icon={Clock}
                    variant="orange"
                />
            </div>
        </div>
    );
};

export default Dashboard;
