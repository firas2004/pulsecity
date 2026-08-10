import React, { useState } from 'react';
import { Bot, X } from 'lucide-react';
import ChatInterface from './ChatInterface';

const ChatBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) setHasUnread(false);
  };

  return (
    <>
      <style>{`
        @keyframes floatPulse {
          0% { box-shadow: 0 4px 20px rgba(0, 137, 123, 0.4); transform: scale(1); }
          50% { box-shadow: 0 6px 28px rgba(0, 137, 123, 0.75); transform: scale(1.06); }
          100% { box-shadow: 0 4px 20px rgba(0, 137, 123, 0.4); transform: scale(1); }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(18px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* Floating Chat Modal (Pulse Guide - Clean Full Width) */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '88px',
          right: '20px',
          width: 'min(500px, calc(100vw - 24px))',
          height: 'min(620px, calc(100vh - 100px))',
          zIndex: 9999,
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.65)',
          animation: 'slideInUp 0.22s ease-out forwards',
        }}>
          <ChatInterface
            assistantType="pulse_guide"
            onClose={() => setIsOpen(false)}
            isModal={true}
            hideSidebar={true}
          />
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <button
        onClick={toggleOpen}
        title="Discuter avec Pulse Guide"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#00897B',
          color: '#ffffff',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          animation: isOpen ? 'none' : 'floatPulse 4s infinite ease-in-out',
          transition: 'all 0.22s ease',
          boxShadow: '0 4px 20px rgba(0, 137, 123, 0.5)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#00796B';
          e.currentTarget.style.transform = 'scale(1.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#00897B';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {isOpen ? <X size={26} /> : <Bot size={26} />}

        {!isOpen && hasUnread && (
          <span style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            width: '14px',
            height: '14px',
            backgroundColor: '#EF4444',
            borderRadius: '50%',
            border: '2px solid #ffffff',
          }} />
        )}
      </button>
    </>
  );
};

export default ChatBubble;
