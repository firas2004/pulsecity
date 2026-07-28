import React from 'react';
import { Trophy, Award, Star, TrendingUp, ShieldCheck } from 'lucide-react';

const RANKED_CITIES = [
  { rank: 1, name: 'La Marsa', score: 94, air: 'Excellente', traffic: 'Fluide', badge: '🥇 1er - Qualité de Vie' },
  { rank: 2, name: 'Monastir', score: 91, air: 'Très Bonne', traffic: 'Fluide', badge: '🥈 2ème - Eco-Leader' },
  { rank: 3, name: 'Bizerte', score: 88, air: 'Bonne', traffic: 'Modéré', badge: '🥉 3ème - Port Vert' },
  { rank: 4, name: 'Sousse', score: 85, air: 'Bonne', traffic: 'Modéré', badge: 'Top 5' },
  { rank: 5, name: 'Ariana', score: 82, air: 'Bonne', traffic: 'Modéré', badge: 'Top 5' },
  { rank: 6, name: 'Mahdia', score: 81, air: 'Très Bonne', traffic: 'Fluide', badge: 'Côte Calme' },
  { rank: 7, name: 'Nabeul', score: 79, air: 'Bonne', traffic: 'Fluide', badge: 'Zone Verte' },
  { rank: 8, name: 'Tunis Centre', score: 74, air: 'Moyenne', traffic: 'Dense', badge: 'Hub Capitale' },
  { rank: 9, name: 'Sfax', score: 70, air: 'Modérée', traffic: 'Très Dense', badge: 'Pôle Industriel' },
];

const CityRanking = () => {
  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(234,179,8,0.12))',
        border: '1px solid rgba(245,158,11,0.3)',
        borderRadius: '20px',
        padding: '24px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg,#F59E0B,#EAB308)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trophy size={26} color="#FFF" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>
              Classement & Indice de Livabilité Urbaine 🏆
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--text-muted)' }}>
              Score composite (0-100) calculé à partir de la qualité de l'air, du trafic, du bruit, de l'énergie et des services municipaux.
            </p>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '12px' }}>Rang</th>
              <th style={{ padding: '12px' }}>Ville</th>
              <th style={{ padding: '12px' }}>Score de Livabilité</th>
              <th style={{ padding: '12px' }}>Qualité Air</th>
              <th style={{ padding: '12px' }}>Trafic</th>
              <th style={{ padding: '12px' }}>Distinction</th>
            </tr>
          </thead>
          <tbody>
            {RANKED_CITIES.map((c) => (
              <tr key={c.rank} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '14px 12px', fontWeight: '800', fontSize: '16px', color: c.rank === 1 ? '#F59E0B' : c.rank === 2 ? '#94A3B8' : c.rank === 3 ? '#B45309' : 'var(--text-muted)' }}>
                  #{c.rank}
                </td>
                <td style={{ padding: '14px 12px', fontWeight: '700', fontSize: '15px', color: 'var(--text-main)' }}>
                  {c.name}
                </td>
                <td style={{ padding: '14px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, maxWidth: '100px', height: '8px', borderRadius: '4px', background: 'var(--surface-2)', overflow: 'hidden' }}>
                      <div style={{ width: `${c.score}%`, height: '100%', background: 'linear-gradient(90deg,#10B981,#3B82F6)', borderRadius: '4px' }} />
                    </div>
                    <span style={{ fontWeight: '800', color: '#10B981', fontSize: '14px' }}>{c.score}/100</span>
                  </div>
                </td>
                <td style={{ padding: '14px 12px', color: 'var(--text-muted)' }}>{c.air}</td>
                <td style={{ padding: '14px 12px', color: 'var(--text-muted)' }}>{c.traffic}</td>
                <td style={{ padding: '14px 12px' }}>
                  <span style={{ background: 'var(--surface-2)', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>
                    {c.badge}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CityRanking;
