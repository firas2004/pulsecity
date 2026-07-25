import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Sparkles, RefreshCw, Key, Eye, EyeOff, Check, X, ChevronDown } from 'lucide-react';
import api from '../../services/api';
import { connectWebSocket } from '../../services/websocket';

/* ─── Metric context helpers ─────────────────────────────────── */
const METRIC_LABELS = {
  traffic: 'Trafic Routier (v/min)', air_co2: 'Qualité Air CO₂ (ppm)',
  noise: 'Niveau Sonore (dB)', energy: 'Énergie (kWh)',
  temperature: 'Température (°C)', humidity: 'Humidité (%)',
  wind_speed: 'Vent (km/h)', pedestrian: 'Flux Piétonnier (p/min)',
  waste_fill: 'Poubelles (%)', water_quality: 'Eau pH',
  parking: 'Parking libres (%)', foot_traffic: 'Flux Gare (p/min)',
};

const buildMetricContext = (metrics, cityName) => {
  if (!metrics || Object.keys(metrics).length === 0) return '';
  const lines = Object.entries(metrics).map(([k, v]) => {
    if (!v) return null;
    const label = METRIC_LABELS[k] || k;
    const status = v.anomaly || v.status === 'Critical' ? '⚠ ANOMALIE' : v.status === 'Warning' ? '! Avertissement' : '✓ Normal';
    return `• ${label}: ${Number(v.value || 0).toFixed(1)} [${status}]`;
  }).filter(Boolean);

  return `\n\n---\n📡 Données capteurs temps réel pour ${cityName}:\n${lines.join('\n')}\n---\n`;
};

const SUGGESTED = [
  { label: 'Y a-t-il des embouteillages ?', icon: '🚦' },
  { label: 'Quel est le meilleur itinéraire maintenant ?', icon: '🗺️' },
  { label: 'Quelle est la qualité de l\'air ?', icon: '🌫️' },
  { label: 'Température et météo actuelles ?', icon: '🌡️' },
  { label: 'Anomalies détectées ?', icon: '⚠️' },
  { label: 'État des parkings ?', icon: '🅿️' },
  { label: 'Niveau de bruit dans la ville ?', icon: '🔊' },
  { label: 'Qualité de l\'eau potable ?', icon: '💧' },
];

const DEFAULT_CITIES = [
  { id: 'tunis-centre', name: 'Tunis Centre' },
  { id: 'ariana', name: 'Ariana' },
  { id: 'la-marsa', name: 'La Marsa' },
  { id: 'sfax', name: 'Sfax' },
  { id: 'sousse', name: 'Sousse' },
  { id: 'ben-arous', name: 'Ben Arous' },
];

/* ─── Markdown renderer ──────────────────────────────────────── */
const renderMd = (text) => text
  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  .replace(/\*(.*?)\*/g, '<em>$1</em>')
  .replace(/`([^`]+)`/g, '<code style="background:rgba(99,102,241,0.15);padding:2px 6px;border-radius:4px;font-size:12px">$1</code>')
  .replace(/\n/g, '<br/>');

/* ─── Main Component ─────────────────────────────────────────── */
const ChatBot = () => {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: '👋 Bonjour ! Je suis **PulseCity Brain AI** — votre assistant intelligent connecté en temps réel aux capteurs de votre ville.\n\nPosez-moi n\'importe quelle question : trafic, qualité de l\'air, température, parkings, itinéraires sans embouteillages...',
    timestamp: new Date()
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0]);
  const [metrics, setMetrics] = useState({});
  const [groqKey, setGroqKey] = useState(() => localStorage.getItem('pulsecity_groq_key') || '');
  const [showKeyPanel, setShowKeyPanel] = useState(false);
  const [showKeyPassword, setShowKeyPassword] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const cleanupRef = useRef(null);

  /* Connect WS to get live metrics for chatbot context */
  const handleWsMessage = useCallback((data) => {
    const sensorData = data.metrics || data.sensors;
    if (sensorData) setMetrics(prev => ({ ...prev, ...sensorData }));
  }, []);

  useEffect(() => {
    if (cleanupRef.current) cleanupRef.current();
    setMetrics({});
    const cleanup = connectWebSocket(selectedCity.id, handleWsMessage);
    cleanupRef.current = cleanup;
    return () => { if (cleanupRef.current) cleanupRef.current(); };
  }, [selectedCity.id]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  /* Load chat history */
  useEffect(() => {
    api.get(`/chat/history/${selectedCity.id}`).then(res => {
      const history = res.data?.messages || [];
      if (history.length > 0) {
        setMessages(history.map(m => ({ ...m, timestamp: new Date(m.timestamp) })));
        setConversationId(res.data.conversation_id);
      }
    }).catch(() => {});
  }, [selectedCity.id]);

  const saveApiKey = (key) => {
    localStorage.setItem('pulsecity_groq_key', key.trim());
    setGroqKey(key.trim());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const sendMessage = async (text) => {
    const question = text || input.trim();
    if (!question || loading) return;

    const metricCtx = buildMetricContext(metrics, selectedCity.name);
    const enriched = question + metricCtx;

    setMessages(prev => [...prev, { role: 'user', content: question, timestamp: new Date() }]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chat', {
        message: enriched,
        city_id: selectedCity.id,
        api_key: groqKey || undefined,
      });
      const reply = res.data?.reply || res.data?.response || res.data?.answer
        || 'Désolé, je n\'ai pas pu générer une réponse.';
      if (res.data?.conversation_id) setConversationId(res.data.conversation_id);
      setMessages(prev => [...prev, { role: 'assistant', content: reply, timestamp: new Date() }]);
    } catch (err) {
      let msg = 'Erreur de connexion. Vérifiez que le backend est accessible.';
      if (err.response?.status === 401)
        msg = '🔐 Clé API Groq invalide. Configurez-la dans les paramètres ci-dessous.';
      else if (err.response?.status === 503)
        msg = '⚠️ Service IA temporairement indisponible. Configurez votre clé API Groq.';
      else if (err.response?.data?.detail)
        msg = `Erreur : ${typeof err.response.data.detail === 'string' ? err.response.data.detail : JSON.stringify(err.response.data.detail)}`;
      setMessages(prev => [...prev, { role: 'assistant', content: msg, isError: true, timestamp: new Date() }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: '🔄 Conversation réinitialisée. Comment puis-je vous aider ?', timestamp: new Date() }]);
    setConversationId(null);
  };

  const metricCount = Object.keys(metrics).length;

  return (
    <div style={{
      height: 'calc(100vh - 60px)',
      display: 'grid',
      gridTemplateColumns: '300px 1fr',
      gap: '0',
      background: 'linear-gradient(135deg, #0A0F1E 0%, #0D1B2A 100%)',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>

      {/* ── LEFT SIDEBAR ──────────────────────────────────────── */}
      <aside style={{
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column', padding: '20px 16px', gap: '16px',
        background: 'rgba(0,0,0,0.2)', overflowY: 'auto',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
          }}>
            <Sparkles size={20} style={{ color: '#FFF' }} />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '800', color: '#F1F5F9' }}>Brain AI</div>
            <div style={{ fontSize: '11px', color: '#64748B' }}>Assistant PulseCity</div>
          </div>
        </div>

        {/* Live sensor status */}
        <div style={{
          padding: '12px', borderRadius: '14px',
          background: metricCount > 0 ? 'rgba(16,185,129,0.08)' : 'rgba(100,116,139,0.08)',
          border: `1px solid ${metricCount > 0 ? 'rgba(16,185,129,0.2)' : 'rgba(100,116,139,0.15)'}`,
        }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: metricCount > 0 ? '#10B981' : '#64748B',
            textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
            {metricCount > 0 ? `✓ ${metricCount} capteurs connectés` : '◌ En attente des capteurs...'}
          </div>
          <p style={{ fontSize: '12px', color: '#94A3B8', lineHeight: 1.5, margin: 0 }}>
            Mes réponses intègrent les données <strong>temps réel</strong> de {selectedCity.name}.
            Demandez n'importe quelle métrique!
          </p>
        </div>

        {/* City selector */}
        <div>
          <div style={{ fontSize: '11px', color: '#475569', fontWeight: '700',
            textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Ville active</div>
          <div style={{ position: 'relative' }}>
            <select value={selectedCity.id}
              onChange={e => { const c = DEFAULT_CITIES.find(x => x.id === e.target.value); if (c) setSelectedCity(c); }}
              style={{
                width: '100%', padding: '9px 32px 9px 12px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px', color: '#F1F5F9', fontSize: '13px', fontWeight: '600',
                cursor: 'pointer', outline: 'none', appearance: 'none',
              }}>
              {DEFAULT_CITIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%',
              transform: 'translateY(-50%)', color: '#64748B', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* Suggestions */}
        <div>
          <div style={{ fontSize: '11px', color: '#475569', fontWeight: '700',
            textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Questions rapides</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {SUGGESTED.map((q, i) => (
              <button key={i} onClick={() => sendMessage(q.label)} disabled={loading}
                style={{
                  padding: '9px 12px', borderRadius: '10px', fontSize: '12px',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                  color: '#94A3B8', cursor: 'pointer', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.15s',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.12)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; e.currentTarget.style.color = '#C7D2FE'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#94A3B8'; }}>
                <span style={{ fontSize: '14px' }}>{q.icon}</span>
                <span style={{ lineHeight: 1.4 }}>{q.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* API Key */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
          <button onClick={() => setShowKeyPanel(!showKeyPanel)} style={{
            width: '100%', padding: '9px 12px', borderRadius: '10px', fontSize: '12px',
            background: groqKey ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${groqKey ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
            color: groqKey ? '#10B981' : '#EF4444', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', fontFamily: 'inherit',
          }}>
            <Key size={13} />
            {groqKey ? '✓ Clé API configurée' : '✗ Configurer la clé API Groq'}
          </button>
          {showKeyPanel && (
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type={showKeyPassword ? 'text' : 'password'}
                  placeholder="gsk_..."
                  value={groqKey}
                  onChange={e => setGroqKey(e.target.value)}
                  style={{
                    width: '100%', padding: '9px 36px 9px 10px',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px', color: '#F1F5F9', fontSize: '12px', outline: 'none',
                    boxSizing: 'border-box', fontFamily: 'monospace',
                  }}
                />
                <button type="button" onClick={() => setShowKeyPassword(!showKeyPassword)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}>
                  {showKeyPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <button onClick={() => saveApiKey(groqKey)} style={{
                padding: '9px', borderRadius: '8px', fontSize: '12px', fontWeight: '700',
                background: saveSuccess ? '#10B981' : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                border: 'none', color: '#FFF', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', gap: '6px', fontFamily: 'inherit',
              }}>
                {saveSuccess ? <><Check size={14} /> Enregistré!</> : 'Sauvegarder'}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── CHAT PANEL ────────────────────────────────────────── */}
      <section style={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>

        {/* Header */}
        <div style={{
          padding: '14px 22px', borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'rgba(0,0,0,0.2)', flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: '11px', color: '#6366F1', fontWeight: '700',
              letterSpacing: '0.12em', textTransform: 'uppercase' }}>IA · Ville connectée</div>
            <h2 style={{ fontSize: '17px', fontWeight: '800', color: '#F1F5F9', margin: '2px 0 0' }}>
              Assistant Urbain — {selectedCity.name}
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {metricCount > 0 && (
              <div style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px',
                background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)',
                color: '#10B981', fontWeight: '600' }}>
                ● {metricCount} capteurs actifs
              </div>
            )}
            <button onClick={clearChat} title="Nouvelle conversation" style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px', padding: '7px', cursor: 'pointer', color: '#94A3B8',
              display: 'flex', alignItems: 'center',
            }}>
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '20px 22px',
          display: 'flex', flexDirection: 'column', gap: '16px',
        }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{
              display: 'flex',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              alignItems: 'flex-start', gap: '10px',
            }}>
              {/* Avatar */}
              <div style={{
                width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, #3B82F6, #6366F1)'
                  : 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                boxShadow: `0 4px 12px ${msg.role === 'user' ? 'rgba(59,130,246,0.3)' : 'rgba(139,92,246,0.3)'}`,
              }}>
                {msg.role === 'user' ? <User size={15} style={{ color: '#fff' }} /> : <Bot size={15} style={{ color: '#fff' }} />}
              </div>

              {/* Bubble */}
              <div style={{
                maxWidth: '72%',
                padding: '12px 16px',
                borderRadius: msg.role === 'user' ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, #3B82F6, #6366F1)'
                  : msg.isError ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${msg.isError ? 'rgba(239,68,68,0.3)' : msg.role === 'user' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)'}`,
                color: msg.isError ? '#FCA5A5' : '#F1F5F9',
              }}>
                <div style={{ fontSize: '14px', lineHeight: 1.7 }}
                  dangerouslySetInnerHTML={{ __html: renderMd(msg.content) }} />
                <div style={{ fontSize: '10px', color: msg.role === 'user' ? 'rgba(255,255,255,0.6)' : '#475569',
                  marginTop: '6px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                  {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={15} style={{ color: '#fff' }} />
              </div>
              <div style={{ padding: '12px 16px', borderRadius: '4px 18px 18px 18px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', gap: '4px', alignItems: 'center' }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{
                    width: '6px', height: '6px', borderRadius: '50%', background: '#8B5CF6',
                    animation: `bounce 1.2s ${i * 0.2}s infinite`,
                    display: 'inline-block',
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: '14px 18px 16px', borderTop: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(0,0,0,0.2)', flexShrink: 0,
        }}>
          {/* Quick-access chips when conversation just started */}
          {messages.length <= 2 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
              {SUGGESTED.slice(0, 4).map((q, i) => (
                <button key={i} onClick={() => sendMessage(q.label)} disabled={loading}
                  style={{
                    padding: '5px 12px', borderRadius: '20px', fontSize: '12px',
                    background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
                    color: '#A5B4FC', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500',
                    display: 'flex', alignItems: 'center', gap: '5px',
                  }}>
                  {q.icon} {q.label}
                </button>
              ))}
            </div>
          )}

          <div style={{
            display: 'flex', gap: '10px', alignItems: 'flex-end',
            padding: '10px 12px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '14px',
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder={`Posez votre question sur ${selectedCity.name}... (Entrée pour envoyer)`}
              disabled={loading}
              rows={1}
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                color: '#F1F5F9', fontSize: '14px', resize: 'none',
                lineHeight: '1.6', fontFamily: 'inherit', maxHeight: '120px', overflowY: 'auto',
              }}
              onInput={e => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
            />
            <button onClick={() => sendMessage()} disabled={loading || !input.trim()} style={{
              width: '40px', height: '40px', borderRadius: '10px', border: 'none',
              background: input.trim() && !loading
                ? 'linear-gradient(135deg, #6366F1, #8B5CF6)'
                : 'rgba(255,255,255,0.06)',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s', flexShrink: 0,
              boxShadow: input.trim() && !loading ? '0 4px 12px rgba(99,102,241,0.4)' : 'none',
            }}>
              <Send size={16} style={{ color: input.trim() && !loading ? '#FFF' : '#475569' }} />
            </button>
          </div>
          <p style={{ fontSize: '10px', color: '#334155', textAlign: 'center', marginTop: '6px', margin: '6px 0 0' }}>
            L'IA utilise les données capteurs en temps réel · Alimenté par Groq LLM
          </p>
        </div>
      </section>

      {/* Bounce animation */}
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
};

export default ChatBot;
