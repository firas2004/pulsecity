import React from 'react';

const AlertBadge = ({ level }) => {
  let text = 'Normal';
  let bgColor = 'rgba(16, 185, 129, 0.15)';
  let textColor = '#10B981';
  let pulseColor = '#10B981';

  if (level === 'Critical' || level === 'red' || level === 'danger' || level === 'critical') {
    text = 'Critique';
    bgColor = 'rgba(239, 68, 68, 0.15)';
    textColor = '#EF4444';
    pulseColor = '#EF4444';
  } else if (level === 'Warning' || level === 'orange' || level === 'warning') {
    text = 'Alerte';
    bgColor = 'rgba(245, 158, 11, 0.15)';
    textColor = '#F59E0B';
    pulseColor = '#F59E0B';
  }

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 10px',
      borderRadius: '20px',
      backgroundColor: bgColor,
      color: textColor,
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    }}>
      <span style={{
        display: 'inline-block',
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: pulseColor,
        boxShadow: `0 0 6px ${pulseColor}`
      }} className={level === 'Critical' || level === 'red' || level === 'danger' || level === 'critical' ? 'marker-pulse' : ''} />
      {text}
    </div>
  );
};

export default AlertBadge;
