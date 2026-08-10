import React, { useState, useEffect, useRef } from 'react';
import { Brain, Bot, X, Building2 } from 'lucide-react';
import ChatSidebar from './ChatSidebar';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';
import api from '../../services/api';

const TUNISIAN_CITIES = [
  { id: 'tunis', name: 'Tunis Centre' },
  { id: 'ariana', name: 'Ariana' },
  { id: 'la-marsa', name: 'La Marsa' },
  { id: 'ben-arous', name: 'Ben Arous' },
  { id: 'sfax', name: 'Sfax' },
  { id: 'sousse', name: 'Sousse' },
  { id: 'bizerte', name: 'Bizerte' },
  { id: 'gabes', name: 'Gabès' },
  { id: 'monastir', name: 'Monastir' },
  { id: 'nabeul', name: 'Nabeul' },
  { id: 'kairouan', name: 'Kairouan' },
  { id: 'mahdia', name: 'Mahdia' },
  { id: 'beja', name: 'Béja' },
  { id: 'jendouba', name: 'Jendouba' },
  { id: 'gafsa', name: 'Gafsa' },
  { id: 'tozeur', name: 'Tozeur' },
  { id: 'medenine', name: 'Médenine' },
  { id: 'siliana', name: 'Siliana' },
];

const DEFAULT_GUIDE_ACTIONS = [
  { label: '🚗 Trajets & Transport', link: '/client/trip-simulator' },
  { label: '🏥 Santé & Établissements', link: '/client/sante' },
  { label: '🏛️ Administrations', link: '/client/administrations' },
  { label: '📊 Éco Pulse', link: '/client/eco' },
  { label: '🛒 Magasins & Promos', link: '/client/magasins' },
  { label: '📍 Pulse Local (POI)', link: '/client/local' },
  { label: '🏖️ Plages & Baignade', link: '/client/beaches' },
  { label: '🌿 Environnement', link: '/client/environment' },
  { label: '🏆 Score & Classement', link: '/client/ranking' },
];

const ChatInterface = ({
  assistantType = 'pulse_brain', // 'pulse_brain' | 'pulse_guide'
  onClose,
  isModal = false,
  hideSidebar = false,
  initialCity = 'tunis',
}) => {
  const isBrain = assistantType === 'pulse_brain';
  const storageKey = isBrain ? 'pulse_brain_conversations' : 'pulse_guide_conversations';
  const activeKey = isBrain ? 'pulse_brain_active_id' : 'pulse_guide_active_id';

  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [conversations, setConversations] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [activeConvId, setActiveConvId] = useState(() => {
    return localStorage.getItem(activeKey) || null;
  });

  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(conversations));
    } catch (e) {}
  }, [conversations, storageKey]);

  useEffect(() => {
    if (activeConvId) {
      localStorage.setItem(activeKey, activeConvId);
    }
  }, [activeConvId, activeKey]);

  const activeConv = conversations.find((c) => c.id === activeConvId) || null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConv?.messages, loading]);

  const handleNewChat = () => {
    const newId = `${assistantType}_${Date.now()}`;
    const newConv = {
      id: newId,
      title: 'Nouvelle discussion',
      assistant_type: assistantType,
      city_id: selectedCity,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      messages: [
        {
          role: 'assistant',
          content: isBrain
            ? `Bonjour ! Je suis **Pulse Brain**, l'assistant intelligent de **${
                TUNISIAN_CITIES.find((c) => c.id === selectedCity)?.name || selectedCity
              }**. Posez-moi des questions sur les métriques en direct, la mobilité, la santé, l'économie ou les démarches.`
            : `Bienvenue sur **Pulse City** 🇹🇳 ! Je suis **Pulse Guide**, votre assistant d'accueil. Comment puis-je vous guider aujourd'hui ?`,
          timestamp: new Date().toISOString(),
          suggested_actions: isBrain
            ? [
                { label: '🚗 Trajets & Transport', link: '/client/trip-simulator' },
                { label: '🏥 Santé & Établissements', link: '/client/sante' },
                { label: '📊 Éco Pulse', link: '/client/eco' },
              ]
            : DEFAULT_GUIDE_ACTIONS,
        },
      ],
    };

    setConversations((prev) => [newConv, ...prev]);
    setActiveConvId(newId);
  };

  useEffect(() => {
    if (conversations.length === 0) {
      handleNewChat();
    } else if (!activeConvId || !conversations.some((c) => c.id === activeConvId)) {
      setActiveConvId(conversations[0].id);
    }
  }, []);

  const handleDeleteConversation = (convId) => {
    setConversations((prev) => {
      const filtered = prev.filter((c) => c.id !== convId);
      if (activeConvId === convId) {
        setActiveConvId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  };

  const handleSendMessage = async (text) => {
    let currentConvId = activeConvId;
    let targetConv = activeConv;

    if (!targetConv) {
      handleNewChat();
      return;
    }

    const userMsg = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    const firstUserMsg = !targetConv.messages.some((m) => m.role === 'user');
    const updatedTitle = firstUserMsg ? text.slice(0, 24) + (text.length > 24 ? '...' : '') : targetConv.title;

    const updatedConv = {
      ...targetConv,
      title: updatedTitle,
      updated_at: new Date().toISOString(),
      messages: [...targetConv.messages, userMsg],
    };

    setConversations((prev) => prev.map((c) => (c.id === currentConvId ? updatedConv : c)));
    setLoading(true);

    try {
      const endpoint = isBrain ? '/ai-chat/pulse-brain' : '/ai-chat/pulse-guide';
      const payload = isBrain
        ? {
            message: text,
            city_id: selectedCity,
            conversation_id: currentConvId,
            history: updatedConv.messages.slice(-8),
          }
        : {
            message: text,
            page: window.location.pathname,
            user_type: localStorage.getItem('role') || 'anonymous',
            conversation_id: currentConvId,
            history: updatedConv.messages.slice(-8),
          };

      const res = await api.post(endpoint, payload);
      const aiReply = res.data;

      const assistantMsg = {
        role: 'assistant',
        content: aiReply.message || 'Voici les informations demandées.',
        suggested_actions: aiReply.suggested_actions || [],
        timestamp: aiReply.timestamp || new Date().toISOString(),
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === currentConvId
            ? {
                ...c,
                updated_at: new Date().toISOString(),
                messages: [...c.messages, assistantMsg],
              }
            : c
        )
      );
    } catch (err) {
      console.error('Chat API error:', err);
      // Smart offline fallback
      const fallbackMsg = {
        role: 'assistant',
        content: `Je suis là pour vous aider ! Vous pouvez explorer tous nos services directement :`,
        suggested_actions: DEFAULT_GUIDE_ACTIONS,
        timestamp: new Date().toISOString(),
      };

      setConversations((prev) =>
        prev.map((c) => (c.id === currentConvId ? { ...c, messages: [...c.messages, fallbackMsg] } : c))
      );
    } finally {
      setLoading(false);
    }
  };

  const headerBg = isBrain
    ? 'linear-gradient(135deg, #1E3A8A 0%, #1565C0 100%)'
    : 'linear-gradient(135deg, #004D40 0%, #00897B 100%)';

  const showSidebar = !hideSidebar && isBrain;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      backgroundColor: 'var(--bg-color, #0B0F17)',
      borderRadius: isModal ? '16px' : '16px',
      border: '1px solid var(--border-color, rgba(255,255,255,0.12))',
      boxShadow: isModal ? 'none' : '0 12px 36px rgba(0, 0, 0, 0.4)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 18px',
        background: headerBg,
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {isBrain ? <Brain size={18} /> : <Bot size={18} />}
          </div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isBrain ? 'Pulse Brain 🧠' : 'Pulse Guide 💬'}
              <span style={{
                fontSize: '0.65rem',
                padding: '2px 7px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                fontWeight: '600',
              }}>
                Llama 3.1 8B
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', opacity: 0.88 }}>
              {isBrain
                ? 'Expert Smart City & Métrologie'
                : 'Accueil & Support Pulse City'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isBrain && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 size={14} />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.35)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '6px',
                  padding: '4px 6px',
                  fontSize: '0.8rem',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {TUNISIAN_CITIES.map((c) => (
                  <option key={c.id} value={c.id} style={{ backgroundColor: '#1E293B' }}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                opacity: 0.85,
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.85')}
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', width: '100%' }}>
        {showSidebar && (
          <ChatSidebar
            conversations={conversations}
            activeId={activeConvId}
            onSelectConversation={setActiveConvId}
            onNewChat={handleNewChat}
            onDeleteConversation={handleDeleteConversation}
            assistantType={assistantType}
          />
        )}

        {/* Messages view (Full width when sidebar is hidden) */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--surface-dark, #0B0F17)',
          overflow: 'hidden',
          width: '100%',
        }}>
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            boxSizing: 'border-box',
          }}>
            {activeConv?.messages.map((msg, index) => (
              <ChatMessage
                key={index}
                message={msg}
                assistantType={assistantType}
                onActionClick={onClose}
              />
            ))}

            {loading && (
              <div style={{ marginBottom: '14px' }}>
                <TypingIndicator color={isBrain ? '#1565C0' : '#00897B'} />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={loading}
            placeholder={
              isBrain
                ? `Question sur ${TUNISIAN_CITIES.find((c) => c.id === selectedCity)?.name || selectedCity}...`
                : 'Posez votre question sur Pulse City...'
            }
          />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
