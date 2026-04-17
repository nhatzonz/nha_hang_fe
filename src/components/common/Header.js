import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserDropdown from './UserDropdown';
import styles from './Header.module.scss';

const Header = ({ title, subtitle }) => {
  const navigate = useNavigate();

  return (
    <header className={styles.header}>
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
