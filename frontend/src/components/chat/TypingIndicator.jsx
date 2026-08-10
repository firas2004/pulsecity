import React from 'react';

const TypingIndicator = ({ color = '#1565C0' }) => {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      padding: '10px 16px',
      borderRadius: '16px',
      backgroundColor: 'var(--surface-border, rgba(255,255,255,0.06))',
      border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
      width: 'fit-content',
    }}>
      <style>{`
        @keyframes bouncePulse {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
      <div style={{
        width: '7px',
        height: '7px',
        borderRadius: '50%',
        backgroundColor: color,
        animation: 'bouncePulse 1.4s infinite ease-in-out 0s',
      }} />
      <div style={{
        width: '7px',
        height: '7px',
        borderRadius: '50%',
        backgroundColor: color,
        animation: 'bouncePulse 1.4s infinite ease-in-out 0.2s',
      }} />
      <div style={{
        width: '7px',
        height: '7px',
        borderRadius: '50%',
        backgroundColor: color,
        animation: 'bouncePulse 1.4s infinite ease-in-out 0.4s',
      }} />
    </div>
  );
};

export default TypingIndicator;
