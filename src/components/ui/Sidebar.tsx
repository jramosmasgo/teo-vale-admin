import { LayoutDashboard, Users, ShoppingCart, CreditCard, LayoutList, LogOut, X, Truck, Wallet } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import './Sidebar.scss';

import logoLight from '../../assets/admin/admin-logo.png';
import logoDark from '../../assets/admin/admin-logo-dark.png';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const logo = theme === 'dark' ? logoDark : logoLight;
  const isAdmin = user?.role !== 'USER';

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <img src={logo} alt="Teo Vale Logo" className="sidebar-logo" />
        <button className="close-btn" onClick={onClose}>
          <X size={24} />
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-label">Menú</div>
        <ul>
          <li>
            <NavLink to="/admin" end className={({ isActive }) => isActive ? 'active' : ''} onClick={onClose}>
              <LayoutDashboard size={20} />
              <span>Principal</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/clients" className={({ isActive }) => isActive ? 'active' : ''} onClick={onClose}>
              <Users size={20} />
              <span>Clientes</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/orders" className={({ isActive }) => isActive ? 'active' : ''} onClick={onClose}>
              <ShoppingCart size={20} />
              <span>Pedidos</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/deliveries" className={({ isActive }) => isActive ? 'active' : ''} onClick={onClose}>
              <Truck size={20} />
              <span>Entregas</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/payments" className={({ isActive }) => isActive ? 'active' : ''} onClick={onClose}>
              <CreditCard size={20} />
              <span>Pagos</span>
            </NavLink>
          </li>
        </ul>

        {isAdmin && (
          <>
            <div className="nav-label">Administración</div>
            <ul>
              <li>
                <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'active' : ''} onClick={onClose}>
                  <LayoutList size={20} />
                  <span>Administradores</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/expenses" className={({ isActive }) => isActive ? 'active' : ''} onClick={onClose}>
                  <Wallet size={20} />
                  <span>Gastos</span>
                </NavLink>
              </li>
            </ul>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn">
          <LogOut size={20} />
          <span>Customer Support</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
