import React from 'react';
import Sidebar from './Sidebar';
import ChatWidget from '../Chatbot/ChatWidget';
import { useAuth } from '../../context/AuthContext';
import { SidebarProvider } from '../../context/SidebarContext';
import styles from './Layout.module.scss';

const Layout = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return (
    <SidebarProvider>
      <div className={styles.layout}>
        <Sidebar />
        <main className={styles.main}>
          {children}
        </main>
        {isAuthenticated && <ChatWidget />}
      </div>
    </SidebarProvider>
  );
};

export default Layout;
