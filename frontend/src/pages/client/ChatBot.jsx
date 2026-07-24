import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, RefreshCw, Settings, Key, Eye, EyeOff, Check } from 'lucide-react';
import api from '../../services/api';

const SUGGESTED_QUESTIONS = [
  { label: 'Est-ce dangereux de sortir maintenant ?', icon: '⚠️' },
  { label: 'Y a-t-il des embouteillages ?', icon: '🚦' },
  { label: 'Quelle est la qualité de l\'air ?', icon: '💨' },
  { label: 'Quelle est la situation des capteurs ?', icon: '📊' },
  { label: 'Y a-t-il des anomalies détectées ?', icon: '🔍' }
];

const DEFAULT_CITIES = [
  { id: 'tunis-centre', name: 'Tunis Centre' },
  { id: 'ariana', name: 'Ariana' },
  { id: 'la-marsa', name: 'La Marsa' },
  { id: 'sfax', name: 'Sfax' },
  { id: 'sousse', name: 'Sousse' },
  { id: 'ben-arous', name: 'Ben Arous' }
];

const ChatBot = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Bonjour ! Je suis le **PulseCity Brain AI**, votre assistant intelligent pour surveiller votre ville en temps réel.\n\nPosez-moi des questions sur la qualité de l\'air, le trafic, les alertes ou l\'état général de votre ville.',
      timestamp: new Date()
    }
  ]);
  const [conversationId, setConversationId] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState('tunis-centre');
  const [groqKey, setGroqKey] = useState(() => localStorage.getItem('pulsecity_groq_key') || '');
  const [showKeySettings, setShowKeySettings] = useState(false);
  const [showKeyPassword, setShowKeyPassword] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await api.get(`/chat/history/${selectedCity}`);
        const history = res.data?.messages || [];
        if (history.length > 0) {
          setMessages(history.map(msg => ({ ...msg, timestamp: new Date(msg.timestamp) })));
          setConversationId(res.data.conversation_id);
        }
      } catch (err) {
        console.warn('No prior chat history', err);
      }
    };
    loadHistory();
  }, [selectedCity]);

  const saveApiKey = (key) => {
    localStorage.setItem('pulsecity_groq_key', key.trim());
    setGroqKey(key.trim());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const sendMessage = async (text) => {
    const question = text || input.trim();
    if (!question || loading) return;

    const userMsg = { role: 'user', content: question, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chat', {
        message: question,
        city_id: selectedCity,
        api_key: groqKey || undefined
      });

      const reply = res.data?.reply || res.data?.response || res.data?.answer || 'Désolé, je n\'ai pas pu obtenir une réponse.';
      const sources = res.data?.sources || [];
      if (res.data?.conversation_id) setConversationId(res.data.conversation_id);

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: reply,
        sources,
        timestamp: new Date()
      }]);
    } catch (err) {
      let errorMsg = 'Désolé, une erreur est survenue. Vérifiez que le backend est accessible.';
      if (err.response?.status === 401) {
        errorMsg = '🔐 Authentification requise ou Clé API Groq invalide / expirée. Veuillez vérifier votre clé API dans les paramètres ci-dessus.';
      } else if (err.response?.status === 503) {
        errorMsg = '⚠️ Le service AI est temporairement indisponible (clé API à configurer côté backend ou à saisir ci-dessus).';
      } else if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        errorMsg = typeof detail === 'string' ? `Erreur: ${detail}` : `Erreur: ${JSON.stringify(detail)}`;
      }
      setMessages(prev => [...prev, { role: 'assistant', content: errorMsg, isError: true, timestamp: new Date() }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: '🔄 Conversation réinitialisée. Comment puis-je vous aider ?',
      timestamp: new Date()
    }]);
    setConversationId(null);
  };

  const formatMessageContent = (content) => {
    // Conversion basique Markdown → HTML inline
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)', padding: '24px 32px', gap: '16px' }}>
      <div className="dashboard-hero" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <div className="section-title">Assistant IA</div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>Conversation intelligente avec PulseCity</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '620px' }}>Posez des questions sur les villes, les capteurs, les alertes et les anomalies détectées.</p>
        </div>
        <div className="stat-chip"><Sparkles size={14} style={{ color: 'var(--accent)' }} /> Histoire conservée par ville</div>
      </div>
      {/* En-tête ChatBot */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Sparkles size={20} style={{ color: '#FFF' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>PulseCity Brain AI</h1>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Propulsé par Groq • Accès temps réel aux capteurs</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Bouton Configuration Clé API */}
          <button 
            onClick={() => setShowKeySettings(!showKeySettings)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 14px', borderRadius: '8px', fontSize: '13px',
              backgroundColor: groqKey ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${groqKey ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
              color: groqKey ? 'var(--success)' : 'var(--danger)',
              cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s'
            }}
          >
            <Key size={14} />
            <span>{groqKey ? 'Clé API configurée' : 'Configurer Clé API'}</span>
            <Settings size={14} />
          </button>

          {/* Sélecteur de ville */}
          <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)}
            style={{ padding: '8px 12px', backgroundColor: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', fontSize: '13px', outline: 'none' }}>
            {DEFAULT_CITIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <button className="btn btn-secondary" onClick={clearChat} title="Nouvelle conversation">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Panneau de configuration Clé API Groq */}
      {showKeySettings && (
        <div style={{
          backgroundColor: 'var(--surface)', border: '1px solid var(--border-color)',
          borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px',
          boxShadow: 'var(--shadow)', animation: 'slideDown 0.2s ease-out'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={16} style={{ color: 'var(--primary)' }} />
              Clé API Groq Personnelle
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Stockée localement dans votre navigateur
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type={showKeyPassword ? 'text' : 'password'}
                placeholder="Entrez votre clé API Groq (ex: gsk_...)"
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                style={{
                  width: '100%', padding: '10px 40px 10px 12px', borderRadius: '8px',
                  backgroundColor: 'var(--surface-2)', border: '1px solid var(--border-color)',
                  color: 'var(--text-main)', fontSize: '13px', outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowKeyPassword(!showKeyPassword)}
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer'
                }}
              >
                {showKeyPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button
              onClick={() => saveApiKey(groqKey)}
              style={{
                padding: '0 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
                backgroundColor: saveSuccess ? 'var(--success)' : 'var(--primary)', color: '#FFF',
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                transition: 'background-color 0.2s'
              }}
            >
              {saveSuccess ? <Check size={16} /> : null}
              {saveSuccess ? 'Enregistré' : 'Sauvegarder'}
            </button>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
            💡 Vous pouvez obtenir une clé API gratuite sur <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" style={{ color: '#3B82F6', textDecoration: 'underline' }}>console.groq.com</a>.
          </p>
        </div>
      )}

      {/* Zone de messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px',
        backgroundColor: 'var(--surface-2)', borderRadius: '12px',
        border: '1px solid var(--border-color)',
        display: 'flex', flexDirection: 'column', gap: '16px'
      }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            display: 'flex',
            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
            alignItems: 'flex-start', gap: '10px'
          }}>
            {/* Avatar */}
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, #3B82F6, #6366F1)'
                : 'linear-gradient(135deg, #8B5CF6, #EC4899)'
            }}>
              {msg.role === 'user' ? <User size={16} style={{ color: '#FFF' }} /> : <Bot size={16} style={{ color: '#FFF' }} />}
            </div>

            {/* Bulle de message */}
            <div style={{
              maxWidth: '72%', padding: '12px 16px', borderRadius: '12px',
              backgroundColor: msg.role === 'user' ? 'linear-gradient(135deg, var(--primary), var(--accent))' : 'var(--surface)',
              border: `1px solid ${msg.isError ? 'rgba(239,68,68,0.3)' : msg.role === 'user' ? 'rgba(255,255,255,0.2)' : 'var(--border-color)'}`,
              boxShadow: 'var(--shadow)'
            }}>
              <div
                style={{ fontSize: '14px', color: msg.isError ? 'var(--danger)' : msg.role === 'user' ? '#FFF' : 'var(--text-main)', lineHeight: '1.6' }}
                dangerouslySetInnerHTML={{ __html: formatMessageContent(msg.content) }}
              />
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px', display: 'block', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {/* Indicateur de frappe */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, #8B5CF6, #EC4899)'
            }}>
              <Bot size={16} style={{ color: '#FFF' }} />
            </div>
            <div style={{
              padding: '14px 18px', borderRadius: '12px',
              backgroundColor: 'var(--surface)', border: '1px solid var(--border-color)',
              display: 'flex', alignItems: 'center', gap: '4px'
            }}>
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Questions suggérées */}
      {messages.length <= 2 && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button key={idx} onClick={() => sendMessage(q.label)} disabled={loading}
              style={{
                padding: '8px 14px', borderRadius: '20px', fontSize: '13px',
                backgroundColor: 'var(--surface)', border: '1px solid var(--border-color)',
                color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                transition: 'all 0.2s', fontWeight: '500'
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--surface-2)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--surface)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
            >
              <span>{q.icon}</span> {q.label}
            </button>
          ))}
        </div>
      )}

      {/* Zone de saisie */}
      <div style={{
        display: 'flex', gap: '12px', alignItems: 'flex-end',
        padding: '14px 16px', backgroundColor: 'var(--surface)',
        border: '1px solid var(--border-color)', borderRadius: '12px'
      }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Posez votre question sur la ville... (Entrée pour envoyer)"
          disabled={loading}
          rows={1}
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            color: 'var(--text-main)', fontSize: '14px', resize: 'none', lineHeight: '1.5',
            fontFamily: 'inherit', maxHeight: '120px', overflowY: 'auto'
          }}
          onInput={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
          }}
        />
        <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
          style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: input.trim() && !loading ? 'linear-gradient(135deg, var(--primary), var(--accent))' : 'var(--surface-2)',
            border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s', flexShrink: 0
          }}>
          <Send size={16} style={{ color: input.trim() && !loading ? '#FFF' : '#6B7280' }} />
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
