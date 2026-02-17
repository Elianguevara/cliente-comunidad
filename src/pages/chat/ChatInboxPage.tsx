import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { chatService } from '../../services/chat.service';
import { getChatSocket } from '../../services/socket.service';
import type { ConversationResponse } from '../../types/chat.types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export const ChatInboxPage = () => {
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadConversations = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const data = await chatService.getMyConversations();

      // Ordenamos las conversaciones para que las más recientes (actualizadas) salgan primero
      const sortedData = data.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      setConversations(sortedData);
      setError('');
    } catch (err) {
      console.error('Error cargando bandeja de entrada', err);
      setError('No pudimos cargar tus mensajes. Intenta más tarde.');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadConversations(true);

    const interval = setInterval(() => {
      void loadConversations(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [loadConversations]);

  useEffect(() => {
    const socket = getChatSocket();
    const handleNewMessage = () => {
      void loadConversations(false);
    };

    socket.on('chat.new-message', handleNewMessage);
    return () => {
      socket.off('chat.new-message', handleNewMessage);
    };
  }, [loadConversations]);

  return (
    <div className="app-shell min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Mensajes</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Gestiona tus conversaciones con {localStorage.getItem('role') === 'CUSTOMER' ? 'los proveedores' : 'los clientes'}.
          </p>
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-900">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl dark:bg-slate-800">
                  💬
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Aún no tienes mensajes</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Las conversaciones aparecerán aquí cuando contactes o te contacten por una solicitud.
                </p>
              </div>
            ) : (
              conversations.map((conv) => {
                // Generamos un avatar por defecto basado en el nombre si no tiene imagen
                const avatarUrl = conv.otherParticipantImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.otherParticipantName)}&background=0f172a&color=fff`;

                return (
                  <Link
                    key={conv.idConversation}
                    to={`/chat/${conv.idConversation}`}
                    className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-brand-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-800/50 dark:hover:border-brand-700"
                  >
                    {/* Avatar */}
                    <div className="relative h-14 w-14 shrink-0">
                      <img
                        src={avatarUrl}
                        alt={conv.otherParticipantName}
                        className="h-full w-full rounded-full object-cover"
                      />
                      {conv.unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-brand-600 text-[10px] font-bold text-white dark:border-slate-800">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="truncate font-bold text-slate-900 dark:text-white">
                          {conv.otherParticipantName}
                        </h3>
                        <span className="shrink-0 text-[11px] font-medium text-slate-400">
                          {formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true, locale: es })}
                        </span>
                      </div>
                      
                      <p className="truncate text-xs font-semibold text-brand-600 dark:text-brand-400">
                        Ref: {conv.petitionTitle}
                      </p>
                      
                      <p className={`mt-1 truncate text-sm ${conv.unreadCount > 0 ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                        {conv.lastMessage || 'Envía el primer mensaje...'}
                      </p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        )}
      </main>
    </div>
  );
};
