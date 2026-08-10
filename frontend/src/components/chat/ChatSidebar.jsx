import React from 'react';
import { Plus, MessageSquare, Trash2, Brain, Bot } from 'lucide-react';

const groupConversationsByDate = (conversations = []) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86400000;
  const thisWeek = today - 6 * 86400000;

  const groups = {
    Aujourdhui: [],
    Hier: [],
    CetteSemaine: [],
    PlusAncien: [],
  };

  conversations.forEach((conv) => {
    const time = new Date(conv.updated_at || conv.created_at || Date.now()).getTime();
    if (time >= today) {
      groups.Aujourdhui.push(conv);
    } else if (time >= yesterday) {
      groups.Hier.push(conv);
    } else if (time >= thisWeek) {
      groups.CetteSemaine.push(conv);
    } else {
      groups.PlusAncien.push(conv);
    }
  });

  return groups;
};

const ChatSidebar = ({
  conversations = [],
  activeId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  assistantType = 'pulse_brain',
}) => {
  const groups = groupConversationsByDate(conversations);
  const isBrain = assistantType === 'pulse_brain';
  const themeColor = isBrain ? '#1565C0' : '#00897B';

  const renderSection = (title, items) => {
    if (!items || items.length === 0) return null;
    return (
      <div key={title} style={{ marginBottom: '16px' }}>
        <div style={{
          fontSize: '0.72rem',
          fontWeight: '700',
          color: 'var(--text-muted, #888)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          padding: '0 8px 6px 8px',
        }}>
          {title}
        </div>
        {items.map((conv) => {
          const isActive = conv.id === activeId;
          return (
            <div
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: '8px',
                marginBottom: '4px',
                cursor: 'pointer',
                backgroundColor: isActive ? 'rgba(37, 99, 235, 0.2)' : 'transparent',
                border: isActive ? `1px solid ${themeColor}` : '1px solid transparent',
                transition: 'all 0.15s ease',
              }}
              className="chat-history-item"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                <MessageSquare size={15} color={isActive ? themeColor : '#94A3B8'} style={{ flexShrink: 0 }} />
                <span style={{
                  fontSize: '0.85rem',
                  color: isActive ? '#FFFFFF' : 'var(--text-color, #CBD5E1)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '130px',
                }}>
                  {conv.title || 'Nouvelle discussion'}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConversation(conv.id);
                }}
                title="Supprimer la conversation"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  cursor: 'pointer',
                  padding: '2px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#64748B')}
              >
                <Trash2 size={13} />
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{
      width: '240px',
      height: '100%',
      backgroundColor: 'var(--surface-color, #0F172A)',
      borderRight: '1px solid var(--border-color, rgba(255,255,255,0.1))',
      display: 'flex',
      flexDirection: 'column',
      padding: '12px',
      flexShrink: 0,
    }}>
      {/* New Chat Button */}
      <button
        onClick={onNewChat}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '10px',
          borderRadius: '10px',
          backgroundColor: themeColor,
          color: '#ffffff',
          fontWeight: '600',
          fontSize: '0.88rem',
          border: 'none',
          cursor: 'pointer',
          marginBottom: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          transition: 'all 0.2s ease',
        }}
      >
        <Plus size={16} />
        Nouveau Chat
      </button>

      {/* Grouped History */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
        {renderSection("Aujourd'hui", groups.Aujourdhui)}
        {renderSection("Hier", groups.Hier)}
        {renderSection("Cette semaine", groups.CetteSemaine)}
        {renderSection("Plus ancien", groups.PlusAncien)}

        {conversations.length === 0 && (
          <div style={{
            textAlign: 'center',
            color: '#64748B',
            fontSize: '0.8rem',
            marginTop: '30px',
          }}>
            Aucun historique
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
