import React, { useEffect, useState } from 'react';
import * as Icons from 'lucide-react';

const iconMap = {
  traffic: Icons.Car,
  air_co2: Icons.Wind,
  noise: Icons.Volume2,
  energy: Icons.Zap,
  temperature: Icons.Thermometer,
  humidity: Icons.Droplet
};

const labelMap = {
  traffic: 'Trafic Routier',
  air_co2: 'Qualité de l\'Air',
  noise: 'Niveau Sonore',
  energy: 'Consommation Énergie',
  temperature: 'Température',
  humidity: 'Humidité'
};

const MetricCard = ({ type, value, unit, status }) => {
  const [flash, setFlash] = useState(false);
  const IconComponent = iconMap[type] || Icons.Activity;
  const label = labelMap[type] || type;

  // Déclencher un flash visuel léger lors du changement de valeur
  useEffect(() => {
    if (value !== undefined) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 300);
      return () => clearTimeout(t);
    }
  }, [value]);

  // Déterminer la couleur de la bordure et de la lueur selon le statut
  let statusColor = 'var(--success)';
  let glowStyle = 'var(--success-glow)';
  let levelText = 'Normal';
  let isCritical = false;

  if (status === 'Critical' || status === 'red' || status === 'danger') {
    statusColor = 'var(--danger)';
    glowStyle = 'var(--danger-glow)';
    levelText = 'Critique';
    isCritical = true;
  } else if (status === 'Warning' || status === 'orange' || status === 'warning') {
    statusColor = 'var(--warning)';
    glowStyle = 'var(--warning-glow)';
    levelText = 'Alerte';
  }

  const borderStyle = isCritical ? 'pulse-critical' : '';

  return (
    <div 
      className={`card-glass ${borderStyle}`} 
      style={{ 
        boxShadow: `0 8px 32px 0 rgba(0, 0, 0, 0.2), 0 0 16px ${glowStyle}`,
        borderLeft: `4px solid ${statusColor}`
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500' }}>{label}</span>
        <IconComponent size={20} style={{ color: statusColor }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
        <span 
          className={`value-update-flash`}
          style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            color: 'var(--text-main)',
            animation: flash ? 'fade-in-value 0.3s ease-out' : 'none'
          }}
        >
          {value !== undefined && value !== null ? Number(value).toFixed(1) : '--'}
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{unit || ''}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
        <span style={{ 
          fontSize: '11px', 
          fontWeight: '600', 
          textTransform: 'uppercase', 
          color: statusColor,
          padding: '2px 8px',
          borderRadius: '12px',
          backgroundColor: `${statusColor}20`
        }}>
          {levelText}
        </span>
        
        {isCritical && (
          <span style={{ 
            display: 'inline-block', 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            backgroundColor: 'var(--danger)',
            boxShadow: '0 0 8px var(--danger)'
          }} />
        )}
      </div>
    </div>
  );
};

export default MetricCard;
