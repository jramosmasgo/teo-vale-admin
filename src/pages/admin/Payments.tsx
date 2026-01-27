import { useState } from 'react';
import { Search, Filter, Plus, Eye, User, Calendar, CreditCard, Hash, FileText } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import './Payments.scss';

interface Payment {
  id: string;
  clientName: string;
  clientId: string;
  amount: number;
  date: string;
  time: string;
  method: string;
  registeredBy: string;
}

const MOCK_PAYMENTS: Payment[] = [
  {
    id: 'PAY-1001',
    clientName: 'Juan Perez',
    clientId: 'CLI-001',
    amount: 150.00,
    date: '2024-03-15',
    time: '10:30 AM',
    method: 'Efectivo',
    registeredBy: 'Admin Sistema'
  },
  {
    id: 'PAY-1002',
    clientName: 'Maria Campos',
    clientId: 'CLI-045',
    amount: 300.00,
    date: '2024-03-14',
    time: '14:15 PM',
    method: 'Yape',
    registeredBy: 'Cajero 1'
  },
  {
    id: 'PAY-1003',
    clientName: 'Jose Luis',
    clientId: 'CLI-012',
    amount: 450.00,
    date: '2024-03-16',
    time: '09:45 AM',
    method: 'Transferencia',
    registeredBy: 'Admin Sistema'
  },
  {
    id: 'PAY-1004',
    clientName: 'Ana Torres',
    clientId: 'CLI-089',
    amount: 120.00,
    date: '2024-03-13',
    time: '16:20 PM',
    method: 'Efectivo',
    registeredBy: 'Cajero 2'
  },
  {
    id: 'PAY-1005',
    clientName: 'Pedro Sola',
    clientId: 'CLI-034',
    amount: 200.00,
    date: '2024-03-17',
    time: '11:10 AM',
    method: 'Plin',
    registeredBy: 'Admin Sistema'
  },
];

const Payments = () => {
  const [payments] = useState<Payment[]>(MOCK_PAYMENTS);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  return (
    <div className="page-content">
      <div className="header-actions">
        <div>
          <h1 className="text-2xl font-bold text-primary mb-1">Gestión de Pagos</h1>
          <p className="subtitle">Control y seguimiento de pagos de clientes</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Registrar Nuevo
        </button>
      </div>

      <div className="card">
        <div className="table-actions-bar">
          <div className="filters-left">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Buscar por cliente o ID..."
              />
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-bg-primary transition-colors text-text-secondary">
            <Filter size={18} />
            <span>Filtros</span>
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Monto</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="font-medium">{payment.id}</td>
                  <td>{payment.clientName}</td>
                  <td className="font-semibold">S/ {payment.amount.toFixed(2)}</td>
                  <td>{payment.date}</td>
                  <td>{payment.time}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        className="btn-icon-action info"
                        onClick={() => handleViewDetails(payment)}
                        title="Ver Detalles"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Detalle del Pago"
      >
        {selectedPayment && (
          <div className="payment-details-modal">
            <div className="amount-header">
              <span className="label">Monto Pagado</span>
              <span className="amount">S/ {selectedPayment.amount.toFixed(2)}</span>
              <div className="method-badge">
                <CreditCard size={14} /> {selectedPayment.method}
              </div>
            </div>

            <div className="details-grid">
              <div className="info-group">
                <h3>
                  <User size={16} /> Información del Cliente
                </h3>
                <div className="info-card grid-2">
                  <div className="info-item">
                    <label>Nombre</label>
                    <p>{selectedPayment.clientName}</p>
                  </div>
                  <div className="info-item">
                    <label>ID Cliente</label>
                    <p>{selectedPayment.clientId}</p>
                  </div>
                </div>
              </div>

              <div className="info-group">
                <h3>
                  <FileText size={16} /> Detalles de la Transacción
                </h3>
                <div className="info-card grid-2">
                  <div className="info-item">
                    <label>ID Pago</label>
                    <p>
                      <Hash size={14} /> {selectedPayment.id}
                    </p>
                  </div>
                  <div className="info-item">
                    <label>Registrado por</label>
                    <p>
                      <User size={14} /> {selectedPayment.registeredBy}
                    </p>
                  </div>
                  <div className="info-item">
                    <label>Fecha</label>
                    <p>
                      <Calendar size={14} /> {selectedPayment.date}
                    </p>
                  </div>
                  <div className="info-item">
                    <label>Hora</label>
                    <p>{selectedPayment.time}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-primary"
                onClick={() => setIsModalOpen(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Payments;
