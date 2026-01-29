import React from 'react';
import Layout from '../components/layout/Layout';

const Members = () => {
  return (
    <Layout>
      <div className="mb-4">
        <h2 className="text-dark mb-0">Member Management</h2>
        <p className="text-muted">Manage hostel residents and allocations</p>
      </div>
      
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <h5 className="card-title">👥 Members</h5>
          <p className="card-text">Member management page content will be added here.</p>
        </div>
      </div>
    </Layout>
  );
};

export default Members;