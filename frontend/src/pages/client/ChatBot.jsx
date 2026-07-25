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
    <div style={{ height: 'calc(100vh - 80px)', padding: '24px 32px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '1360px', display: 'grid', gridTemplateColumns: '320px minmax(0, 1fr)', gap: '18px', minHeight: 0 }}>
        <aside style={{
          background: 'linear-gradient(180deg, var(--surface) 0%, var(--surface-2) 100%)',
          border: '1px solid var(--border-color)', borderRadius: '24px',
          padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px',
          boxShadow: 'var(--shadow)', minHeight: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '14px',
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(59, 130, 246, 0.25)'
            }}>
              <Sparkles size={20} style={{ color: '#FFF' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>PulseCity Brain AI</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0' }}>Analyse temps réel des villes</p>
            </div>
          </div>

          <div style={{
            borderRadius: '16px', padding: '14px', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(139, 92, 246, 0.12))',
            border: '1px solid rgba(59, 130, 246, 0.16)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
              <Bot size={13} /> Assistant prêt
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: 1.6, margin: '8px 0 0' }}>
              Posez des questions sur la circulation, la qualité de l’air, les anomalies et les alertes en cours.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.16em', textTransform: 'uppercase' }}>Suggestions</div>
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button key={idx} onClick={() => sendMessage(q.label)} disabled={loading}
                style={{
                  padding: '10px 12px', borderRadius: '12px', fontSize: '13px',
                  backgroundColor: 'var(--surface)', border: '1px solid var(--border-color)',
                  color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                  textAlign: 'left', transition: 'all 0.2s', fontWeight: '500'
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--surface-2)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--surface)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
              >
                <span>{q.icon}</span> {q.label}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Ville active</span>
              <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)}
                style={{ padding: '7px 10px', backgroundColor: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', fontSize: '12px', outline: 'none' }}>
                {DEFAULT_CITIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <button onClick={() => setShowKeySettings(!showKeySettings)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '9px 12px', borderRadius: '10px', fontSize: '13px',
                backgroundColor: groqKey ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${groqKey ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                color: groqKey ? 'var(--success)' : 'var(--danger)', cursor: 'pointer', fontWeight: '600'
              }}>
              <Key size={14} /> {groqKey ? 'Clé API configurée' : 'Configurer la clé API'}
            </button>
          </div>
        </aside>

        <section style={{
          display: 'flex', flexDirection: 'column', minHeight: 0,
          background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '24px',
          overflow: 'hidden', boxShadow: 'var(--shadow)'
        }}>
          <header style={{
            padding: '18px 22px', borderBottom: '1px solid var(--border-color)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px',
            background: 'linear-gradient(90deg, var(--surface) 0%, var(--surface-2) 100%)'
          }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--primary)' }}>Conversation IA</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', margin: '2px 0 0' }}>Assistant de surveillance urbain</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div className="stat-chip"><Sparkles size={13} style={{ color: 'var(--accent)' }} /> Historique par ville</div>
              <button className="btn btn-secondary" onClick={clearChat} title="Nouvelle conversation" style={{ borderRadius: '10px' }}>
                <RefreshCw size={14} />
              </button>
            </div>
          </header>

          {showKeySettings && (
            <div style={{
              backgroundColor: 'var(--surface-2)', borderBottom: '1px solid var(--border-color)',
              padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <Key size={16} style={{ color: 'var(--primary)' }} /> Clé API Groq personnelle
                </h4>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Stockée localement dans votre navigateur</span>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                  <input
                    type={showKeyPassword ? 'text' : 'password'}
                    placeholder="Entrez votre clé API Groq (ex: gsk_...)"
                    value={groqKey}
                    onChange={(e) => setGroqKey(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 40px 10px 12px', borderRadius: '10px',
                      backgroundColor: 'var(--surface)', border: '1px solid var(--border-color)',
                      color: 'var(--text-main)', fontSize: '13px', outline: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeyPassword(!showKeyPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    {showKeyPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <button
                  onClick={() => saveApiKey(groqKey)}
                  style={{
                    padding: '0 18px', borderRadius: '10px', fontSize: '13px', fontWeight: '600',
                    backgroundColor: saveSuccess ? 'var(--success)' : 'var(--primary)', color: '#FFF',
                    border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  {saveSuccess ? <Check size={16} /> : null}
                  {saveSuccess ? 'Enregistré' : 'Sauvegarder'}
                </button>
              </div>
            </div>
          )}

          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 14px', background: 'linear-gradient(180deg, var(--surface-2) 0%, var(--surface) 100%)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, #3B82F6, #6366F1)'
                    : 'linear-gradient(135deg, #8B5CF6, #EC4899)'
                }}>
                  {msg.role === 'user' ? <User size={16} style={{ color: '#FFF' }} /> : <Bot size={16} style={{ color: '#FFF' }} />}
                </div>

                <div style={{
                  maxWidth: '78%', padding: '12px 14px', borderRadius: '18px',
                  backgroundColor: msg.role === 'user' ? 'linear-gradient(135deg, var(--primary), var(--accent))' : 'var(--surface)',
                  border: `1px solid ${msg.isError ? 'rgba(239,68,68,0.3)' : msg.role === 'user' ? 'rgba(255,255,255,0.2)' : 'var(--border-color)'}`,
                  boxShadow: 'var(--shadow)',
                  color: msg.isError ? 'var(--danger)' : msg.role === 'user' ? '#FFF' : 'var(--text-main)'
                }}>
                  <div style={{ fontSize: '14px', lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: formatMessageContent(msg.content) }} />
                  <span style={{ fontSize: '10px', color: msg.role === 'user' ? 'rgba(255,255,255,0.75)' : 'var(--text-muted)', marginTop: '8px', display: 'block', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                    {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(135deg, #8B5CF6, #EC4899)'
                }}>
                  <Bot size={16} style={{ color: '#FFF' }} />
                </div>
                <div style={{
                  padding: '14px 18px', borderRadius: '18px', backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ padding: '16px 18px 18px', borderTop: '1px solid var(--border-color)', background: 'var(--surface)' }}>
            {messages.length <= 2 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                {SUGGESTED_QUESTIONS.map((q, idx) => (
                  <button key={idx} onClick={() => sendMessage(q.label)} disabled={loading}
                    style={{
                      padding: '8px 12px', borderRadius: '999px', fontSize: '12px',
                      backgroundColor: 'var(--surface-2)', border: '1px solid var(--border-color)',
                      color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                      transition: 'all 0.2s', fontWeight: '500'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--surface)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--surface-2)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                  >
                    <span>{q.icon}</span> {q.label}
                  </button>
                ))}
              </div>
            )}

            <div style={{
              display: 'flex', gap: '12px', alignItems: 'flex-end',
              padding: '12px 14px', backgroundColor: 'var(--surface-2)',
              border: '1px solid var(--border-color)', borderRadius: '16px', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)'
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
                  color: 'var(--text-main)', fontSize: '14px', resize: 'none', lineHeight: '1.6',
                  fontFamily: 'inherit', maxHeight: '120px', overflowY: 'auto'
                }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
              />
              <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
                style={{
                  width: '42px', height: '42px', borderRadius: '12px',
                  background: input.trim() && !loading ? 'linear-gradient(135deg, var(--primary), var(--accent))' : 'var(--surface)',
                  border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s', flexShrink: 0
                }}>
                <Send size={16} style={{ color: input.trim() && !loading ? '#FFF' : '#6B7280' }} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ChatBot;
