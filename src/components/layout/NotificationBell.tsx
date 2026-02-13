import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/notification.service';
import type { NotificationResponse } from '../../types/notification.types';

export const NotificationBell = () => {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();
    // Opcional: Polling cada 30 segundos
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const [data, count] = await Promise.all([
        notificationService.getMyNotifications(0, 5),
        notificationService.getUnreadCount()
      ]);
      setNotifications(data.content);
      setUnreadCount(count);
    } catch (error) {
      console.error("Error cargando notificaciones");
    }
  };

  const handleNotificationClick = async (notif: NotificationResponse) => {
    if (!notif.isRead) {
      await notificationService.markAsRead(notif.idNotification);
    }
    setIsOpen(false);
    loadNotifications();
    
    // Si la notif tiene metadata (link), redirigimos
    if (notif.metadata) {
      navigate(notif.metadata);
    }
  };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-20 overflow-hidden">
            <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-white">Notificaciones</h3>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="p-4 text-center text-sm text-slate-500">No tienes notificaciones</p>
              ) : (
                notifications.map(notif => (
                  <div 
                    key={notif.idNotification}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-4 border-b dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${!notif.isRead ? 'bg-brand-50/50 dark:bg-brand-900/10' : ''}`}
                  >
                    <p className={`text-sm ${!notif.isRead ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{notif.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};