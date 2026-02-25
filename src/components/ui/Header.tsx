import { Bell, Menu, Scan, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.scss';
import React from 'react';
import ThemeToggle from './ThemeToggle';
import { Scanner } from '@yudiel/react-qr-scanner';
import Modal from './Modal';
import { qrApi } from '../../api/qr.api';
import { notificationApi } from '../../api/notification.api';
import type { Notification } from '../../types/interfaces/notification.interface';
import { toast } from 'react-hot-toast';

interface HeaderProps {
    toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [isScannerOpen, setIsScannerOpen] = React.useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
    const [notifications, setNotifications] = React.useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = React.useState(0);
    const [isLoadingNotifications, setIsLoadingNotifications] = React.useState(false);

    const menuRef = React.useRef<HTMLDivElement>(null);
    const notificationsRef = React.useRef<HTMLDivElement>(null);

    const fetchNotifications = React.useCallback(async () => {
        try {
            setIsLoadingNotifications(true);
            const data = await notificationApi.getAll(1, 10);
            setNotifications(data.notifications);
            setUnreadCount(data.unread);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setIsLoadingNotifications(false);
        }
    }, []);

    React.useEffect(() => {
        if (user) {
            fetchNotifications();
            // Optional: Set up interval for refreshing notifications
            const interval = setInterval(fetchNotifications, 60000); // every minute
            return () => clearInterval(interval);
        }
    }, [user, fetchNotifications]);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
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

    const handleMarkAllAsSeen = async () => {
        try {
            await notificationApi.markAllAsSeen();
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({
                ...n,
                seenBy: [...n.seenBy, user?._id || '']
            })));
            toast.success('Todas marcadas como leídas');
        } catch (error) {
            toast.error('Error al marcar como leídas');
        }
    };

    const handleMarkAsSeen = async (id: string) => {
        try {
            await notificationApi.markAsSeen(id);
            setUnreadCount(prev => Math.max(0, prev - 1));
            setNotifications(prev => prev.map(n =>
                n._id === id ? { ...n, seenBy: [...n.seenBy, user?._id || ''] } : n
            ));
        } catch (error) {
            console.error('Error marking as seen:', error);
        }
    };

    const handleNotificationClick = async (notif: Notification) => {
        // Marcar como leída si no lo está
        if (!isSeen(notif)) {
            handleMarkAsSeen(notif._id);
        }

        // Si no hay acción, no hacemos nada más
        if (!notif.action?.entityId || !notif.action?.entityType) {
            setIsNotificationsOpen(false);
            return;
        }

        const { entityId, entityType } = notif.action;

        // Cerrar dropdown de notificaciones
        setIsNotificationsOpen(false);

        // Navegar según el tipo
        switch (entityType) {
            case 'client':
                navigate(`/admin/clients/${entityId}`);
                break;
            case 'order':
                navigate(`/admin/orders?viewId=${entityId}`);
                break;
            case 'delivery':
                navigate(`/admin/deliveries?viewId=${entityId}`);
                break;
            default:
                console.warn('Unknown entityType:', entityType);
        }
    };

    const handleScan = async (detectedCodes: any[]) => {
        if (detectedCodes && detectedCodes.length > 0) {
            const rawValue = detectedCodes[0].rawValue;
            try {
                let token = rawValue;
                if (rawValue.includes('token=')) {
                    try {
                        // Si es una URL completa o parcial con ?token=
                        const urlParams = new URLSearchParams(rawValue.split('?')[1]);
                        const extractedToken = urlParams.get('token');
                        if (extractedToken) {
                            token = extractedToken;
                        }
                    } catch (e) {
                        console.error('Error parsing token from URL:', e);
                    }
                } else if (rawValue.includes('/')) {
                    const parts = rawValue.split('/');
                    token = parts[parts.length - 1];
                }

                setIsScannerOpen(false);
                toast.loading('Buscando cliente...', { id: 'qr-scan' });

                const data = await qrApi.getByToken(token);

                if (data && data.client && data.client._id) {
                    toast.success('Cliente encontrado', { id: 'qr-scan' });
                    navigate(`/admin/clients/${data.client._id}`);
                } else {
                    toast.error('Cliente no encontrado', { id: 'qr-scan' });
                }
            } catch (error) {
                console.error(error);
                toast.error('Error al procesar el código QR', { id: 'qr-scan' });
                setIsScannerOpen(false);
            }
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isSeen = (notif: Notification) => {
        return notif.seenBy.includes(user?._id || '');
    };

    return (
        <header className="header">
            <div className="header-left">
                <button className="menu-btn" onClick={toggleSidebar}>
                    <Menu size={24} />
                </button>
            </div>
            <div className="header-right">
                <button
                    className="icon-btn scan-qr-btn"
                    onClick={() => setIsScannerOpen(true)}
                    title="Escanear QR"
                >
                    <Scan size={20} />
                </button>
                <ThemeToggle />

                <div className="notifications-container" ref={notificationsRef} style={{ position: 'relative' }}>
                    <button
                        className="icon-btn"
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && <span className="badge-count">{unreadCount}</span>}
                    </button>

                    {isNotificationsOpen && (
                        <div className="notifications-dropdown">
                            <div className="dropdown-header">
                                <h3>Notificaciones</h3>
                                {unreadCount > 0 && (
                                    <button onClick={handleMarkAllAsSeen} className="mark-all-btn">
                                        <Check size={16} /> Mark as read
                                    </button>
                                )}
                            </div>
                            <div className="notifications-list">
                                {isLoadingNotifications && notifications.length === 0 ? (
                                    <p className="empty-msg">Cargando...</p>
                                ) : notifications.length === 0 ? (
                                    <p className="empty-msg">No hay notificaciones</p>
                                ) : (
                                    notifications.map((notif) => (
                                        <div
                                            key={notif._id}
                                            className={`notification-item ${!isSeen(notif) ? 'unread' : ''}`}
                                            onClick={() => handleNotificationClick(notif)}
                                        >
                                            <div className="notif-dot"></div>
                                            <div className="notif-content">
                                                <p className="notif-title">{notif.title}</p>
                                                <p className="notif-text">{notif.content}</p>
                                                <span className="notif-date">{formatDate(notif.createdAt)}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

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
            {isScannerOpen && (
                <Modal
                    isOpen={isScannerOpen}
                    onClose={() => setIsScannerOpen(false)}
                    title="Escanear Código QR"
                >
                    <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
                        <Scanner
                            onScan={handleScan}
                            onError={(err: any) => {
                                console.error(err);
                                if (err?.name === 'NotAllowedError' || err?.message?.includes('permission')) {
                                    toast.error('Permiso de cámara denegado');
                                } else if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
                                    toast.error('La cámara requiere una conexión segura (HTTPS)');
                                } else {
                                    toast.error('Error al acceder a la cámara');
                                }
                            }}
                            styles={{ container: { borderRadius: '10px', overflow: 'hidden' } }}
                        />
                        <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-secondary)' }}>
                            Apunta la cámara al código QR del cliente
                        </p>
                    </div>
                </Modal>
            )}
        </header>
    );
};

export default Header;
