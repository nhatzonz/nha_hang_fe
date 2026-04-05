import React from 'react';
import Layout from '../components/common/Layout';
import Header from '../components/common/Header';

const ComingSoon = ({ title }) => {
  return (
    <Layout>
      <Header title={title} />
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '50vh',
        color: '#999',
        fontSize: '16px',
      }}>
        Tính năng đang được phát triển...
      </div>
    </Layout>
  );
};

export default ComingSoon;
