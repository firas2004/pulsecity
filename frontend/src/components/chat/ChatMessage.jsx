import React from 'react';
import { Bot, User, Brain } from 'lucide-react';
import SuggestedActions from './SuggestedActions';

const formatContent = (text) => {
  if (!text) return '';
  let lines = text.split('\n');
  return lines.map((line, idx) => {
    let parts = line.split(/(\*\*.*?\*\*)/g);
    let formattedParts = parts.map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });

    if (line.startsWith('• ') || line.startsWith('- ')) {
      return (
        <div key={idx} style={{ paddingLeft: '14px', position: 'relative', marginBottom: '4px' }}>
          <span style={{ position: 'absolute', left: 0 }}>•</span>
          {formattedParts}
        </div>
      );
    }
    return (
      <div key={idx} style={{ minHeight: '1.2em', marginBottom: line ? '4px' : '8px' }}>
        {formattedParts}
      </div>
    );
  });
};

const ChatMessage = ({ message, assistantType = 'pulse_brain', onActionClick }) => {
  const isUser = message.role === 'user';
  const timeStr = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const isBrain = assistantType === 'pulse_brain';
  const botBg = isBrain ? 'rgba(21, 101, 192, 0.16)' : 'rgba(0, 137, 123, 0.16)';
  const botBorder = isBrain ? 'rgba(33, 150, 243, 0.35)' : 'rgba(0, 150, 136, 0.35)';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '16px',
      width: '100%',
    }}>
      <div style={{
        display: 'flex',
        gap: '10px',
        maxWidth: '92%',
        flexDirection: isUser ? 'row-reverse' : 'row',
      }}>
        {/* Avatar */}
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          backgroundColor: isUser ? '#2563EB' : isBrain ? '#1565C0' : '#00897B',
          color: '#ffffff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          marginTop: '2px',
        }}>
          {isUser ? <User size={17} /> : isBrain ? <Brain size={17} /> : <Bot size={17} />}
        </div>

        {/* Message Content Bubble */}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            padding: '12px 16px',
            borderRadius: isUser ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
            backgroundColor: isUser ? '#1E40AF' : botBg,
            border: `1px solid ${isUser ? '#3B82F6' : botBorder}`,
            color: isUser ? '#FFFFFF' : 'var(--text-color, #E2E8F0)',
            fontSize: '0.9rem',
            lineHeight: '1.5',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          }}>
            {formatContent(message.content)}
          </div>

          {/* Suggested Actions */}
          {!isUser && message.suggested_actions && message.suggested_actions.length > 0 && (
            <SuggestedActions actions={message.suggested_actions} onActionClick={onActionClick} />
          )}

          {/* Timestamp */}
          <div style={{
            fontSize: '0.7rem',
            color: 'var(--text-muted, #888)',
            marginTop: '4px',
            textAlign: isUser ? 'right' : 'left',
            paddingLeft: '4px',
            paddingRight: '4px',
          }}>
            {timeStr}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
