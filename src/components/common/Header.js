import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserDropdown from './UserDropdown';
import { useSidebar } from '../../context/SidebarContext';
import styles from './Header.module.scss';

const Header = ({ title, subtitle }) => {
  const navigate = useNavigate();
  const { toggle } = useSidebar();

  return (
    <header className={styles.header}>
      <button className={styles.menuBtn} onClick={toggle} aria-label="Mở menu">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      <div className={styles.left}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>

      <div className={styles.right}>
        <button className={styles.createOrderBtn} onClick={() => navigate('/orders/create')}>
          Tạo đơn hàng
        </button>
        <UserDropdown />
      </div>
    </header>
  );
};

export default Header;
