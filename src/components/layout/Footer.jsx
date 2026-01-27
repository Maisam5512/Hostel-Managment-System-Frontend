import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const AppFooter = () => {
  return (
    <footer className="bg-dark-theme text-white mt-auto py-4">
      <Container>
        <Row>
          <Col md={6}>
            <h5 className="text-orange">Hostel Management System</h5>
            <p className="mb-0 small">
              Complete hostel management solution for educational institutions.
              Built with MERN stack.
            </p>
          </Col>
          <Col md={6} className="text-md-end">
            <p className="mb-0 small">
              &copy; {new Date().getFullYear()} Aadit Hostel Management System. 
              All rights reserved.
            </p>
            <p className="small text-muted">
              Final Year Project - MERN Stack Implementation
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default AppFooter;