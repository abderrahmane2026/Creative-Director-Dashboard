import React from 'react';
import Sidebar from './Sidebar';

function Layout({ children }) {
  return (
    <div style={styles.layout}>
      <Sidebar />
      <main style={styles.main}>
        {children}
      </main>
    </div>
  );
}

const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
    background: 'var(--dark)',
  },
  main: {
    marginLeft: '220px',
    flex: 1,
    padding: '2.5rem',
    minHeight: '100vh',
  },
};

export default Layout;