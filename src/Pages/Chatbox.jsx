import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import api from '../services/api';
import toast from 'react-hot-toast';

// En dev avec Vite, le proxy /socket.io redirige vers le backend. En prod, définir VITE_WS_URL si besoin.
const SOCKET_URL = import.meta.env.VITE_WS_URL || '';

export default function Chatbox() {
    const { user } = useSelector((state) => state.auth);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);

    // Connexion Socket.io pour réception instantanée des messages
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token || !user?.id) return;

        const socket = io(SOCKET_URL, {
            path: '/socket.io',
            auth: { token },
        });

        socket.on('connect', () => {
            // Optionnel : recharger une fois au connect pour synchroniser
            loadMessages();
        });

        socket.on('new_message', (msg) => {
            const formatted = {
                id: msg.id,
                content: msg.content,
                sender: msg.sender_id === user?.id ? 'user' : 'admin',
                sender_id: msg.sender_id,
                sender_name: msg.sender?.name || 'Support',
                created_at: msg.created_at,
                is_read: msg.is_read,
            };
            setMessages((prev) => {
                if (prev.some((m) => m.id === formatted.id)) return prev;
                return [...prev, formatted];
            });
        });

        socketRef.current = socket;
        return () => {
            socket.disconnect();
        };
    }, [user?.id]);

    // Chargement initial + polling de secours toutes les 15 s (si socket déconnecté)
    useEffect(() => {
        loadMessages();
        const interval = setInterval(loadMessages, 15000);
        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadMessages = async () => {
        try {
            setLoading(true);
            const response = await api.get('/chat/messages');
            const rawMessages = response.data.data || response.data || [];
            
            // Transformer les messages pour l'affichage
            const formattedMessages = rawMessages.map(msg => ({
                id: msg.id,
                content: msg.content,
                sender: msg.sender_id === user?.id ? 'user' : 'admin',
                sender_id: msg.sender_id,
                sender_name: msg.sender?.name || 'Support',
                created_at: msg.created_at,
                is_read: msg.is_read,
            }));
            
            // Ne mettre à jour que si les messages ont changé ; garder les réponses auto du Support (id "auto-...")
            setMessages(prev => {
                const autoReplies = prev.filter(m => String(m.id).startsWith('auto-'));
                const prevServerIds = prev.filter(m => !String(m.id).startsWith('auto-')).map(m => m.id).sort().join(',');
                const newServerIds = formattedMessages.map(m => m.id).sort().join(',');
                if (prevServerIds !== newServerIds) {
                    const merged = [...formattedMessages, ...autoReplies];
                    merged.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                    return merged;
                }
                return prev;
            });
        } catch (error) {
            console.error('Error loading messages:', error);
            // Si l'endpoint n'existe pas encore ou erreur, afficher message vide
            if (error.response?.status !== 404) {
                // Ne pas afficher l'erreur à chaque polling pour éviter le spam
                if (!loading) {
                    toast.error('Erreur lors du chargement des messages');
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        
        if (!newMessage.trim()) return;

        const messageContent = newMessage.trim();
        const messageToSend = {
            content: messageContent,
            sender: 'user',
            sender_name: user?.name || 'Utilisateur',
        };

        // Ajouter le message immédiatement pour un feedback instantané
        const tempMessage = {
            ...messageToSend,
            id: Date.now(),
            created_at: new Date().toISOString(),
        };
        setMessages([...messages, tempMessage]);
        setNewMessage('');
        setSending(true);

        try {
            // Envoyer le message au backend
            const response = await api.post('/chat/messages', {
                content: messageContent,
            });
            
            // Remplacer le message temporaire par le message réel du serveur
            const serverMessage = {
                id: response.data.id,
                content: response.data.content,
                sender: 'user',
                sender_id: response.data.sender_id,
                sender_name: response.data.sender?.name || user?.name || 'Vous',
                created_at: response.data.created_at,
                is_read: false,
            };
            
            setMessages(prev => {
                const withoutTemp = prev.filter(m => m.id !== tempMessage.id);
                return [...withoutTemp, serverMessage];
            });

            // Réponse automatique immédiate du support (pour réaction instantanée)
            const autoReplyText = messageContent.toLowerCase().includes('bonjour') || messageContent.toLowerCase().includes('bonsoir') || messageContent.toLowerCase().includes('salut')
                ? 'Bonjour ! Nous avons bien reçu votre message. Un conseiller vous répondra dans les plus brefs délais. Avez-vous des questions ?'
                : 'Nous avons bien reçu votre message. Un conseiller vous répondra rapidement. Avez-vous des questions ?';
            const autoReplyId = `auto-${Date.now()}`;
            setTimeout(() => {
                setMessages(prev => {
                    if (prev.some(m => m.id === autoReplyId)) return prev;
                    return [...prev, {
                        id: autoReplyId,
                        content: autoReplyText,
                        sender: 'admin',
                        sender_id: null,
                        sender_name: 'Support',
                        created_at: new Date().toISOString(),
                        is_read: false,
                    }];
                });
            }, 800);

            setTimeout(() => loadMessages(), 2000);
            toast.success('Message envoyé');
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error(error.response?.data?.message || 'Erreur lors de l\'envoi du message');
            // Retirer le message temporaire en cas d'erreur
            setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
        } finally {
            setSending(false);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex flex-col h-[calc(100vh-200px)] bg-white rounded-lg shadow-sm">
            {/* Header */}
            <div className="bg-blue-600 text-white p-4 rounded-t-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold">Chat de Support</h2>
                        <p className="text-sm opacity-90">Posez vos questions, nous vous répondrons rapidement</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                        <span className="text-xs opacity-75">En ligne</span>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        <div className="text-4xl mb-2">💬</div>
                        <p>Aucun message. Commencez la conversation !</p>
                    </div>
                ) : (
                    messages.map((message) => {
                        const isUser = message.sender === 'user' || message.sender_id === user?.id;
                        return (
                            <div
                                key={message.id}
                                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                        isUser
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 text-gray-900'
                                    }`}
                                >
                                    {!isUser && (
                                        <div className="text-xs font-semibold mb-1">
                                            {message.sender_name || 'Support'}
                                        </div>
                                    )}
                                    <div className="text-sm">{message.content}</div>
                                    <div
                                        className={`text-xs mt-1 ${
                                            isUser ? 'text-blue-100' : 'text-gray-500'
                                        }`}
                                    >
                                        {formatTime(message.created_at || message.createdAt)}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                {sending && (
                    <div className="flex justify-end">
                        <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="border-t border-gray-200 p-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Tapez votre message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={sending}
                    />
                    <button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Envoyer
                    </button>
                </div>
            </form>
        </div>
    );
}
