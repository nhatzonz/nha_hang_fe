import React from 'react';
import styles from './DateRangeFilter.module.scss';

const OPTIONS = [
  { key: 'today', label: 'Hôm nay' },
  { key: 'week', label: '7 ngày' },
  { key: 'month', label: '30 ngày' },
  { key: 'year', label: '1 năm' },
];

const DateRangeFilter = ({ value, onChange }) => {
  return (
    <div className={styles.wrap}>
      {OPTIONS.map((opt) => (
        <button
          key={opt.key}
          className={`${styles.btn} ${value === opt.key ? styles.active : ''}`}
          onClick={() => onChange(opt.key)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export default DateRangeFilter;
