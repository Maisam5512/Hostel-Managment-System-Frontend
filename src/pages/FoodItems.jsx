import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Table, 
  Button, 
  Form, 
  Modal, 
  Alert,
  Badge,
  Dropdown
} from 'react-bootstrap';
import Layout from '../components/layout/Layout';
import { foodItemService } from '../services/foodItemService';
import { useAuth } from '../context/AuthContext';

// Icons
import {
  FaUtensils, FaPlus, FaFilter, FaTimes, FaEdit, FaTrash,
  FaExclamationTriangle, FaCheckCircle, FaBan, FaSun,
  FaCloudSun, FaMoon, FaCookieBite, FaUser, FaCalendarAlt,
  FaIdCard, FaMoneyBillWave, FaToggleOn
} from 'react-icons/fa';

const FoodItems = () => {
  const { user } = useAuth();
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState({
    category: '',
    isActive: ''
  });

  // Error modal state
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');

  // Validation errors for the create/edit form
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    category: 'BREAKFAST',
    price: '',
    isActive: true
  });

  const categories = [
    { value: 'BREAKFAST', label: 'Breakfast', icon: <FaSun /> },
    { value: 'LUNCH', label: 'Lunch', icon: <FaCloudSun /> },
    { value: 'DINNER', label: 'Dinner', icon: <FaMoon /> },
    { value: 'SNACK', label: 'Snack', icon: <FaCookieBite /> }
  ];

  // Show API error in modal
  useEffect(() => {
    if (error) {
      setErrorModalMessage(error);
      setShowErrorModal(true);
    }
  }, [error]);

  const fetchFoodItems = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter.category) params.category = filter.category;
      if (filter.isActive !== '') params.isActive = filter.isActive;
      
      const response = await foodItemService.getAll(params);
      
      let items = [];
      if (response && response.success) {
        items = response.data || [];
      } else if (Array.isArray(response)) {
        items = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        items = response.data;
      }
      
      setFoodItems(items);
      setError('');
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError('Failed to fetch food items');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchFoodItems();
  }, [fetchFoodItems]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    // Clear validation error for this field when user types
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Validation function
  const validateForm = () => {
    const errors = {};
    if (!formData.name || formData.name.trim() === '') {
      errors.name = 'Food item name is required';
    }
    if (!formData.price || formData.price <= 0) {
      errors.price = 'Valid price is required (greater than 0)';
    } else if (isNaN(formData.price)) {
      errors.price = 'Price must be a number';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors({});

    try {
      setError('');
      setSuccess('');

      let response;
      if (selectedItem) {
        response = await foodItemService.update(selectedItem._id, formData);
        setSuccess(response.message || 'Food item updated successfully');
      } else {
        response = await foodItemService.create(formData);
        setSuccess(response.message || 'Food item created successfully');
        
        if (response.data) {
          setFoodItems(prev => [response.data, ...prev]);
        }
      }

      handleCloseModal();
      setTimeout(() => {
        fetchFoodItems();
      }, 500);
      
    } catch (err) {
      console.error('❌ Submit error:', err);
      setError(err.response?.data?.message || err.message || 'Operation failed');
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price,
      isActive: item.isActive
    });
    setValidationErrors({}); // Clear any previous errors
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      const response = await foodItemService.delete(selectedItem._id);
      
      if (response && response.success === false) {
        setError(response.message || 'Failed to deactivate food item');
      } else {
        setSuccess(response?.message || 'Food item deactivated successfully');
        setShowDeleteModal(false);
        setSelectedItem(null);
        fetchFoodItems(); // Refresh the list from server
      }
    } catch (err) {
      console.error('❌ Delete error:', err);
      setError(err.response?.data?.message || 'Failed to deactivate food item');
    }
  };

  const handleAddNew = () => {
    setSelectedItem(null);
    setFormData({
      name: '',
      category: 'BREAKFAST',
      price: '',
      isActive: true
    });
    setValidationErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setFormData({
      name: '',
      category: 'BREAKFAST',
      price: '',
      isActive: true
    });
    setValidationErrors({});
  };

  const getCategoryBadge = (category) => {
    const colors = {
      BREAKFAST: 'warning',
      LUNCH: 'info',
      DINNER: 'primary',
      SNACK: 'secondary'
    };
    return colors[category] || 'secondary';
  };

  const getStatusBadge = (isActive) => {
    return isActive ? 'success' : 'danger';
  };

  const formatPrice = (price) => {
    return `₹${price}`;
  };

  const getCreatorName = (createdBy) => {
    if (!createdBy) return 'System';
    if (typeof createdBy === 'object') {
      return createdBy.fullName || 'User';
    }
    return 'User';
  };

  const getCategoryIcon = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.icon : <FaUtensils />;
  };

  return (
    <Layout>
      <Container fluid>
        <Row className="mb-4">
          <Col>
            <h2 className="text-orange"><FaUtensils className="me-2" /> Food Items</h2>
            <p className="text-muted">Manage food menu items and prices</p>
          </Col>
          <Col className="text-end">
            <Button 
              variant="orange" 
              onClick={handleAddNew}
              className="px-4 d-inline-flex align-items-center"
            >
              <FaPlus className="me-2" /> Add Food Item
            </Button>
          </Col>
        </Row>

        {/* Error Modal (instead of top error alert) */}
        <Modal show={showErrorModal} onHide={() => setShowErrorModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title className="text-danger">
              <FaExclamationTriangle className="me-2" /> Error
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>{errorModalMessage}</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" onClick={() => setShowErrorModal(false)}>
              OK
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Success Message (still a dismissible alert) */}
        {success && (
          <Alert variant="success" onClose={() => setSuccess('')} dismissible>
            <strong><FaCheckCircle className="me-2" /> Success:</strong> {success}
          </Alert>
        )}

        <Card className="shadow-sm mb-4">
          <Card.Body>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label><FaFilter className="me-1" /> Category</Form.Label>
                  <Form.Select 
                    value={filter.category}
                    onChange={(e) => setFilter({...filter, category: e.target.value})}
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label><FaToggleOn className="me-1" /> Status</Form.Label>
                  <Form.Select 
                    value={filter.isActive}
                    onChange={(e) => setFilter({...filter, isActive: e.target.value})}
                  >
                    <option value="">All Status</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4} className="d-flex align-items-end">
                <Button 
                  variant="outline-secondary"
                  onClick={() => setFilter({ category: '', isActive: '' })}
                  className="d-inline-flex align-items-center"
                >
                  <FaTimes className="me-2" /> Clear Filters
                </Button>
              </Col>
            </Row>

            <div className="mb-3">
              <small className="text-muted">
                Showing {foodItems.length} item{foodItems.length !== 1 ? 's' : ''}
                {filter.category && ` in category: ${filter.category}`}
                {filter.isActive === 'true' && ' (Active only)'}
                {filter.isActive === 'false' && ' (Inactive only)'}
              </small>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-orange" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">Loading food items...</p>
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Created By</th>
                      <th>Created At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {foodItems.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-4">
                          No food items found. 
                          {filter.category || filter.isActive ? ' Try clearing filters.' : ''}
                        </td>
                      </tr>
                    ) : (
                      foodItems.map(item => (
                        <tr key={item._id}>
                          <td>
                            <strong>{item.name}</strong>
                            <div className="text-muted small">
                              <FaIdCard className="me-1" size={10} /> ID: {item._id?.substring(item._id.length - 6)}
                            </div>
                          </td>
                          <td>
                            <Badge bg={getCategoryBadge(item.category)} className="d-inline-flex align-items-center">
                              {getCategoryIcon(item.category)} <span className="ms-1">{item.category}</span>
                            </Badge>
                          </td>
                          <td className="fw-bold">
                            <FaMoneyBillWave className="me-1" size={12} /> {formatPrice(item.price)}
                          </td>
                          <td>
                            <Badge bg={getStatusBadge(item.isActive)} className="d-inline-flex align-items-center">
                              {item.isActive ? <FaCheckCircle className="me-1" /> : <FaBan className="me-1" />}
                              {item.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td>
                            <FaUser className="me-1" size={10} /> {getCreatorName(item.createdBy)}
                          </td>
                          <td>
                            <FaCalendarAlt className="me-1" size={10} />
                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td>
                            <Dropdown>
                              <Dropdown.Toggle variant="light" size="sm">
                                Actions
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item onClick={() => handleEdit(item)} className="d-flex align-items-center">
                                  <FaEdit className="me-2" /> Edit
                                </Dropdown.Item>
                                {item.isActive && (
                                  <Dropdown.Item 
                                    onClick={() => {
                                      setSelectedItem(item);
                                      setShowDeleteModal(true);
                                    }}
                                    className="text-danger d-flex align-items-center"
                                  >
                                    <FaTrash className="me-2" /> Deactivate
                                  </Dropdown.Item>
                                )}
                              </Dropdown.Menu>
                            </Dropdown>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Add/Edit Modal with validation */}
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>
              {selectedItem ? 'Edit Food Item' : 'Add New Food Item'}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              {Object.keys(validationErrors).length > 0 && (
                <Alert variant="danger" className="mb-3">
                  <ul className="mb-0">
                    {Object.values(validationErrors).map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </Alert>
              )}
              <Form.Group className="mb-3">
                <Form.Label>Name *</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  isInvalid={!!validationErrors.name}
                  placeholder="Enter food item name"
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.name}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Category *</Form.Label>
                <Form.Select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Price (₹) *</Form.Label>
                <Form.Control
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="1"
                  step="0.01"
                  isInvalid={!!validationErrors.price}
                  placeholder="Enter price"
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.price}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  name="isActive"
                  label="Active"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant="orange" type="submit">
                {selectedItem ? 'Update' : 'Create'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Deactivation</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Are you sure you want to deactivate <strong>{selectedItem?.name}</strong>?</p>
            <small className="text-muted">
              This will make the item unavailable for new orders.
            </small>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Deactivate
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </Layout>
  );
};

export default FoodItems;