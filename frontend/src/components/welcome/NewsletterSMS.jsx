import React, { useState } from 'react';

export default function NewsletterSMS() {
  const [contact, setContact] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (contact.trim().length >= 5) {
      setSubscribed(true);
    }
  };

  return (
    <section style={{ padding: '64px 24px', background: '#0A0A0F', borderTop: '1px solid rgba(255, 255, 255, 0.08)', position: 'relative', zIndex: 5 }}>
      <div style={{ maxWidth: '620px', margin: '0 auto', textAlign: 'center' }}>
        <span style={{ fontSize: '32px' }}>📬</span>
        <h3 style={{ fontFamily: 'var(--font-primary, sans-serif)', fontWeight: 800, fontSize: '26px', color: '#FFFFFF', marginTop: '16px', letterSpacing: '-0.02em' }}>
          Restez informé en temps réel
        </h3>
        <p style={{ fontFamily: 'var(--font-primary, sans-serif)', fontSize: '15px', color: '#C8C8D8', marginTop: '8px', lineHeight: '1.5' }}>
          Recevez les alertes de trafic critique, météo marine et perturbations par SMS ou Email. Service gratuit.
        </p>

        {!subscribed ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Ex: +216 22 123 456 ou email@domaine.tn"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              style={{
                background: '#12121A',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '2px',
                padding: '12px 18px',
                color: '#FFFFFF',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '14px',
                minWidth: '260px',
                outline: 'none',
                flex: 1,
              }}
            />
            <button
              type="submit"
              disabled={!contact.trim()}
              style={{
                background: '#0066FF',
                color: '#FFFFFF',
                fontFamily: 'var(--font-primary, sans-serif)',
                fontWeight: '700',
                fontSize: '13px',
                textTransform: 'uppercase',
                padding: '12px 24px',
                borderRadius: '2px',
                border: 'none',
                cursor: contact.trim() ? 'pointer' : 'not-allowed',
                opacity: contact.trim() ? 1 : 0.6,
                transition: 'background 200ms ease',
              }}
            >
              S'inscrire aux alertes →
            </button>
          </form>
        ) : (
          <div style={{
            marginTop: '24px',
            padding: '16px 24px',
            background: 'rgba(127, 213, 121, 0.12)',
            border: '1px solid rgba(127, 213, 121, 0.4)',
            borderRadius: '2px',
            color: '#7FD579',
            fontFamily: 'var(--font-primary, sans-serif)',
            fontSize: '14px',
            fontWeight: '600',
          }}>
            ✅ Inscription confirmée ! Vous recevrez les prochaines alertes en direct.
          </div>
        )}

        <p style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '11px', color: '#8BB5FF', marginTop: '16px' }}>
          🔒 Vos coordonnées restent strictement confidentielles. Désinscription en 1 clic.
        </p>
      </div>
    </section>
  );
}
