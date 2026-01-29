import React from 'react';
import Layout from '../components/layout/Layout';

const Rooms = () => {
  return (
    <Layout>
      <div className="mb-4">
        <h2 className="text-dark mb-0">Room Management</h2>
        <p className="text-muted">Manage hostel rooms and bed allocations</p>
      </div>
      
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <h5 className="card-title">🏠 Rooms</h5>
          <p className="card-text">Room management page content will be added here.</p>
        </div>
      </div>
    </Layout>
  );
};

export default Rooms;