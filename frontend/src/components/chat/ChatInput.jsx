import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip } from 'lucide-react';

const ChatInput = ({ onSendMessage, disabled = false, placeholder = "Écrivez votre message..." }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!text.trim() || disabled) return;
    onSendMessage(text.trim());
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{
      display: 'flex',
      alignItems: 'flex-end',
      gap: '8px',
      padding: '10px 14px',
      backgroundColor: 'var(--surface-color, #121824)',
      borderTop: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
      borderRadius: '0 0 16px 16px',
    }}>
      <textarea
        ref={textareaRef}
        rows={1}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          flex: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '12px',
          padding: '10px 14px',
          color: '#ffffff',
          fontSize: '0.9rem',
          outline: 'none',
          resize: 'none',
          maxHeight: '120px',
          fontFamily: 'inherit',
          lineHeight: '1.4',
        }}
      />
      <button
        type="submit"
        disabled={!text.trim() || disabled}
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          backgroundColor: text.trim() && !disabled ? '#2563EB' : 'rgba(255,255,255,0.1)',
          color: '#ffffff',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: text.trim() && !disabled ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s ease',
          flexShrink: 0,
        }}
      >
        <Send size={18} />
      </button>
    </form>
  );
};

export default ChatInput;
