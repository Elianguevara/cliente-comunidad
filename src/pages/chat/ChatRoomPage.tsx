import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { chatService } from '../../services/chat.service';
import { getChatSocket } from '../../services/socket.service';
import type { MessageResponse, ConversationResponse } from '../../types/chat.types';
import type { ChatNewMessageEvent } from '../../types/socket.types';
import { format } from 'date-fns';

export const ChatRoomPage = () => {
  const { id } = useParams(); // ID de la conversación (si ya existe)
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [conversation, setConversation] = useState<ConversationResponse | null>(null);
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final cuando hay mensajes nuevos
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Lógica de inicialización
  useEffect(() => {
    const initChat = async () => {
      try {
        setLoading(true);
        let currentConvId = Number(id);

        // Si no hay ID en la URL, pero venimos del botón "Contactar" (con query params)
        if (!currentConvId) {
          const petitionId = Number(searchParams.get('petitionId'));
          const providerId = Number(searchParams.get('providerId'));
          
          if (petitionId && providerId) {
            const conv = await chatService.getOrCreateConversation(petitionId, providerId);
            currentConvId = conv.idConversation;
            setConversation(conv);
            // Actualizamos la URL silenciosamente para mantener el estado
            window.history.replaceState(null, '', `/chat/${currentConvId}`);
          } else {
            navigate('/chat/inbox'); // Parámetros inválidos
            return;
          }
        } else {
          // Buscamos la conversación entre los chats del usuario
          const userConversations = await chatService.getMyConversations();
          const currentConversation = userConversations.find(c => c.idConversation === currentConvId);
          
          if (currentConversation) {
            setConversation(currentConversation);
          } else {
            // Si el ID no existe o no pertenece al usuario, lo devolvemos al inbox
            navigate('/chat/inbox');
            return;
          }
        }

        // Cargar mensajes
        const msgs = await chatService.getMessages(currentConvId);
        setMessages(msgs);

        // Le avisamos al backend que ya leímos los mensajes al entrar a la sala
        try {
          await chatService.markAsRead(currentConvId);
        } catch (error) {
          console.error('Error al marcar los mensajes como leídos:', error);
        }

      } catch (error) {
        console.error('Error inicializando el chat:', error);
      } finally {
        setLoading(false);
      }
    };

    void initChat();

    // Polling temporal
    const interval = setInterval(async () => {
      if (id || conversation?.idConversation) {
        const convId = Number(id) || conversation?.idConversation;
        if (convId) {
          try {
            const msgs = await chatService.getMessages(convId);
            setMessages(prev => {
              if (msgs.length > prev.length) {
                chatService.markAsRead(convId).catch(err => console.error("Error marcando como leído en polling", err));
                return msgs;
              }
              return prev;
            });
          } catch (error) {
             console.error('Error en polling de mensajes', error);
          }
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [id, searchParams, conversation?.idConversation, navigate]);

  useEffect(() => {
    const convId = Number(id) || conversation?.idConversation;
    if (!convId) return;

    const socket = getChatSocket();
    const handleNewMessage = ({ conversationId, message }: ChatNewMessageEvent) => {
      if (conversationId !== convId) return;

      setMessages((prev) => {
        if (prev.some((msg) => msg.idMessage === message.idMessage)) {
          return prev;
        }
        return [...prev, message];
      });

      if (!message.isMine) {
        chatService.markAsRead(convId).catch((error) => {
          console.error('Error marcando mensaje como leído desde socket', error);
        });
      }
    };

    socket.on('chat.new-message', handleNewMessage);
    return () => {
      socket.off('chat.new-message', handleNewMessage);
    };
  }, [id, conversation?.idConversation]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversation?.idConversation && !id) return;

    const convId = Number(id) || conversation?.idConversation;
    if (!convId) return;

    try {
      const sentMsg = await chatService.sendMessage(convId, newMessage);
      setMessages((prev) => {
        if (prev.some((msg) => msg.idMessage === sentMsg.idMessage)) {
          return prev;
        }
        return [...prev, sentMsg];
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error enviando mensaje', error);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-900">
      <Navbar />
      
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col overflow-hidden p-4">
        {/* Cabecera del Chat */}
        <header className="flex items-center gap-4 rounded-t-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-800">
          <button onClick={() => navigate(-1)} className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
            ←
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {conversation?.otherParticipantName || 'Cargando contacto...'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ref: {conversation?.petitionTitle || 'Solicitud de trabajo'}
            </p>
          </div>
        </header>

        {/* Historial de Mensajes */}
        <div className="flex-1 overflow-y-auto border-x border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
          {loading && messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-slate-500">Cargando mensajes...</div>
          ) : (
            <div className="flex flex-col gap-4">
              {messages.map((msg) => (
                <div key={msg.idMessage} className={`flex w-full ${msg.isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${
                      msg.isMine 
                        ? 'rounded-br-sm bg-brand-600 text-white' 
                        : 'rounded-bl-sm border border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <span className={`mt-1 block text-[10px] ${msg.isMine ? 'text-brand-200' : 'text-slate-400'}`}>
                      {format(new Date(msg.sentAt), 'HH:mm')}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input de Mensaje o Mensaje de Bloqueo */}
        <footer className="rounded-b-2xl border border-t-0 border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-800">
          {conversation?.isReadOnly ? (
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-2xl mb-2">🔒</span>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 text-center">
                Esta conversación ha sido cerrada.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-1">
                La solicitud de trabajo finalizó, se canceló o fue adjudicada a otro proveedor.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="flex items-end gap-2">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder="Escribe un mensaje..."
                className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                rows={1}
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white transition hover:bg-brand-700 disabled:opacity-50"
              >
                ➤
              </button>
            </form>
          )}
        </footer>
      </main>
    </div>
  );
};
