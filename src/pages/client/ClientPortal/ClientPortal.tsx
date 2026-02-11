import './ClientPortal.scss';

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
        </div>
    );
};

export default ClientPortal;
