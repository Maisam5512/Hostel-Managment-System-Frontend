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

  const [formData, setFormData] = useState({
    name: '',
    category: 'BREAKFAST',
    price: '',
    isActive: true
  });

  const categories = [
    { value: 'BREAKFAST', label: 'Breakfast' },
    { value: 'LUNCH', label: 'Lunch' },
    { value: 'DINNER', label: 'Dinner' },
    { value: 'SNACK', label: 'Snack' }
  ];

  const fetchFoodItems = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter.category) params.category = filter.category;
      if (filter.isActive !== '') params.isActive = filter.isActive;
      
      //console.log('🔍 Fetching food items with params:', params);
      const response = await foodItemService.getAll(params);
      //console.log('📦 API Response:', response);
      
      // Handle different response structures
      let items = [];
      if (response && response.success) {
        items = response.data || [];
      } else if (Array.isArray(response)) {
        items = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        items = response.data;
      }
      
      //console.log('📊 Setting food items:', items);
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');

      if (!formData.name.trim()) {
        setError('Food item name is required');
        return;
      }
      if (!formData.price || formData.price <= 0) {
        setError('Valid price is required');
        return;
      }

      //console.log('📤 Submitting form data:', formData);
      
      let response;
      if (selectedItem) {
        response = await foodItemService.update(selectedItem._id, formData);
        //console.log('✏️ Update response:', response);
        setSuccess(response.message || 'Food item updated successfully');
      } else {
        response = await foodItemService.create(formData);
        //console.log('➕ Create response:', response);
        setSuccess(response.message || 'Food item created successfully');
        
        // Check if we have the created item in response
        if (response.data) {
          //console.log('🆕 New item created:', response.data);
          // Add to local state immediately
          setFoodItems(prev => [response.data, ...prev]);
        }
      }

      // Close modal
      handleCloseModal();
      
      // Refresh from server after 500ms to ensure consistency
      setTimeout(() => {
        fetchFoodItems();
      }, 500);
      
    } catch (err) {
      console.error('❌ Submit error:', err);
      console.error('❌ Error details:', err.response?.data);
      setError(err.response?.data?.message || err.message || 'Operation failed');
    }
  };

  const handleEdit = (item) => {
   // console.log('✏️ Editing item:', item);
    setSelectedItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price,
      isActive: item.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      //console.log('🗑️ Deleting item:', selectedItem._id);
      const response = await foodItemService.delete(selectedItem._id);
      //console.log('🗑️ Delete response:', response);
      
      if (response.success) {
        setSuccess(response.message || 'Food item deactivated successfully');
        
        // Update local state
        setFoodItems(prev => 
          prev.map(item => 
            item._id === selectedItem._id 
              ? { ...item, isActive: false } 
              : item
          )
        );
        
        setShowDeleteModal(false);
        setSelectedItem(null);
        
        // Refresh from server
        setTimeout(() => fetchFoodItems(), 300);
      } else {
        setError(response.message || 'Failed to deactivate food item');
      }
    } catch (err) {
      console.error('❌ Delete error:', err);
      setError('Failed to deactivate food item');
    }
  };

  const handleAddNew = () => {
   // console.log('➕ Adding new item');
    setSelectedItem(null);
    setFormData({
      name: '',
      category: 'BREAKFAST',
      price: '',
      isActive: true
    });
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

  return (
    <Layout>
      <Container fluid>
        <Row className="mb-4">
          <Col>
            <h2 className="text-orange">🍽️ Food Items</h2>
            <p className="text-muted">Manage food menu items and prices</p>
          </Col>
          <Col className="text-end">
            <Button 
              variant="orange" 
              onClick={handleAddNew}
              className="px-4"
            >
              + Add Food Item
            </Button>
          </Col>
        </Row>

        {error && (
          <Alert variant="danger" onClose={() => setError('')} dismissible>
            <strong>Error:</strong> {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" onClose={() => setSuccess('')} dismissible>
            <strong>Success:</strong> {success}
          </Alert>
        )}

        <Card className="shadow-sm mb-4">
          <Card.Body>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Category</Form.Label>
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
                  <Form.Label>Status</Form.Label>
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
                >
                  Clear Filters
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
                              ID: {item._id?.substring(item._id.length - 6)}
                            </div>
                          </td>
                          <td>
                            <Badge bg={getCategoryBadge(item.category)}>
                              {item.category}
                            </Badge>
                          </td>
                          <td className="fw-bold">
                            {formatPrice(item.price)}
                          </td>
                          <td>
                            <Badge bg={getStatusBadge(item.isActive)}>
                              {item.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td>
                            {getCreatorName(item.createdBy)}
                          </td>
                          <td>
                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td>
                            <Dropdown>
                              <Dropdown.Toggle variant="light" size="sm">
                                Actions
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item onClick={() => handleEdit(item)}>
                                  ✏️ Edit
                                </Dropdown.Item>
                                {item.isActive && (
                                  <Dropdown.Item 
                                    onClick={() => {
                                      setSelectedItem(item);
                                      setShowDeleteModal(true);
                                    }}
                                    className="text-danger"
                                  >
                                    🗑️ Deactivate
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

        {/* Add/Edit Modal */}
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>
              {selectedItem ? 'Edit Food Item' : 'Add New Food Item'}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Name *</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter food item name"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Category *</Form.Label>
                <Form.Select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
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
                  required
                  min="1"
                  step="0.01"
                  placeholder="Enter price"
                />
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
            Are you sure you want to deactivate <strong>{selectedItem?.name}</strong>?
            <br />
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