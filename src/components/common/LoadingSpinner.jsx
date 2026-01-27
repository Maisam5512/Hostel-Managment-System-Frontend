import React from 'react';

const LoadingSpinner = ({ size = 'md', message = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'spinner-border-sm',
    md: '',
    lg: 'spinner-border-lg'
  };

  return (
    <div className="d-flex flex-column align-items-center justify-content-center p-4">
      <div className={`spinner-border text-orange ${sizeClasses[size]}`} role="status">
        <span className="visually-hidden">{message}</span>
      </div>
      {message && <p className="mt-2 text-muted">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;