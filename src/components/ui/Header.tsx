import { Bell, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.scss';
import React from 'react';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
    toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

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
                    className="user-profile-container"
                    ref={menuRef}
                    style={{ position: 'relative' }}
                >
                    <div
                        className="user-profile"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <img
                            src={user?.profileImageUrl || `https://ui-avatars.com/api/?name=${user?.fullName || 'User'}&background=random`}
                            alt="User"
                        />
                        <span>{user?.fullName || 'Usuario'}</span>
                    </div>

                    {isMenuOpen && (
                        <div className="profile-dropdown">
                            <button onClick={() => {
                                navigate('/admin/profile');
                                setIsMenuOpen(false);
                            }}>
                                Ver mi perfil
                            </button>
                            <button onClick={handleLogout} className="logout-btn">
                                Cerrar sesión
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
