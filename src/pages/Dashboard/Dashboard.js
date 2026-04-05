import React, { useState } from 'react';
import Layout from '../../components/common/Layout';
import Header from '../../components/common/Header';
import styles from './Dashboard.module.scss';

const kpiData = [
  {
    label: 'TỔNG DOANH THU',
    value: '128.430.500đ',
    change: '+12.4% so với tháng trước',
    up: true,
    color: '#c0392b',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="1.5" opacity="0.3">
        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
  },
  {
    label: 'TỶ LỆ KHÁCH QUAY LẠI',
    value: '68.2%',
    change: 'Điểm trung thành xuất sắc',
    up: null,
    color: '#27ae60',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#27ae60" strokeWidth="1.5" opacity="0.3">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    label: 'TỶ LỆ ĐẶT BÀN',
    value: '24.5%',
    change: '+3.1% trung bình ngày',
    up: true,
    color: '#8e44ad',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8e44ad" strokeWidth="1.5" opacity="0.3">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
];

const revenueData = [
  { day: 'T2', value: 45 },
  { day: 'T3', value: 62 },
  { day: 'T4', value: 55 },
  { day: 'T5', value: 78 },
  { day: 'T6', value: 90 },
  { day: 'T7', value: 85 },
  { day: 'CN', value: 72 },
];

const trendingItems = [
  { name: 'Tôm Hùm Nướng', orders: 142, price: '850.000đ' },
  { name: 'Cua Hoàng Đế', orders: 98, price: '1.200.000đ' },
  { name: 'Cá Mú Hấp', orders: 85, price: '650.000đ' },
];

const floorLeaders = [
  { name: 'Nguyễn Lan', role: 'Trưởng ca', score: '4.9/5.0', tables: '84 bàn', initials: 'NL', color: '#e74c3c' },
  { name: 'Trần Minh', role: 'Phục vụ', score: '4.8/5.0', tables: '62 bàn', initials: 'TM', color: '#3498db' },
  { name: 'Lê Hương', role: 'Lễ tân', score: '4.7/5.0', tables: '112 khách', initials: 'LH', color: '#27ae60' },
];

const Dashboard = () => {
  const [chartPeriod, setChartPeriod] = useState('weekly');
  const maxValue = Math.max(...revenueData.map((d) => d.value));

  return (
    <Layout>
      <Header title="Tổng quan quản lý" />

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        {kpiData.map((kpi, i) => (
          <div key={i} className={styles.kpiCard}>
            <div className={styles.kpiTop}>
              <span className={styles.kpiLabel}>{kpi.label}</span>
              <span className={styles.kpiIcon}>{kpi.icon}</span>
            </div>
            <div className={styles.kpiValue}>{kpi.value}</div>
            <div className={styles.kpiChange}>
              {kpi.up && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={kpi.color} strokeWidth="2.5">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                </svg>
              )}
              <span style={{ color: kpi.up ? '#27ae60' : '#888' }}>{kpi.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Content grid */}
      <div className={styles.contentGrid}>
        {/* Revenue Chart */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Biến động doanh thu</h3>
              <p className={styles.cardDesc}>Theo dõi hiệu suất ca tối</p>
            </div>
            <div className={styles.periodToggle}>
              <button
                className={`${styles.periodBtn} ${chartPeriod === 'weekly' ? styles.periodActive : ''}`}
                onClick={() => setChartPeriod('weekly')}
              >
                TUẦN
              </button>
              <button
                className={`${styles.periodBtn} ${chartPeriod === 'monthly' ? styles.periodActive : ''}`}
                onClick={() => setChartPeriod('monthly')}
              >
                THÁNG
              </button>
            </div>
          </div>
          <div className={styles.chart}>
            {revenueData.map((d, i) => (
              <div key={i} className={styles.chartCol}>
                <div className={styles.barWrapper}>
                  <div
                    className={styles.bar}
                    style={{ height: `${(d.value / maxValue) * 100}%` }}
                  />
                </div>
                <span className={styles.chartLabel}>{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trending */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Món bán chạy</h3>
          </div>
          <div className={styles.trendingList}>
            {trendingItems.map((item, i) => (
              <div key={i} className={styles.trendingItem}>
                <div className={styles.trendingImg}>
                  <span>{['🦐', '🦀', '🐟'][i]}</span>
                </div>
                <div className={styles.trendingInfo}>
                  <span className={styles.trendingName}>{item.name}</span>
                  <span className={styles.trendingOrders}>{item.orders} đơn tuần này</span>
                </div>
                <span className={styles.trendingPrice}>{item.price}</span>
              </div>
            ))}
          </div>
          <button className={styles.viewAnalytics}>Xem phân tích thực đơn →</button>
        </div>
      </div>

      {/* Bottom grid */}
      <div className={styles.bottomGrid}>
        {/* Floor Leaders */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Nhân viên nổi bật</h3>
            <button className={styles.moreBtn}>•••</button>
          </div>
          <div className={styles.leaderList}>
            {floorLeaders.map((leader, i) => (
              <div key={i} className={styles.leaderItem}>
                <div className={styles.leaderAvatar} style={{ background: leader.color }}>
                  {leader.initials}
                </div>
                <div className={styles.leaderInfo}>
                  <span className={styles.leaderName}>{leader.name}</span>
                  <span className={styles.leaderRole}>{leader.role}</span>
                </div>
                <div className={styles.leaderStats}>
                  <span className={styles.leaderScore}>{leader.score}</span>
                  <span className={styles.leaderTables}>{leader.tables}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Chatbot Card */}
        <div className={styles.aiCard}>
          <div className={styles.aiStatus}>
            <span className={styles.aiDot} />
            CHATBOT AI ĐANG HOẠT ĐỘNG
          </div>
          <h3 className={styles.aiTitle}>Hỗ trợ khách hàng tự động</h3>
          <p className={styles.aiDesc}>
            Trợ lý AI 
          </p>
          <div className={styles.aiQuote}>
            "Bàn 4 đã xác nhận cho thứ Sáu 19h. Đã gửi xác nhận cho khách."
          </div>
          <button className={styles.aiBtn}>Quản lý hội thoại</button>
        </div>
      </div>

      {/* Footer */}
      <footer className={styles.pageFooter}>
        <span>© 2024 Hải Sản Biển Đông - Hệ thống quản lý nhà hàng</span>
      </footer>
    </Layout>
  );
};

export default Dashboard;
