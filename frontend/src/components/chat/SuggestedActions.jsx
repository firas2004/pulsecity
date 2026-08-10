import React from 'react';
import { useNavigate } from 'react-router-dom';

const SuggestedActions = ({ actions = [], onActionClick }) => {
  const navigate = useNavigate();

  if (!actions || actions.length === 0) return null;

  const handleClick = (act) => {
    if (onActionClick) {
      onActionClick(act);
    }
    if (act.link) {
      navigate(act.link);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      marginTop: '10px',
    }}>
      {actions.map((act, idx) => (
        <button
          key={idx}
          onClick={() => handleClick(act)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            fontSize: '0.8rem',
            fontWeight: '600',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            color: 'var(--text-color, #e0e0e0)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            backdropFilter: 'blur(4px)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
            e.currentTarget.style.transform = 'none';
          }}
        >
          {act.label}
        </button>
      ))}
    </div>
  );
};

export default SuggestedActions;
