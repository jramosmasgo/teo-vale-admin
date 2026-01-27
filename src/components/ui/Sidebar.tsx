import { LayoutDashboard, Users, ShoppingCart, CreditCard, LayoutList, LogOut, X, Truck } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import './Sidebar.scss';

import logoLight from '../../assets/admin/admin-logo.png';
import logoDark from '../../assets/admin/admin-logo-dark.png';
import { useTheme } from '../../context/ThemeContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { theme } = useTheme();
  const logo = theme === 'dark' ? logoDark : logoLight;

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <img src={logo} alt="Teo Vale Logo" className="sidebar-logo" />
        <button className="close-btn" onClick={onClose}>
          <X size={24} />
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink to="/admin" end className={({ isActive }) => isActive ? 'active' : ''}>
              <LayoutDashboard size={20} />
              <span>Principal</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/clients" className={({ isActive }) => isActive ? 'active' : ''}>
              <Users size={20} />
              <span>Clientes</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/deliveries" className={({ isActive }) => isActive ? 'active' : ''}>
              <Truck size={20} />
              <span>Entregas</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/orders" className={({ isActive }) => isActive ? 'active' : ''}>
              <ShoppingCart size={20} />
              <span>Pedidos</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/payments" className={({ isActive }) => isActive ? 'active' : ''}>
              <CreditCard size={20} />
              <span>Pagos</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'active' : ''}>
              <LayoutList size={20} />
              <span>Administradores</span>
            </NavLink>
          </li>
        </ul>
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
