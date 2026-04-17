import React from 'react';
import styles from './ReportDateRange.module.scss';

const presets = [
  { key: 'week', label: '7 ngày', days: 6 },
  { key: 'month', label: '30 ngày', days: 29 },
  { key: 'quarter', label: '90 ngày', days: 89 },
  { key: 'year', label: '1 năm', days: 364 },
];

const toISODate = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};

const ReportDateRange = ({ from, to, onChange }) => {
  const applyPreset = (days) => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - days);
    onChange({ from: toISODate(start), to: toISODate(now) });
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.presets}>
        {presets.map((p) => (
          <button key={p.key} className={styles.presetBtn} onClick={() => applyPreset(p.days)}>
            {p.label}
          </button>
        ))}
      </div>
      <div className={styles.dates}>
        <label>
          <span>Từ</span>
          <input
            type="date"
            value={from || ''}
            onChange={(e) => onChange({ from: e.target.value, to })}
          />
        </label>
        <label>
          <span>đến</span>
          <input
            type="date"
            value={to || ''}
            onChange={(e) => onChange({ from, to: e.target.value })}
          />
        </label>
      </div>
    </div>
  );
};

export default ReportDateRange;
