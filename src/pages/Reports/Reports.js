import React, { useState } from 'react';
import Layout from '../../components/common/Layout';
import Header from '../../components/common/Header';
import RevenueReport from './tabs/RevenueReport';
import MenuReport from './tabs/MenuReport';
import CustomersReport from './tabs/CustomersReport';
import OperationsReport from './tabs/OperationsReport';
import styles from './Reports.module.scss';

const toISODate = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};

const today = toISODate(new Date());
const monthAgo = (() => {
  const d = new Date();
  d.setDate(d.getDate() - 29);
  return toISODate(d);
})();

const TABS = [
  { key: 'revenue', label: 'Doanh thu' },
  { key: 'menu', label: 'Món ăn' },
  { key: 'customers', label: 'Khách hàng' },
  { key: 'operations', label: 'Vận hành' },
];

const Reports = () => {
  const [activeTab, setActiveTab] = useState('revenue');
  const [range, setRange] = useState({ from: monthAgo, to: today });

  return (
    <Layout>
      <Header title="Báo cáo" subtitle="Phân tích chi tiết hoạt động nhà hàng" />

      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`${styles.tab} ${activeTab === t.key ? styles.active : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {activeTab === 'revenue' && <RevenueReport range={range} setRange={setRange} />}
        {activeTab === 'menu' && <MenuReport range={range} setRange={setRange} />}
        {activeTab === 'customers' && <CustomersReport range={range} setRange={setRange} />}
        {activeTab === 'operations' && <OperationsReport range={range} setRange={setRange} />}
      </div>
    </Layout>
  );
};

export default Reports;
