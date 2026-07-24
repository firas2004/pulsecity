import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SensorChart = ({ data, metricName, unit, color }) => {
  const chartColor = color || 'var(--primary)';

  if (!data || data.length === 0) {
    return (
      <div style={{ display: 'flex', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        Aucune donnée historique disponible pour le moment.
      </div>
    );
  }

  // Formater les heures pour l'axe X
  const formattedData = data.map(item => ({
    ...item,
    timeLabel: new Date(item.time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
        <XAxis 
          dataKey="timeLabel" 
          stroke="var(--text-muted)" 
          fontSize={11} 
          tickLine={false} 
          axisLine={false} 
        />
        <YAxis 
          stroke="var(--text-muted)" 
          fontSize={11} 
          tickLine={false} 
          axisLine={false} 
          domain={['auto', 'auto']}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border-color)',
            borderRadius: '8px',
            color: 'var(--text-main)'
          }}
          labelStyle={{ color: 'var(--text-muted)', fontSize: '11px' }}
          itemStyle={{ color: chartColor, fontSize: '13px' }}
          formatter={(value) => [`${Number(value).toFixed(2)} ${unit}`, metricName]}
        />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke={chartColor} 
          strokeWidth={2} 
          dot={false}
          activeDot={{ r: 6, stroke: '#FFFFFF', strokeWidth: 1.5 }}
          isAnimationActive={false} // Désactiver l'animation de chargement pour les mises à jour en direct fluides
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SensorChart;
