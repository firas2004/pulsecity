import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const API = '/api/eco-pulse';

// ── Count-up animation ────────────────────────────────────────────────────────
function CountUp({ end = 0, decimals = 1, duration = 1000, suffix = '' }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const abs = Math.abs(Number(end) || 0);
    const step = abs / (duration / 16);
    let cur = 0;
    const t = setInterval(() => {
      cur += step;
      if (cur >= abs) { setVal(end); clearInterval(t); }
      else setVal(end < 0 ? -cur : cur);
    }, 16);
    return () => clearInterval(t);
  }, [end, duration]);
  return <span>{Number(val).toFixed(decimals)}{suffix}</span>;
}

// ── Trend helper ──────────────────────────────────────────────────────────────
const trendIcon  = (t) => t === 'up' ? '🔼' : t === 'down' ? '🔽' : '➡️';
const trendColor = (t) => t === 'up' ? 'var(--danger)' : t === 'down' ? 'var(--success)' : 'var(--text-muted)';

// ── Shared card wrapper ───────────────────────────────────────────────────────
function Card({ children, accentColor = 'var(--primary)', style = {} }) {
  return (
    <div style={{
      background: 'var(--card-bg)',
      border: `1px solid ${accentColor}30`,
      borderRadius: 20,
      padding: '22px 24px',
      boxShadow: `0 4px 24px ${accentColor}18`,
      ...style,
    }}>
      {children}
    </div>
  );
}

function CardHeader({ emoji, title, sub }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
      <span style={{ fontSize: 24 }}>{emoji}</span>
      <div>
        <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)' }}>{title}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</div>
      </div>
    </div>
  );
}

function Skeleton({ h = 200 }) {
  return (
    <div style={{ background: 'var(--card-bg)', borderRadius: 20, height: h, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'var(--text-muted)', fontSize: 14, animation: 'pulse 1.5s infinite' }}>⏳ Chargement…</div>
    </div>
  );
}

// ── CUSTOM TOOLTIP ────────────────────────────────────────────────────────────
function DarkTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;
  const [v, name] = formatter ? formatter(payload[0].value) : [payload[0].value, payload[0].name];
  return (
    <div style={{ background: 'var(--surface-3)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: 'var(--text-main)' }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
      <strong>{v}</strong> <span style={{ color: 'var(--text-muted)' }}>{name}</span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// WIDGET CHANGE (Cours du Dinar)
// ══════════════════════════════════════════════════════════════════════════════
function ExchangeWidget({ data }) {
  const [amount, setAmount] = useState('100');
  const [fromC, setFromC]   = useState('TND');
  const [toC, setToC]       = useState('EUR');
  const [result, setResult] = useState(null);
  const [busy, setBusy]     = useState(false);

  if (!data?.rates) return <Skeleton />;
  const { rates, variation_24h = {}, history_eur = [], last_updated } = data;
  const currencies = ['TND', ...Object.keys(rates)];

  const convert = async () => {
    setBusy(true);
    try {
      const r = await fetch(`${API}/currency-converter?amount=${amount}&from=${fromC}&to=${toC}`);
      setResult(await r.json());
    } catch { } finally { setBusy(false); }
  };

  const inputStyle = {
    background: 'var(--surface-2)', border: '1px solid var(--border-color)',
    color: 'var(--text-main)', borderRadius: 8, padding: '6px 10px', fontSize: 13,
  };

  return (
    <Card accentColor="#1565C0">
      <CardHeader emoji="💱" title="Cours du Dinar TND" sub={`Source : BCT • ${last_updated?.slice(0, 10) || ''}`} />

      {/* Principales devises */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        {['EUR', 'USD'].map(code => {
          const r = rates[code] || {}; const v = variation_24h[code] || {};
          return (
            <div key={code} style={{ flex: 1, background: 'var(--surface-2)', borderRadius: 14, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                {r.flag} 1 {code} =
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-main)' }}>
                {(r.mid || 0).toFixed(3)} <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}>TND</span>
              </div>
              <div style={{ fontSize: 11, color: trendColor(v.trend), fontWeight: 700, marginTop: 4 }}>
                {trendIcon(v.trend)} {v.percent >= 0 ? '+' : ''}{(v.percent || 0).toFixed(2)}%
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                Achat: {(r.buy || 0).toFixed(3)} · Vente: {(r.sell || 0).toFixed(3)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sparkline EUR/TND */}
      {history_eur.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>EUR/TND — 7 derniers jours</div>
          <ResponsiveContainer width="100%" height={60}>
            <AreaChart data={history_eur}>
              <defs>
                <linearGradient id="eurG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="mid" stroke="#3B82F6" fill="url(#eurG)" strokeWidth={2} dot={false} />
              <Tooltip content={<DarkTooltip formatter={v => [`${v.toFixed(4)} TND`, 'EUR/TND']} />} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tableau toutes devises */}
      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 6 }}>Toutes les devises</div>
      <div style={{ maxHeight: 180, overflowY: 'auto' }}>
        {Object.entries(rates).map(([code, r]) => {
          const v = variation_24h[code];
          return (
            <div key={code} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: 13, color: 'var(--text-soft)' }}>{r.flag} {code} <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{r.name}</span></span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>{(r.mid || 0).toFixed(3)}</span>
              {v && <span style={{ fontSize: 10, color: trendColor(v.trend), fontWeight: 600, minWidth: 48, textAlign: 'right' }}>
                {trendIcon(v.trend)} {v.percent >= 0 ? '+' : ''}{(v.percent || 0).toFixed(2)}%
              </span>}
            </div>
          );
        })}
      </div>

      {/* Convertisseur */}
      <div style={{ marginTop: 16, background: 'var(--surface-2)', borderRadius: 14, padding: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', marginBottom: 10 }}>💰 Convertisseur rapide</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input value={amount} onChange={e => setAmount(e.target.value)} type="number" min="0"
            style={{ ...inputStyle, width: 80, fontWeight: 700 }} />
          <select value={fromC} onChange={e => setFromC(e.target.value)} style={inputStyle}>
            {currencies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <span style={{ color: 'var(--text-muted)' }}>→</span>
          <select value={toC} onChange={e => setToC(e.target.value)} style={inputStyle}>
            {currencies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={convert} disabled={busy} style={{
            padding: '6px 16px', background: 'var(--primary)', color: 'white',
            border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}>{busy ? '…' : 'Convertir'}</button>
        </div>
        {result && !result.error && (
          <div style={{ marginTop: 10, fontSize: 15, fontWeight: 800, color: 'var(--text-main)' }}>
            {(result.amount || 0).toFixed(2)} {result.from} ={' '}
            <span style={{ color: 'var(--success)' }}>{(result.result || 0).toFixed(4)}</span>{' '}
            {result.to}
            <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 8 }}>taux: {(result.rate || 0).toFixed(6)}</span>
          </div>
        )}
      </div>
    </Card>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// WIDGET CARBURANTS
// ══════════════════════════════════════════════════════════════════════════════
function FuelWidget({ data }) {
  const navigate = useNavigate();
  const [distance, setDistance]   = useState('100');
  const [fuelType, setFuelType]   = useState('essence_super');
  const [conso, setConso]         = useState('7.5');
  const [calc, setCalc]           = useState(null);

  if (!data?.products) return <Skeleton />;
  const { products, next_review_date, subsidies } = data;

  const calculate = async () => {
    try {
      const r = await fetch(`${API}/fuel-calculator?distance_km=${distance}&fuel_type=${fuelType}&consumption_l_per_100km=${conso}`);
      setCalc(await r.json());
    } catch { }
  };

  const inputStyle = {
    background: 'var(--surface-2)', border: '1px solid var(--border-color)',
    color: 'var(--text-main)', borderRadius: 8, padding: '6px 10px', fontSize: 13,
  };

  return (
    <Card accentColor="#FF6F00">
      <CardHeader emoji="⛽" title="Prix des Carburants" sub={`Ministère de l'Énergie · Révision : ${next_review_date || '—'}`} />

      {products.map(p => (
        <div key={p.id} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--surface-2)', borderRadius: 12, padding: '12px 14px', marginBottom: 8,
          borderLeft: `3px solid ${p.trend === 'stable' ? 'var(--text-muted)' : p.trend === 'up' ? 'var(--danger)' : 'var(--success)'}`,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>{p.emoji} {p.name}</div>
            {p.subvention_tnd > 0 && (
              <div style={{ fontSize: 10, color: 'var(--success)' }}>💚 Subvention ~{p.subvention_tnd.toFixed(2)} TND/L</div>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#FF6F00' }}>{(p.price_tnd || 0).toFixed(3)}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>TND/L</div>
          </div>
          <div style={{ marginLeft: 12, fontSize: 12, color: trendColor(p.trend), fontWeight: 700, minWidth: 32 }}>
            {trendIcon(p.trend)}
          </div>
        </div>
      ))}

      {subsidies && (
        <div style={{ background: 'var(--surface-2)', borderRadius: 12, padding: '10px 14px', marginBottom: 14, borderLeft: '3px solid var(--success)' }}>
          <div style={{ fontSize: 12, color: 'var(--success)', fontWeight: 700, marginBottom: 2 }}>
            🏛️ Subventions étatiques ({subsidies.total_billion_tnd_year} Mds TND/an)
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{subsidies.note}</div>
        </div>
      )}

      {/* Calculateur trajet */}
      <div style={{ background: 'var(--surface-2)', borderRadius: 14, padding: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#FF6F00', marginBottom: 10 }}>🧮 Calculateur de trajet</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>Distance (km)</div>
            <input value={distance} onChange={e => setDistance(e.target.value)} type="number" min="1"
              style={{ ...inputStyle, width: 80, fontWeight: 700 }} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>Carburant</div>
            <select value={fuelType} onChange={e => setFuelType(e.target.value)} style={{ ...inputStyle, fontSize: 11 }}>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>Conso (L/100)</div>
            <input value={conso} onChange={e => setConso(e.target.value)} type="number" step="0.5"
              style={{ ...inputStyle, width: 70, fontWeight: 700 }} />
          </div>
        </div>
        <button onClick={calculate} style={{
          width: '100%', padding: '9px', background: '#FF6F00', color: 'white',
          border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
        }}>⚡ Calculer</button>

        {calc && !calc.error && (
          <div style={{ marginTop: 12, background: 'var(--surface-3)', borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Carburant nécessaire</span>
              <strong style={{ color: 'var(--text-main)' }}>{calc.fuel_needed_litres} L</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Coût total</span>
              <strong style={{ color: '#FF6F00', fontSize: 18 }}>{(calc.cost_tnd || 0).toFixed(3)} TND</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Coût / km</span>
              <span style={{ fontSize: 12, color: 'var(--text-soft)' }}>{(calc.cost_per_km_tnd || 0).toFixed(4)} TND</span>
            </div>
            <button onClick={() => navigate('/client/trip-simulator')} style={{
              marginTop: 10, width: '100%', padding: '7px',
              background: 'var(--surface)', border: '1px solid var(--border-color)',
              color: 'var(--text-soft)', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer',
            }}>🗺️ Planifier ce trajet dans le simulateur</button>
          </div>
        )}
      </div>
    </Card>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// WIDGET INFLATION
// ══════════════════════════════════════════════════════════════════════════════
function InflationWidget({ data }) {
  const [view, setView] = useState('monthly');
  if (!data) return <Skeleton />;
  const { current_ipc = 0, inflation_yoy = 0, inflation_mom = 0, current_ipc_date = '',
    categories = [], history_monthly = [], history_annual = [] } = data;
  const topCat = [...categories].sort((a, b) => b.inflation_yoy - a.inflation_yoy)[0] || {};

  return (
    <Card accentColor="#6A1B9A">
      <CardHeader emoji="📈" title="Inflation & IPC" sub={`INS · ${current_ipc_date} (base 2015 = 100)`} />

      {/* KPIs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'Inflation annuelle', value: inflation_yoy, suffix: '%', decimals: 1 },
          { label: 'IPC actuel', value: current_ipc, suffix: '', decimals: 1 },
        ].map(k => (
          <div key={k.label} style={{ flex: 1, background: 'var(--surface-2)', borderRadius: 14, padding: '14px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#A855F7' }}>
              <CountUp end={k.value} decimals={k.decimals} suffix={k.suffix} />
            </div>
          </div>
        ))}
      </div>

      {topCat.name && (
        <div style={{ background: 'var(--surface-2)', borderLeft: '3px solid var(--danger)', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 700 }}>
            ⚠️ Plus fort : {topCat.name} — +{topCat.inflation_yoy}%/an
          </div>
        </div>
      )}

      {/* Onglets */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
        {[['monthly', '12 mois'], ['annual', 'Annuel'], ['categories', 'Catégories']].map(([k, l]) => (
          <button key={k} onClick={() => setView(k)} style={{
            flex: 1, padding: '7px', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
            background: view === k ? '#6A1B9A' : 'var(--surface-2)',
            color: view === k ? 'white' : 'var(--text-muted)',
            transition: 'all 0.2s',
          }}>{l}</button>
        ))}
      </div>

      {view === 'monthly' && (
        <ResponsiveContainer width="100%" height={150}>
          <AreaChart data={history_monthly}>
            <defs>
              <linearGradient id="inflG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A855F7" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#A855F7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} tickFormatter={d => d.slice(2)} />
            <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} width={28} domain={['auto', 'auto']} />
            <Tooltip content={<DarkTooltip formatter={v => [`${v}%`, 'Inflation']} />} />
            <Area type="monotone" dataKey="inflation_yoy" stroke="#A855F7" fill="url(#inflG)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      )}

      {view === 'annual' && (
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={history_annual}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis dataKey="year" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} />
            <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} width={28} />
            <Tooltip content={<DarkTooltip formatter={v => [`${v}%`, 'Inflation']} />} />
            <Bar dataKey="inflation" radius={[4, 4, 0, 0]}>
              {history_annual.map((e, i) => (
                <Cell key={i} fill={e.inflation > 8 ? '#EF4444' : e.inflation > 6 ? '#F59E0B' : '#A855F7'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {view === 'categories' && (
        <div style={{ maxHeight: 210, overflowY: 'auto' }}>
          {[...categories].sort((a, b) => b.inflation_yoy - a.inflation_yoy).map(cat => (
            <div key={cat.name} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                <span style={{ color: 'var(--text-soft)' }}>{cat.name}</span>
                <span style={{ fontWeight: 700, color: cat.inflation_yoy > 7 ? 'var(--danger)' : cat.inflation_yoy > 4 ? 'var(--warning)' : 'var(--success)' }}>
                  +{cat.inflation_yoy}%
                </span>
              </div>
              <div style={{ height: 6, background: 'var(--surface-3)', borderRadius: 3 }}>
                <div style={{ height: '100%', borderRadius: 3, width: `${Math.min(cat.inflation_yoy / 10 * 100, 100)}%`, background: cat.color || '#A855F7', transition: 'width 0.6s ease' }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// WIDGET MACRO
// ══════════════════════════════════════════════════════════════════════════════
function MacroWidget({ data }) {
  if (!data?.length) return <Skeleton />;
  return (
    <Card accentColor="var(--success)">
      <CardHeader emoji="📊" title="Indicateurs Macroéconomiques" sub="BCT · INS · Ministère des Finances · 2026" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {data.map(ind => (
          <div key={ind.id} style={{ background: 'var(--surface-2)', borderRadius: 12, padding: '12px 14px', borderLeft: `3px solid ${ind.color || 'var(--primary)'}` }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>{ind.emoji}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>{ind.name}</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-main)' }}>
              <CountUp end={Math.abs(Number(ind.value) || 0)} decimals={1} />{' '}
              <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)' }}>{ind.unit}</span>
            </div>
            {ind.change != null && (
              <div style={{ fontSize: 10, color: trendColor(ind.trend), fontWeight: 600, marginTop: 2 }}>
                {trendIcon(ind.trend)} {ind.change > 0 ? '+' : ''}{ind.change}{ind.change_unit ? ' ' + ind.change_unit : ''}
              </div>
            )}
            <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>{ind.source}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// WIDGET PRIX MARCHÉ
// ══════════════════════════════════════════════════════════════════════════════
function PriceWidget({ data }) {
  const [cat, setCat] = useState('all');
  if (!data) return <Skeleton />;
  const CATS = ['all', 'alimentation', 'energie', 'transport', 'restauration'];
  const CAT_LABELS = { all: '🌐 Tout', alimentation: '🍽️ Alim.', energie: '⚡ Énergie', transport: '🚗 Transport', restauration: '☕ Resto' };
  const TREND_ICONS = { up: '🔼', down: '🔽', stable: '➡️', seasonal: '🌡️' };
  const TREND_COLORS = { up: 'var(--danger)', down: 'var(--success)', stable: 'var(--text-muted)', seasonal: 'var(--warning)' };
  const filtered = cat === 'all' ? data : data.filter(p => p.category === cat);

  return (
    <Card accentColor="var(--warning)">
      <CardHeader emoji="🛒" title="Comparateur de Prix" sub="Prix officiels vs marché · Août 2026" />

      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {CATS.map(c => (
          <button key={c} onClick={() => setCat(c)} style={{
            padding: '5px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, transition: 'all 0.2s',
            background: cat === c ? 'var(--warning)' : 'var(--surface-2)',
            color: cat === c ? '#000' : 'var(--text-muted)',
          }}>{CAT_LABELS[c]}</button>
        ))}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 400 }}>
          <thead>
            <tr style={{ background: 'var(--surface-2)' }}>
              {['Produit', 'Officiel', 'Marché moy.', 'Fourchette', 'Tendance'].map(h => (
                <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '9px 10px', fontSize: 13, color: 'var(--text-main)' }}>
                  {p.emoji} {p.name}
                  <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>/{p.unit}</div>
                </td>
                <td style={{ padding: '9px 10px', fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>
                  {p.official_price != null ? `${p.official_price.toFixed(3)} TND` : '—'}
                </td>
                <td style={{ padding: '9px 10px', fontSize: 13, fontWeight: 700, color: 'var(--warning)' }}>
                  {(p.avg || 0).toFixed(3)} TND
                </td>
                <td style={{ padding: '9px 10px', fontSize: 11, color: 'var(--text-muted)' }}>
                  {(p.market_min || 0).toFixed(2)} – {(p.market_max || 0).toFixed(2)}
                </td>
                <td style={{ padding: '9px 10px' }}>
                  <span style={{ color: TREND_COLORS[p.trend] || 'var(--text-muted)', fontSize: 14 }} title={p.season_note || ''}>
                    {TREND_ICONS[p.trend] || '—'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 10 }}>
        ⚠️ Prix indicatifs, variables selon régions et commerçants.
      </div>
    </Card>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ══════════════════════════════════════════════════════════════════════════════
export default function EcoPulse() {
  const [exchangeData, setExchangeData]     = useState(null);
  const [fuelData, setFuelData]             = useState(null);
  const [inflationData, setInflationData]   = useState(null);
  const [macroData, setMacroData]           = useState(null);
  const [priceData, setPriceData]           = useState(null);
  const [summary, setSummary]               = useState(null);
  const [error, setError]                   = useState(null);
  const [loading, setLoading]               = useState(true);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [exch, fuel, infl, macro, price, summ] = await Promise.all([
        fetch(`${API}/exchange-rates`).then(r => r.ok ? r.json() : Promise.reject(r.status)),
        fetch(`${API}/fuel-prices`).then(r => r.ok ? r.json() : Promise.reject(r.status)),
        fetch(`${API}/inflation`).then(r => r.ok ? r.json() : Promise.reject(r.status)),
        fetch(`${API}/macro-indicators`).then(r => r.ok ? r.json() : Promise.reject(r.status)),
        fetch(`${API}/price-comparison`).then(r => r.ok ? r.json() : Promise.reject(r.status)),
        fetch(`${API}/summary`).then(r => r.ok ? r.json() : Promise.reject(r.status)),
      ]);
      setExchangeData(exch);
      setFuelData(fuel);
      setInflationData(infl);
      setMacroData(macro.indicators || []);
      setPriceData(price.products || []);
      setSummary(summ);
    } catch (e) {
      setError(`Impossible de joindre l'API Éco Pulse (${e}). Vérifiez que le backend est démarré.`);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)', fontFamily: 'var(--font-body)' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1B3A1F 0%, #1B5E20 100%)',
        padding: '24px 28px',
        borderBottom: '1px solid var(--border-color)',
        boxShadow: '0 4px 24px rgba(27,94,32,0.3)',
      }}>
        <div style={{ maxWidth: 1300, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: summary ? 20 : 0 }}>
            <div style={{
              width: 52, height: 52, background: 'rgba(255,255,255,0.1)', borderRadius: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
              border: '1px solid rgba(255,255,255,0.15)',
            }}>📊</div>
            <div style={{ flex: 1 }}>
              <h1 style={{ color: '#ECFDF5', fontSize: 22, fontWeight: 800, margin: 0 }}>Éco Pulse</h1>
              <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: 12 }}>
                Dinar TND · Carburants · Inflation · Indicateurs BCT/INS
              </p>
            </div>
            <button onClick={load} disabled={loading} style={{
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              color: 'white', borderRadius: 12, padding: '8px 18px', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.2s',
            }}>🔄 {loading ? 'Chargement…' : 'Actualiser'}</button>
          </div>

          {/* KPI bar */}
          {summary && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[
                { label: 'EUR/TND', val: `${summary.exchange_summary?.eur_mid} TND`, icon: '🇪🇺' },
                { label: 'USD/TND', val: `${summary.exchange_summary?.usd_mid} TND`, icon: '🇺🇸' },
                { label: 'Essence Super', val: `${summary.fuel_summary?.essence_super} TND/L`, icon: '⛽' },
                { label: 'Inflation', val: `${summary.inflation_summary?.current}%`, icon: '📈' },
                { label: 'Croissance PIB', val: `+${summary.macro_summary?.gdp_growth}%`, icon: '📊' },
                { label: 'Taux BCT', val: `${summary.macro_summary?.bct_rate}%`, icon: '🏦' },
              ].map(k => (
                <div key={k.label} style={{
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 12, padding: '8px 16px',
                }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>{k.icon} {k.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'white' }}>{k.val}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '24px 28px' }}>
        {error && (
          <div style={{
            background: 'var(--surface-2)', border: '1px solid var(--danger)',
            borderRadius: 14, padding: '14px 20px', marginBottom: 20,
            fontSize: 13, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 10,
          }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(460px, 1fr))', gap: 20 }}>
          <ExchangeWidget data={exchangeData} />
          <FuelWidget data={fuelData} />
          <InflationWidget data={inflationData} />
          <MacroWidget data={macroData} />
        </div>

        <div style={{ marginTop: 20 }}>
          <PriceWidget data={priceData} />
        </div>
      </div>
    </div>
  );
}
