import React, { useState } from 'react';

const FAQS = [
  {
    q: 'Quelles villes sont couvertes par Pulse City ?',
    a: 'Pulse City surveille 18 villes tunisiennes : Tunis Centre, Ariana, La Marsa, Ben Arous, Sousse, Sfax, Monastir, Mahdia, Nabeul, Bizerte, Béja, Jendouba, Gafsa, Tozeur, Médenine, Kasserine, Le Kef et Siliana.'
  },
  {
    q: 'Les données métrologiques sont-elles en temps réel ?',
    a: 'Oui. Les capteurs IoT transmettent leurs mesures toutes les 5 secondes via WebSocket. Les données de trafic, dioxyde de carbone (CO₂), niveau sonore (dB), énergie et météo marine sont actualisées en direct.'
  },
  {
    q: 'L\'application est-elle entièrement gratuite pour les citoyens ?',
    a: 'Oui ! L\'accès au portail citoyen, aux cartes interactives (Santé, Administrations, POIs, Magasins), au simulateur de trajet et aux alertes est 100% gratuit.'
  },
  {
    q: 'Comment puis-je signaler un problème dans ma commune ?',
    a: 'Connectez-vous à votre espace citoyen, accédez à la section "Signalements", décrivez le problème (poubelle débordante, panne d\'éclairage, nid de poule), géolocalisez-le et validez. Les équipes municipales reçoivent l\'alerte en direct.'
  },
  {
    q: 'D\'où proviennent les données économiques et des transports ?',
    a: 'Les taux du Dinar proviennent de la Banque Centrale de Tunisie (BCT), l\'inflation de l\'Institut National de la Statistique (INS), les tarifs des transports de la TRANSTU / SNCFT, et les carburants du Ministère de l\'Énergie.'
  },
  {
    q: 'Comment utiliser l\'assistant IA Pulse Brain ou Pulse Guide ?',
    a: 'Vous pouvez cliquer sur la bulle flottante 💬 en bas à droite sur n\'importe quelle page pour solliciter Pulse Guide, ou accéder à la section dédiée 🧠 Assistant IA pour des requêtes avancées sur votre ville.'
  },
];

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section style={{ padding: '88px 24px', background: '#12121A', borderTop: '1px solid rgba(255, 255, 255, 0.08)', position: 'relative', zIndex: 5 }}>
      <div style={{ maxWidth: '820px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '11px', textTransform: 'uppercase', color: '#0066FF', letterSpacing: '0.1em' }}>
            • FOIRE AUX QUESTIONS
          </span>
          <h2 style={{ fontFamily: 'var(--font-primary, sans-serif)', fontWeight: 800, fontSize: 'clamp(28px, 4vw, 40px)', color: '#FFFFFF', marginTop: '12px', letterSpacing: '-0.02em' }}>
            Questions fréquentes
          </h2>
        </div>

        {FAQS.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              style={{
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '22px 0',
                  background: 'transparent',
                  border: 'none',
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-primary, sans-serif)',
                  fontWeight: '700',
                  fontSize: '16px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <span>{faq.q}</span>
                <span style={{
                  color: '#0066FF',
                  fontSize: '20px',
                  transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                  transition: 'transform 200ms ease',
                  marginLeft: '16px',
                }}>
                  +
                </span>
              </button>

              {isOpen && (
                <div style={{ paddingBottom: '22px' }}>
                  <p style={{
                    fontFamily: 'var(--font-primary, sans-serif)',
                    fontSize: '14px',
                    color: '#C8C8D8',
                    lineHeight: '1.65',
                    margin: 0,
                  }}>
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
