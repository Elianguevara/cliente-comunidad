import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/notification.service';
import type { NotificationResponse } from '../../types/notification.types';

export const NotificationBell = () => {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  async function loadNotifications() {
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
  }

  useEffect(() => {
    const initialTimeout = setTimeout(() => {
      void loadNotifications();
    }, 0);

    const interval = setInterval(() => {
      void loadNotifications();
    }, 30000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

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
      console.error('Error al abrir notificacion', error);
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
        aria-haspopup="menu"
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
            {unreadCount > 0 && <span className="text-xs font-semibold text-brand-600">{unreadCount} sin leer</span>}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-5 text-center text-sm text-slate-500 dark:text-slate-400">No tienes notificaciones nuevas.</p>
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
                  <p className={`text-sm ${notif.isRead ? 'font-medium text-slate-700 dark:text-slate-200' : 'font-bold text-slate-900 dark:text-white'}`}>
                    {notif.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{notif.message}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

