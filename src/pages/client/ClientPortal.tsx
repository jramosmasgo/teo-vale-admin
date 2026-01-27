

const ClientPortal = () => {
  return (
    <div className="client-portal">
      <div className="welcome-banner">
        <h1>Bienvenido, Juan Perez</h1>
        <p>Aquí puedes ver el estado de tus pedidos y pagos.</p>
      </div>

      <div className="portal-grid">
        <div className="card profile-card">
          <h2>Mis Datos</h2>
          <div className="info-row">
            <span className="label">Email:</span>
            <span className="value">juan.perez@example.com</span>
          </div>
          <div className="info-row">
            <span className="label">Teléfono:</span>
            <span className="value">+51 987 654 321</span>
          </div>
          <div className="info-row">
            <span className="label">Dirección:</span>
            <span className="value">Av. Siempre Viva 123</span>
          </div>
          <button className="btn-outline">Editar Datos</button>
        </div>

        <div className="card history-card">
          <h2>Historial de Pagos</h2>
          <div className="payment-list">
            {[1, 2, 3].map(i => (
              <div key={i} className="payment-item">
                <div className="payment-icon">S/</div>
                <div className="payment-details">
                  <span className="amount">S/ 45.00</span>
                  <span className="date">15 Ene 2024</span>
                </div>
                <span className="status-paid">Pagado</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
          .welcome-banner {
            background: linear-gradient(135deg, var(--accent-color), var(--accent-hover));
            color: white;
            padding: 3rem;
            border-radius: 16px;
            margin-bottom: 2rem;
            transition: padding 0.3s ease;
          }
          .welcome-banner h1 { font-size: 2rem; margin-bottom: 0.5rem; }
          
          .portal-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 2rem;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 1rem 0;
            border-bottom: 1px solid var(--border-color);
          }
          .label { color: var(--text-secondary); }
          .value { font-weight: 600; text-align: right; }
          
          .payment-item {
            display: flex;
            align-items: center;
            padding: 1rem;
            gap: 1rem;
            border-bottom: 1px solid var(--border-color);
          }
          .payment-icon {
            width: 40px;
            height: 40px;
            background-color: var(--bg-primary);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: var(--accent-color);
            flex-shrink: 0;
          }
          .payment-details {
            flex: 1;
            display: flex;
            flex-direction: column;
          }
          .amount { font-weight: bold; }
          .date { font-size: 0.8rem; color: var(--text-secondary); }
          .status-paid {
            color: var(--success-color);
            font-weight: 600;
            font-size: 0.9rem;
          }
          .btn-outline {
            width: 100%;
            padding: 0.75rem;
            margin-top: 1rem;
            border: 1px solid var(--border-color);
            background: transparent;
            color: var(--text-primary);
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }
          .btn-outline:hover {
            background-color: var(--bg-primary);
            border-color: var(--text-secondary);
          }

          @media (max-width: 640px) {
            .welcome-banner {
                padding: 1.5rem;
            }
            .welcome-banner h1 {
                font-size: 1.5rem;
            }
            .portal-grid {
                gap: 1rem;
            }
            .info-row {
                flex-direction: column;
                gap: 0.25rem;
            }
            .value {
                text-align: left;
            }
            .payment-item {
                padding: 0.75rem;
            }
          }
        `}</style>
    </div>
  );
};

export default ClientPortal;
