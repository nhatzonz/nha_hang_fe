import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Header.module.scss';

const Header = ({ title, subtitle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>

      <div className={styles.right}>
        <div className={styles.search}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" placeholder="Tìm kiếm..." className={styles.searchInput} />
        </div>

        <button className={styles.createOrderBtn} onClick={() => navigate('/orders/create')}>
          Tạo đơn hàng
        </button>

        <button className={styles.iconBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </button>

        <div className={styles.userMenu} onClick={logout} title="Đăng xuất">
          <div className={styles.avatar}>
            {user?.full_name?.charAt(0) || 'A'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
