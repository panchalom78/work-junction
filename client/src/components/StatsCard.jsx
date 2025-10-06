import React from 'react';

const StatsCard = ({ icon: Icon, label, value, color = "blue" }) => {
  const colorClasses = {
    blue: { bg: 'bg-primary-light', text: 'text-primary-color' },
    green: { bg: 'bg-success-light', text: 'text-success-color' },
    yellow: { bg: 'bg-warning-light', text: 'text-warning-color' },
    orange: { bg: 'bg-warning-light', text: 'text-warning-color' },
    purple: { bg: 'bg-info-light', text: 'text-info-color' }
  };

  const { bg, text } = colorClasses[color] || colorClasses.blue;

  return (
    <div style={{ backgroundColor: 'var(--surface-primary)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)', transition: 'box-shadow var(--transition-normal)' }} 
         onMouseOver={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
         onMouseOut={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}>
      <div className="flex items-center justify-between">
        <div>
          <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{label}</p>
          <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-color)' }}>{value}</p>
        </div>
        <div style={{ padding: '0.75rem', borderRadius: '9999px', backgroundColor: bg }}>
          <Icon style={{ width: '1.5rem', height: '1.5rem', color: text }} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;