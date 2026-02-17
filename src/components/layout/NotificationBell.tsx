import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/notification.service';
import { getNotificationsSocket } from '../../services/socket.service';
import type { NotificationResponse } from '../../types/notification.types';
import type { NotificationsUnreadCountEvent } from '../../types/socket.types';

export const NotificationBell = () => {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  // Función para cargar notificaciones y el contador de no leídas
  const loadNotifications = useCallback(async () => {
    try {
      const [data, count] = await Promise.all([
        notificationService.getMyNotifications(0, 5),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(data.content);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error cargando notificaciones', error);
    }
  }, []);

  // Polling: Carga inicial y actualización cada 30 segundos
  useEffect(() => {
    const timeout = setTimeout(() => {
      void loadNotifications();
    }, 0);

    const interval = setInterval(() => {
      void loadNotifications();
    }, 30000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [loadNotifications]);

  useEffect(() => {
    const socket = getNotificationsSocket();

    const handleNewNotification = (notification: NotificationResponse) => {
      setNotifications((prev) => {
        if (prev.some((item) => item.idNotification === notification.idNotification)) {
          return prev;
        }
        return [notification, ...prev].slice(0, 5);
      });

      if (!notification.isRead) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    const handleUnreadCount = (payload: NotificationsUnreadCountEvent) => {
      setUnreadCount(payload.unreadCount);
    };

    socket.on('notifications.new', handleNewNotification);
    socket.on('notifications.unread-count', handleUnreadCount);

    return () => {
      socket.off('notifications.new', handleNewNotification);
      socket.off('notifications.unread-count', handleUnreadCount);
    };
  }, []);

  // Manejo de clics fuera y tecla Escape para cerrar el menú
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  // Manejo del clic en una notificación individual
  const handleNotificationClick = async (notif: NotificationResponse) => {
    try {
      if (!notif.isRead) {
        await notificationService.markAsRead(notif.idNotification);
      }
      
      setIsOpen(false);
      await loadNotifications();

      if (notif.metadata) {
        navigate(notif.metadata);
      }
    } catch (error) {
      console.error('Error al procesar la notificación', error);
    }
  };

  // Manejo para marcar todas como leídas
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      await loadNotifications(); 
    } catch (error) {
      console.error('Error al marcar todas como leídas', error);
    }
  };

  // NUEVO: Función para determinar el color del círculo según el tipo
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return 'bg-emerald-500 shadow-emerald-500/40';
      case 'WARNING':
        return 'bg-amber-500 shadow-amber-500/40';
      case 'ERROR':
        return 'bg-red-500 shadow-red-500/40';
      case 'INFO':
      default:
        return 'bg-blue-500 shadow-blue-500/40';
    }
  };

  const unreadLabel = unreadCount > 99 ? '99+' : unreadCount.toString();

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        aria-label="Ver notificaciones"
        aria-expanded={isOpen}
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute right-0.5 top-0.5 rounded-full border-2 border-white bg-red-500 px-1.5 text-[10px] font-bold text-white dark:border-slate-900">
            {unreadLabel}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-30 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
          
          <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-white">Notificaciones</h3>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllAsRead}
                  className="text-xs font-medium text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                >
                  Marcar todas leídas
                </button>
              )}
              {unreadCount > 0 && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-5 text-center text-sm text-slate-500 dark:text-slate-400">
                No tienes notificaciones nuevas.
              </p>
            ) : (
              notifications.map((notif) => (
                <button
                  key={notif.idNotification}
                  type="button"
                  onClick={() => handleNotificationClick(notif)}
                  className={`w-full border-b border-slate-100 p-4 text-left transition-colors dark:border-slate-700 ${
                    notif.isRead
                      ? 'hover:bg-slate-50 dark:hover:bg-slate-700/60'
                      : 'bg-brand-50/60 hover:bg-brand-50 dark:bg-brand-900/10 dark:hover:bg-brand-900/20'
                  }`}
                >
                  {/* NUEVO: Contenedor flex para alinear el círculo de color con el texto */}
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0">
                      <span 
                        className={`inline-block h-2.5 w-2.5 rounded-full shadow-sm ${getNotificationColor(notif.notificationType)}`} 
                      />
                    </div>
                    
                    <div className="flex-1">
                      <p className={`text-sm ${
                        notif.isRead 
                          ? 'font-medium text-slate-700 dark:text-slate-200' 
                          : 'font-bold text-slate-900 dark:text-white'
                      }`}>
                        {notif.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {notif.message}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="border-t border-slate-100 p-2 dark:border-slate-700">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/notifications');
              }}
              className="w-full rounded-lg py-2 text-center text-sm font-medium text-brand-600 transition-colors hover:bg-slate-50 dark:text-brand-400 dark:hover:bg-slate-700"
            >
              Ver todas las notificaciones
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
