import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { restaurantService } from '../../services/restaurantService';
import styles from './Sidebar.module.scss';

const navItems = [
  { path: '/dashboard', label: 'Tổng quan', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
  )},
  { path: '/orders', label: 'Đơn hàng', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
  )},
  { path: '/tables', label: 'Quản lý bàn', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="3" rx="1"/><path d="M4 10v7"/><path d="M20 10v7"/><path d="M8 10v10"/><path d="M16 10v10"/></svg>
  )},
  { path: '/menu', label: 'Thực đơn', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
  )},
  { path: '/customers', label: 'Khách hàng', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  )},
  { path: '/staff', label: 'Nhân viên', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  )},
];

const Sidebar = () => {
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    restaurantService.getInfo()
      .then((res) => setRestaurant(res.data))
      .catch(() => {});
  }, []);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <h1 className={styles.brandName}>{restaurant?.name || 'Hải Sản Biển Đông'}</h1>
        <span className={styles.brandSub}>HỆ THỐNG QUẢN LÝ</span>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navActive : ''}`
            }
          >
            <span className={styles.navIcon}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>
        <button
          className={styles.reservationBtn}
          onClick={() => navigate('/reservations')}
        >
          Đặt bàn mới
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
