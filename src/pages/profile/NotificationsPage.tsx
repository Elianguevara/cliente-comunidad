import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/notification.service';
import type { NotificationResponse } from '../../types/notification.types';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const pageSize = 10; // Cantidad de notificaciones por página

  const fetchNotifications = async (page: number) => {
    setIsLoading(true);
    try {
      const data = await notificationService.getMyNotifications(page, pageSize);
      setNotifications(data.content);
      setTotalPages(Math.ceil(data.totalElements / pageSize));
    } catch (error) {
      console.error('Error al cargar el historial de notificaciones', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchNotifications(currentPage);
  }, [currentPage]);

  const handleNotificationClick = async (notif: NotificationResponse) => {
    try {
      if (!notif.isRead) {
        await notificationService.markAsRead(notif.idNotification);
        setNotifications((prev) =>
          prev.map((n) =>
            n.idNotification === notif.idNotification ? { ...n, isRead: true } : n
          )
        );
      }
      if (notif.metadata) {
        navigate(notif.metadata);
      }
    } catch (error) {
      console.error('Error al abrir la notificación', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      void fetchNotifications(currentPage); // Recargamos la página actual
    } catch (error) {
      console.error('Error al marcar todas como leídas', error);
    }
  };

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

  return (
    <div className="mx-auto max-w-3xl p-4 py-8">
      {/* CABECERA MODIFICADA: Agregamos el botón de volver */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        
        {/* Contenedor del Botón Back y el Título */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)} // Esto lleva a la página anterior en el historial
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            aria-label="Volver atrás"
          >
            {/* Icono de flecha izquierda (Heroicons) */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Historial de Notificaciones
          </h1>
        </div>

        <button
          onClick={handleMarkAllAsRead}
          className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-brand-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-brand-400 dark:hover:bg-slate-700"
        >
          Marcar todas como leídas
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Cargando notificaciones...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            No tienes notificaciones en tu historial.
          </div>
        ) : (
          <div className="flex flex-col">
            {notifications.map((notif) => (
              <button
                key={notif.idNotification}
                onClick={() => handleNotificationClick(notif)}
                className={`flex w-full flex-col border-b border-slate-100 p-5 text-left transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50 ${
                  notif.isRead ? 'opacity-70' : 'bg-brand-50/30 dark:bg-brand-900/10'
                }`}
              >
                <div className="flex items-start gap-4 w-full">
                  <div className="mt-1.5 flex-shrink-0">
                    <span 
                      className={`inline-block h-3 w-3 rounded-full shadow-sm ${getNotificationColor(notif.notificationType)}`} 
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex w-full justify-between items-start">
                      <span className={`text-base ${notif.isRead ? 'font-medium text-slate-700 dark:text-slate-300' : 'font-bold text-slate-900 dark:text-white'}`}>
                        {notif.title}
                      </span>
                      <span className="text-xs text-slate-400 whitespace-nowrap ml-4">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="mt-1 block text-sm text-slate-600 dark:text-slate-400">
                      {notif.message}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Controles de Paginación */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium disabled:opacity-50 dark:border-slate-700 dark:text-white transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Anterior
          </button>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Página {currentPage + 1} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
            disabled={currentPage >= totalPages - 1}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium disabled:opacity-50 dark:border-slate-700 dark:text-white transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};