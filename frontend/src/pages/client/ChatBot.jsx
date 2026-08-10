import React from 'react';
import ChatInterface from '../../components/chat/ChatInterface';

const ChatBot = () => {
  return (
    <div style={{
      padding: '20px',
      maxWidth: '1400px',
      margin: '0 auto',
      height: 'calc(100vh - 40px)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{
          fontSize: '1.6rem',
          fontWeight: '800',
          color: 'var(--text-color, #FFFFFF)',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          🧠 PulseBrain — Assistant IA Expert
        </h1>
        <p style={{
          fontSize: '0.88rem',
          color: 'var(--text-muted, #94A3B8)',
          margin: '4px 0 0 0',
        }}>
          Posez vos questions sur la métrologie temps réel, les transports, la santé, l'économie, les magasins et les démarches administratives.
        </p>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        <ChatInterface assistantType="pulse_brain" isModal={false} />
      </div>
    </div>
  );
};

export default ChatBot;
