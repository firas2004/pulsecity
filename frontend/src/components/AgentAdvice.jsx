import React from 'react';
import * as Icons from 'lucide-react';

const iconMap = {
  weather: Icons.CloudSun,
  traffic: Icons.Compass,
  threshold: Icons.ShieldAlert,
  general: Icons.Sparkles
};

const titleMap = {
  weather: 'Météo Agent AI',
  traffic: 'Trafic Agent AI',
  threshold: 'Sécurité Agent AI',
  general: 'PulseCity Brain AI'
};

const AgentAdvice = ({ type, text, timestamp }) => {
  const IconComponent = iconMap[type] || Icons.Cpu;
  const title = titleMap[type] || 'Conseil Agent AI';

  let borderColor = 'rgba(255, 255, 255, 0.08)';
  let iconColor = 'var(--primary)';

  if (type === 'weather') {
    borderColor = 'rgba(59, 130, 246, 0.2)';
    iconColor = '#60A5FA';
  } else if (type === 'traffic') {
    borderColor = 'rgba(245, 158, 11, 0.2)';
    iconColor = '#FBBF24';
  } else if (type === 'threshold') {
    borderColor = 'rgba(239, 68, 68, 0.2)';
    iconColor = '#F87171';
  }

  const timeString = timestamp ? new Date(timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div 
      className="card-glass" 
      style={{ 
        borderLeft: `3px solid ${iconColor}`,
        borderColor: borderColor,
        padding: '16px',
        marginBottom: '12px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IconComponent size={16} style={{ color: iconColor }} />
          <span style={{ fontWeight: '600', fontSize: '13px', color: 'var(--text-main)' }}>{title}</span>
        </div>
        {timeString && (
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{timeString}</span>
        )}
      </div>
      <p style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.4', margin: 0 }}>
        {text}
      </p>
    </div>
  );
};

export default AgentAdvice;
