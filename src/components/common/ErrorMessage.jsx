import React from 'react';
import { Alert } from 'react-bootstrap';

const ErrorMessage = ({ message, variant = 'danger', onClose }) => {
  return (
    <Alert variant={variant} className="mb-3" dismissible={!!onClose} onClose={onClose}>
      {message}
    </Alert>
  );
};

export default ErrorMessage;