import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Sparkles, RefreshCw, Key, Eye, EyeOff, Check, X, ChevronDown, Waves } from 'lucide-react';
import api from '../../services/api';
import { connectWebSocket } from '../../services/websocket';

/* ─── Metric & Beach context helpers ─────────────────────────────── */
const METRIC_LABELS = {
  traffic: 'Trafic Routier (v/min)', air_co2: 'Qualité Air CO₂ (ppm)',
  noise: 'Niveau Sonore (dB)', energy: 'Énergie (kWh)',
  temperature: 'Température (°C)', humidity: 'Humidité (%)',
  wind_speed: 'Vent (km/h)', pedestrian: 'Flux Piétonnier (p/min)',
  waste_fill: 'Poubelles (%)', water_quality: 'Eau pH',
  parking: 'Parking libres (%)', foot_traffic: 'Flux Gare (p/min)',
};

const COASTAL_BEACH_KNOWLEDGE = {
  'la-marsa': ['Plage de La Marsa', 'Plage de Gammarth', 'Crique de Sidi Bou Saïd'],
  'sousse': ['Plage Boujaafar (centre-ville)', 'Plage Port El Kantaoui', 'Plage Las Vegas Sousse'],
  'bizerte': ['Corniche de Bizerte', 'Plage Les Grottes (Cap Blanc)', 'Plage Rmel'],
  'monastir': ['Plage Qaraiya (au pied du Ribat)', 'Plage Skanès'],
  'nabeul': ['Plage de Kélibia Fort (sable blanc)', 'Plage Yasmine Hammamet', 'Plage de Nabeul'],
  'mahdia': ['Plage Salakta', 'Plage Zone Touristique Mahdia'],
  'sfax': ['Plage Chott El Karkanah'],
  'gabes': ['Plage Chott Essalam']
};

const buildMetricContext = (metrics, cityName, cityId) => {
  let text = '';
  if (metrics && Object.keys(metrics).length > 0) {
    const lines = Object.entries(metrics).map(([k, v]) => {
      if (!v) return null;
      const label = METRIC_LABELS[k] || k;
      const status = v.anomaly || v.status === 'Critical' ? '⚠ ANOMALIE' : v.status === 'Warning' ? '! Avertissement' : '✓ Normal';
      return `• ${label}: ${Number(v.value || 0).toFixed(1)} [${status}]`;
    }).filter(Boolean);

    text += `\n\n---\n📡 Données capteurs temps réel pour ${cityName}:\n${lines.join('\n')}\n`;
  }

  // Add Coastal Beach Knowledge
  const beaches = COASTAL_BEACH_KNOWLEDGE[cityId];
  if (beaches && beaches.length > 0) {
    const phVal = metrics?.water_quality?.value;
    const windVal = metrics?.wind_speed?.value;
    const tempVal = metrics?.temperature?.value;
    
    let swimStatus = '🟢 Baignade Autorisée & Idéale (Eau propre & mer calme)';
    if (phVal && (phVal < 6.5 || phVal > 8.5)) swimStatus = '🔴 Baignade Interdite (Anomalie pH de l\'eau détectée)';
    else if (windVal && windVal > 40) swimStatus = '🔴 Mer Agitée / Vent Fort (>40 km/h)';
    else if (windVal && windVal > 20) swimStatus = '🟡 Baignade Prudence (Vent modéré)';

    text += `\n🏖️ Données & Infos Plages/Baignade pour ${cityName}:\n`;
    text += `• Plages principales accessibles: ${beaches.join(', ')}\n`;
    text += `• Condition Baignade Actuelle: ${swimStatus}\n`;
    if (tempVal) text += `• Température de l'air/mer: ${Number(tempVal).toFixed(1)}°C\n`;
    if (phVal) text += `• Qualité de l'Eau pH: ${Number(phVal).toFixed(2)}\n`;
    text += `---\n`;
  } else {
    text += `\nℹ Note: ${cityName} est une zone urbaine continentale (pas de plage maritime directe).\n---\n`;
  }

  return text;
};

const SUGGESTED = [
  { label: 'Plages & conditions de baignade à Sousse / La Marsa ?', icon: '🏖️' },
  { label: 'Y a-t-il des embouteillages ?', icon: '🚦' },
  { label: 'Quel est le meilleur itinéraire maintenant ?', icon: '🗺️' },
  { label: 'Quelle est la qualité de l\'air et la température ?', icon: '🌡️' },
  { label: 'Anomalies et alertes détectées ?', icon: '⚠️' },
  { label: 'Disponibilité des places de parking ?', icon: '🅿️' },
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
    content: '👋 Bonjour ! Je suis **PulseCity Brain AI** — votre assistant intelligent connecté en temps réel aux capteurs et plages de votre ville.\n\nPosez-moi n\'importe quelle question : plages de Sousse, baignade à La Marsa, trafic, qualité de l\'air, parkings, itinéraires...',
    timestamp: new Date()
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[4]); // Sousse default
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

  const handleSaveKey = () => {
    localStorage.setItem('pulsecity_groq_key', groqKey.trim());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleSend = async (overrideText) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg = { role: 'user', content: textToSend.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    if (!overrideText) setInput('');
    setLoading(true);

    const metricCtx = buildMetricContext(metrics, selectedCity.name, selectedCity.id);
    const enriched = textToSend.trim() + metricCtx;

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
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(99,102,241,0.4)',
          }}>
            <Sparkles size={20} color="#FFF" />
          </div>
          <div>
            <div style={{ color: '#FFF', fontWeight: '700', fontSize: '15px' }}>PulseCity Brain</div>
            <div style={{ color: '#818CF8', fontSize: '11px', fontWeight: '500' }}>Assistant IA & Plages</div>
          </div>
        </div>

        {/* City Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ color: '#94A3B8', fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px' }}>
            VILLE SELECTIONNÉE
          </label>
          <select
            value={selectedCity.id}
            onChange={e => setSelectedCity(DEFAULT_CITIES.find(c => c.id === e.target.value) || DEFAULT_CITIES[0])}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '10px', color: '#FFF', padding: '10px 12px', fontSize: '13px',
              cursor: 'pointer', outline: 'none',
            }}
          >
            {DEFAULT_CITIES.map(c => (
              <option key={c.id} value={c.id} style={{ background: '#0D1B2A', color: '#FFF' }}>
                📍 {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Suggested questions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ color: '#94A3B8', fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px' }}>
            QUESTIONS SUGGÉRÉES
          </label>
          {SUGGESTED.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSend(s.label)}
              style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '8px', color: '#CBD5E1', padding: '8px 10px', fontSize: '12px',
                textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
            >
              <span>{s.icon}</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Clear chat */}
        <button
          onClick={clearChat}
          style={{
            marginTop: 'auto', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            color: '#F87171', borderRadius: '8px', padding: '8px 12px', fontSize: '12px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
          }}
        >
          <RefreshCw size={12} /> Réinitialiser le Chat
        </button>
      </aside>

      {/* ── CHAT MAIN PANEL ────────────────────────────────────── */}
      <main style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map((m, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '12px', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {m.role === 'assistant' && (
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, marginTop: '2px',
                }}>
                  <Bot size={18} color="#FFF" />
                </div>
              )}
              <div style={{
                maxWidth: '75%',
                padding: '14px 18px',
                borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: m.role === 'user' ? 'linear-gradient(135deg,#4F46E5,#6366F1)' : 'rgba(255,255,255,0.06)',
                border: m.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                color: '#F8FAFC',
                fontSize: '14px',
                lineHeight: '1.6',
                boxShadow: m.role === 'user' ? '0 4px 12px rgba(79,70,229,0.3)' : 'none',
              }}>
                <div dangerouslySetInnerHTML={{ __html: renderMd(m.content) }} />
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={18} color="#FFF" />
              </div>
              <div style={{ padding: '12px 18px', borderRadius: '18px', background: 'rgba(255,255,255,0.06)', color: '#94A3B8', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} style={{ animation: 'spin 2s linear infinite' }} /> Analyse en temps réel des données & plages...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input box */}
        <div style={{ padding: '16px 32px 24px 32px', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <form onSubmit={e => { e.preventDefault(); handleSend(); }} style={{ display: 'flex', gap: '12px' }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={`Posez une question sur ${selectedCity.name} (ex: plages de Sousse, baignade, trafic, air...)`}
              style={{
                flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '14px', padding: '14px 20px', color: '#FFF', fontSize: '14px',
                outline: 'none', transition: 'all 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#6366F1'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', border: 'none',
                borderRadius: '14px', padding: '0 24px', color: '#FFF', cursor: 'pointer',
                opacity: loading || !input.trim() ? 0.5 : 1, transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ChatBot;
