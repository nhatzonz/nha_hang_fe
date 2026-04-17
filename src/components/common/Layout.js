import React from 'react';
import Sidebar from './Sidebar';
import ChatWidget from '../Chatbot/ChatWidget';
import { useAuth } from '../../context/AuthContext';
import styles from './Layout.module.scss';

const Layout = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        {children}
      </main>
      {isAuthenticated && <ChatWidget />}
    </div>
  );
};

export default Layout;
