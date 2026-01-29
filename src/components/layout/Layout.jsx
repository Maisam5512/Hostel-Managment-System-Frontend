import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay d-lg-none"
          onClick={closeSidebar}
        />
      )}
      
      {/* Sidebar - Fixed for all screens */}
      <div className={`sidebar-wrapper ${sidebarOpen ? 'show' : ''}`}>
        <Sidebar onClose={closeSidebar} />
      </div>
      
      {/* Main Content */}
      <div className="main-content flex-grow-1 d-flex flex-column">
        <Topbar onToggleSidebar={toggleSidebar} />
        <main className="flex-grow-1 p-0" style={{ overflowY: 'auto' }}>
          <div className="p-3">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;