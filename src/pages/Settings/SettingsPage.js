import React, { useState } from 'react';
import Layout from '../../components/common/Layout';
import Header from '../../components/common/Header';
import RestaurantInfoTab from './RestaurantInfoTab';
import BankAccountsTab from './BankAccountsTab';
import styles from './Settings.module.scss';

const TABS = [
  { key: 'restaurant', label: 'Thông tin nhà hàng' },
  { key: 'bank', label: 'Tài khoản ngân hàng' },
];

const SettingsPage = () => {
  const [tab, setTab] = useState('restaurant');

  return (
    <Layout>
      <Header title="Cài đặt hệ thống" subtitle="Quản lý thông tin nhà hàng và tài khoản thanh toán" />

      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`${styles.tab} ${tab === t.key ? styles.active : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {tab === 'restaurant' && <RestaurantInfoTab />}
        {tab === 'bank' && <BankAccountsTab />}
      </div>
    </Layout>
  );
};

export default SettingsPage;
