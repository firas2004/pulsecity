import React, { useState } from 'react';
import { Download, FileText, Table } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * ExportButton - Additive component that renders CSV and PDF download triggers for a city.
 * Does not touch any data fetching, state, or rendering logic of parent components.
 */
const ExportButton = ({ cityId, cityName, range = '7d' }) => {
  const [open, setOpen] = useState(false);

  const triggerDownload = (format) => {
    const token = localStorage.getItem('access_token');
    // Open in new tab with token in header not possible directly — use anchor with URL
    // Backend handles auth via current_user dependency; use query param for token
    const url = `${API_BASE}/reports/${cityId}?format=${format}&range=${range}&token=${token}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${cityId}-${range}.${format === 'pdf' ? 'html' : 'csv'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setOpen(false);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(prev => !prev)}
        title={`Exporter rapport pour ${cityName}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '7px 14px',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          background: 'var(--surface-2)',
          color: 'var(--text-main)',
          fontSize: '12px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
      >
        <Download size={13} />
        Exporter
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: '36px',
          right: 0,
          zIndex: 200,
          background: 'var(--surface)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '6px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          minWidth: '160px',
        }}>
          <button
            onClick={() => triggerDownload('csv')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
              padding: '8px 12px', borderRadius: '6px', border: 'none',
              background: 'transparent', color: 'var(--text-main)', fontSize: '13px',
              cursor: 'pointer', fontWeight: '600', textAlign: 'left',
            }}
            onMouseEnter={e => e.target.style.background = 'var(--surface-2)'}
            onMouseLeave={e => e.target.style.background = 'transparent'}
          >
            <Table size={14} color="#10B981" />
            CSV (.csv)
          </button>
          <button
            onClick={() => triggerDownload('pdf')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
              padding: '8px 12px', borderRadius: '6px', border: 'none',
              background: 'transparent', color: 'var(--text-main)', fontSize: '13px',
              cursor: 'pointer', fontWeight: '600', textAlign: 'left',
            }}
            onMouseEnter={e => e.target.style.background = 'var(--surface-2)'}
            onMouseLeave={e => e.target.style.background = 'transparent'}
          >
            <FileText size={14} color="#3B82F6" />
            Rapport HTML
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportButton;
