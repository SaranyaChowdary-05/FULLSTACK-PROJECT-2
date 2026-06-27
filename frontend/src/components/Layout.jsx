import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children, activePage, onPageChange, pageTitle, user }) => {
  return (
    <div className="layout-wrapper">
      <Sidebar activePage={activePage} onPageChange={onPageChange} />
      <div className="main-content">
        <Header title={pageTitle} user={user} />
        {children}
      </div>
    </div>
  );
};

export default Layout;
