import { Bell, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Header.scss';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
    toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
    const navigate = useNavigate();

    return (
        <header className="header">
            <div className="header-left">
                <button className="menu-btn" onClick={toggleSidebar}>
                    <Menu size={24} />
                </button>
            </div>
            <div className="header-right">
                <ThemeToggle />
                <button className="icon-btn">
                    <Bell size={20} />
                    <span className="badge"></span>
                </button>
                <div
                    className="user-profile"
                    onClick={() => navigate('/admin/profile')}
                    style={{ cursor: 'pointer' }}
                >
                    <img src="https://ui-avatars.com/api/?name=Michael+Huaman&background=random" alt="User" />
                    <span>Michael Huaman</span>
                </div>
            </div>
        </header>
    );
};

export default Header;
