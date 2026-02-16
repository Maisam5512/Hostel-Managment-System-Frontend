import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useLayout } from '../../context/LayoutContext';   // <-- import

const Layout = ({ children }) => {
  const { sidebarOpen, toggleSidebar, closeSidebar } = useLayout();

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay d-lg-none"
          onClick={closeSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div className={`sidebar-wrapper ${sidebarOpen ? 'show' : ''}`}>
        <Sidebar onClose={closeSidebar} />
      </div>
      
      {/* Main Content */}
      <div className="main-content flex-grow-1 d-flex flex-column">
        <Topbar 
          onToggleSidebar={toggleSidebar} 
          sidebarOpen={sidebarOpen}
        />
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









