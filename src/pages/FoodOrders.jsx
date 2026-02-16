import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Row, Col, Card, Table, Button, Form, Modal, Alert,
  Badge, Dropdown, Tab, Nav
} from 'react-bootstrap';
import Layout from '../components/layout/Layout';
import { foodOrderService } from '../services/foodOrderService';
import { foodItemService } from '../services/foodItemService';
import { memberService } from '../services/memberService';
import { useAuth } from '../context/AuthContext';

const FoodOrders = () => {
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [members, setMembers] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingFoodItems, setLoadingFoodItems] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isUpdatingBilling, setIsUpdatingBilling] = useState(false);

  // Field‑specific validation errors
  const [fieldErrors, setFieldErrors] = useState({
    member: '',
    foodItems: ''
  });

  const [orderForm, setOrderForm] = useState({
    member: '',
    foodItems: [{ foodItemId: '', quantity: 1 }],
    remarks: ''
  });

  /* ================= FETCHERS ================= */

  const fetchFoodItemsForOrder = useCallback(async () => {
    try {
      setLoadingFoodItems(true);
      const res = await foodItemService.getAll({ isActive: true });
      setFoodItems(res?.data || res || []);
    } catch (e) {
      console.error(e);
      setError('Failed to load food items');
    } finally {
      setLoadingFoodItems(false);
    }
  }, []);

  const fetchMembers = useCallback(async () => {
    try {
      const res = await memberService.getAllMembers();
      const list = res?.data || res || [];
      setMembers(list.filter(m => m.isActive));
    } catch (e) {
      console.error(e);
      setError('Failed to load members');
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = {};
      if (activeTab === 'billed') params.isBilled = 'true';
      if (activeTab === 'unbilled') params.isBilled = 'false';

      const res = await foodOrderService.getAll(params);

      if (res && res.success && Array.isArray(res.data)) {
        setOrders(res.data);
      } else if (Array.isArray(res)) {
        setOrders(res);
      } else {
        setOrders([]);
      }
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchOrders();
    fetchMembers();
  }, [fetchOrders, fetchMembers]);

  useEffect(() => {
    if (showOrderModal) {
      fetchFoodItemsForOrder();
    }
  }, [showOrderModal, fetchFoodItemsForOrder]);

  /* ================= CREATE ORDER - VALIDATED ================= */

  const handleCreateOrder = async (e) => {
    e.preventDefault();

    // Reset field errors
    setFieldErrors({ member: '', foodItems: '' });

    try {
      setError('');
      setSuccess('');
      setIsCreatingOrder(true);

      // Validation
      const errors = { member: '', foodItems: '' };
      let isValid = true;

      if (!orderForm.member) {
        errors.member = 'Please select a member';
        isValid = false;
      }

      const validItems = orderForm.foodItems.filter(
        i => i.foodItemId && i.quantity > 0
      );

      if (validItems.length === 0) {
        errors.foodItems = 'Please add at least one food item';
        isValid = false;
      }

      if (!isValid) {
        setFieldErrors(errors);
        setIsCreatingOrder(false);
        return;
      }

      // Create order payload
      const orderPayload = {
        member: orderForm.member,
        foodItems: validItems,
        remarks: orderForm.remarks || ''
      };

      // Create order
      const response = await foodOrderService.create(orderPayload);

      // Handle response based on API structure
      const isSuccess = response?.success || 
                       (response && !response.message?.toLowerCase().includes('error'));

      if (!isSuccess) {
        const errorMsg = response?.message || 'Failed to create order';
        setError(errorMsg);
        setIsCreatingOrder(false);
        return;
      }

      // Success handling
      setSuccess(response?.message || 'Order created successfully');
      
      // Reset form
      setOrderForm({
        member: '',
        foodItems: [{ foodItemId: '', quantity: 1 }],
        remarks: ''
      });

      // Close modal after a brief delay to show success message
      setTimeout(() => {
        setShowOrderModal(false);
        fetchOrders(); // Refresh orders
      }, 1500);

    } catch (err) {
      console.error('Order creation error:', err);
      
      let errorMessage = 'Failed to create order';
      if (err.response) {
        const serverError = err.response.data;
        if (serverError?.message) {
          errorMessage = serverError.message;
        } else if (typeof serverError === 'string') {
          errorMessage = serverError;
        }
      } else if (err.request) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setError(errorMessage);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  /* ================= BILLING UPDATE ================= */

  const handleUpdateBilling = async () => {
    try {
      if (!selectedOrder) return;
      
      setError('');
      setSuccess('');
      setIsUpdatingBilling(true);

      const newStatus = !selectedOrder.isBilled;

      // Update billing status
      const response = await foodOrderService.updateBillingStatus(
        selectedOrder._id,
        newStatus
      );

      // Handle response
      const isSuccess = response?.success || 
                       (response && !response.message?.toLowerCase().includes('error'));

      if (!isSuccess) {
        const errorMsg = response?.message || 'Failed to update billing status';
        setError(errorMsg);
        setIsUpdatingBilling(false);
        return;
      }

      // Update local state immediately for better UX
      setOrders(prev =>
        prev.map(order =>
          order._id === selectedOrder._id
            ? { ...order, isBilled: newStatus }
            : order
        )
      );

      setSuccess(`Order ${newStatus ? 'marked as billed' : 'marked as unbilled'} successfully`);
      
      // Close modal and refresh data
      setTimeout(() => {
        setShowBillingModal(false);
        setSelectedOrder(null);
        fetchOrders(); // Refresh to ensure consistency
      }, 1500);

    } catch (err) {
      console.error('Billing update error:', err);
      
      let errorMessage = 'Failed to update billing status';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsUpdatingBilling(false);
    }
  };

  /* ================= FORM HANDLERS ================= */

  const handleAddOrder = () => {
    setError('');
    setSuccess('');
    setFieldErrors({ member: '', foodItems: '' });
    setOrderForm({
      member: '',
      foodItems: [{ foodItemId: '', quantity: 1 }],
      remarks: ''
    });
    setShowOrderModal(true);
  };

  const handleOrderInputChange = (e) => {
    const { name, value } = e.target;
    setOrderForm(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFoodItemChange = (index, field, value) => {
    setOrderForm(prev => {
      const updatedItems = [...prev.foodItems];

      if (field === 'quantity') {
        const qty = parseInt(value, 10);
        updatedItems[index][field] = qty > 0 ? qty : 1;
      } else {
        updatedItems[index][field] = value;
      }

      return {
        ...prev,
        foodItems: updatedItems
      };
    });
    // Clear global food items error when user changes an item
    if (fieldErrors.foodItems) {
      setFieldErrors(prev => ({ ...prev, foodItems: '' }));
    }
  };

  const addFoodItemRow = () => {
    setOrderForm(prev => ({
      ...prev,
      foodItems: [...prev.foodItems, { foodItemId: '', quantity: 1 }]
    }));
    // Clear global food items error when adding a row
    if (fieldErrors.foodItems) {
      setFieldErrors(prev => ({ ...prev, foodItems: '' }));
    }
  };

  const removeFoodItemRow = (index) => {
    setError('');

    setOrderForm(prev => {
      if (prev.foodItems.length <= 1) {
        setFieldErrors(prev => ({ ...prev, foodItems: 'At least one food item is required' }));
        return prev;
      }

      const newItems = prev.foodItems.filter((_, i) => i !== index);
      // After removal, if there are still valid items, clear the error
      const hasValid = newItems.some(i => i.foodItemId && i.quantity > 0);
      if (hasValid) {
        setFieldErrors(prev => ({ ...prev, foodItems: '' }));
      } else {
        setFieldErrors(prev => ({ ...prev, foodItems: 'Please add at least one food item' }));
      }

      return {
        ...prev,
        foodItems: newItems
      };
    });
  };

  /* ================= HELPER FUNCTIONS ================= */

  const getTotalAmount = (order) => {
    if (!order || !order.foodItems) return 0;
    return order.foodItems.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0
    );
  };

  const getStatusBadge = (isBilled) => {
    return isBilled ? 'success' : 'warning';
  };

  const getMemberName = (m) => {
    if (!m) return 'N/A';
    if (typeof m === 'object') {
      return m.fullName || m.memberCode || 'N/A';
    }
    return 'N/A';
  };

  const getMemberCode = (m) => {
    if (!m) return '';
    if (typeof m === 'object') {
      return m.memberCode || '';
    }
    return '';
  };

  const getOrderedByName = (u) => {
    if (!u) return 'N/A';
    if (typeof u === 'object') {
      return u.fullName || 'N/A';
    }
    return 'N/A';
  };

  const formatDate = (d) => {
    if (!d) return 'N/A';
    try {
      return new Date(d).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const getCategoryBadge = (c) => {
    const colors = {
      BREAKFAST: 'warning',
      LUNCH: 'info',
      DINNER: 'primary',
      SNACK: 'secondary'
    };
    return colors[c] || 'secondary';
  };

  const calculateCurrentOrderTotal = () => {
    return orderForm.foodItems.reduce((total, item) => {
      const foodItem = foodItems.find(f => f._id === item.foodItemId);
      return foodItem ? total + (foodItem.price || 0) * (item.quantity || 1) : total;
    }, 0);
  };

  /* ================= RENDER ================= */

  return (
    <Layout>
      <Container fluid>
        <Row className="mb-4">
          <Col>
            <h2 className="text-orange">🍽️ Food Orders</h2>
            <p className="text-muted">Manage food orders and billing</p>
          </Col>
          <Col className="text-end">
            <Button
              variant="orange"
              onClick={handleAddOrder}
              className="px-4"
              disabled={loading}
            >
              + New Order
            </Button>
          </Col>
        </Row>

        {/* Error Alert */}
        {error && (
          <Alert variant="danger" onClose={() => setError('')} dismissible>
            <div className="d-flex align-items-center">
              <span className="me-2">❌</span>
              <div>
                <strong>Error:</strong> {error}
              </div>
            </div>
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert variant="success" onClose={() => setSuccess('')} dismissible>
            <div className="d-flex align-items-center">
              <span className="me-2">✅</span>
              <div>
                <strong>Success:</strong> {success}
              </div>
            </div>
          </Alert>
        )}

        {/* Orders Table */}
        <Card className="shadow-sm mb-4">
          <Card.Body>
            <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
              <Nav variant="tabs" className="mb-4">
                <Nav.Item>
                  <Nav.Link eventKey="all">All Orders</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="unbilled">Unbilled</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="billed">Billed</Nav.Link>
                </Nav.Item>
              </Nav>

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-orange" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2 text-muted">Loading orders...</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Member</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Order Date</th>
                        <th>Ordered By</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(!orders || orders.length === 0) ? (
                        <tr>
                          <td colSpan="8" className="text-center py-4">
                            <div className="text-muted">
                              <p className="mb-1">No orders found</p>
                              <small>Create your first order using the "New Order" button</small>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        orders.map(order => (
                          <tr key={order._id}>
                            <td className="text-muted">
                              <small>#{order._id?.substring(order._id.length - 6) || 'N/A'}</small>
                            </td>
                            <td>
                              <div>
                                <strong>{getMemberName(order.member)}</strong>
                                <br />
                                <small className="text-muted">
                                  {getMemberCode(order.member)}
                                </small>
                              </div>
                            </td>
                            <td>
                              {order.foodItems && order.foodItems.length > 0 ? (
                                <>
                                  <div className="d-flex flex-wrap gap-1">
                                    {order.foodItems.slice(0, 3).map((item, idx) => (
                                      <Badge
                                        key={idx}
                                        bg={getCategoryBadge(item.category)}
                                        className="me-1 mb-1"
                                      >
                                        {item.name || 'Unnamed'} × {item.quantity || 1}
                                      </Badge>
                                    ))}
                                    {order.foodItems.length > 3 && (
                                      <Badge bg="secondary" className="mb-1">
                                        +{order.foodItems.length - 3} more
                                      </Badge>
                                    )}
                                  </div>
                                  {order.remarks && (
                                    <small className="text-muted d-block mt-1">
                                      <span className="me-1">📝</span>
                                      {order.remarks}
                                    </small>
                                  )}
                                </>
                              ) : (
                                <span className="text-muted">No items</span>
                              )}
                            </td>
                            <td className="fw-bold text-success">
                              ₹{getTotalAmount(order)}
                            </td>
                            <td>
                              <Badge bg={getStatusBadge(order.isBilled)}>
                                {order.isBilled ? 'Billed' : 'Pending'}
                              </Badge>
                            </td>
                            <td>
                              <small>{formatDate(order.orderDate)}</small>
                            </td>
                            <td>
                              <small>{getOrderedByName(order.orderedBy)}</small>
                            </td>
                            <td>
                              <Dropdown>
                                <Dropdown.Toggle variant="light" size="sm">
                                  Actions
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                  {!order.isBilled ? (
                                    <Dropdown.Item 
                                      onClick={() => {
                                        setSelectedOrder(order);
                                        setShowBillingModal(true);
                                      }}
                                    >
                                      ✅ Mark as Billed
                                    </Dropdown.Item>
                                  ) : (
                                    <Dropdown.Item 
                                      onClick={() => {
                                        setSelectedOrder(order);
                                        setShowBillingModal(true);
                                      }}
                                    >
                                      ↩️ Mark as Unbilled
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
            </Tab.Container>
          </Card.Body>
        </Card>

        {/* Order Creation Modal with validation feedback */}
        <Modal 
          show={showOrderModal} 
          onHide={() => !isCreatingOrder && setShowOrderModal(false)} 
          size="lg"
          backdrop={isCreatingOrder ? 'static' : true}
          keyboard={!isCreatingOrder}
        >
          <Modal.Header closeButton={!isCreatingOrder}>
            <Modal.Title>Create Food Order</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleCreateOrder}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Select Member *</Form.Label>
                <Form.Select
                  name="member"
                  value={orderForm.member}
                  onChange={handleOrderInputChange}
                  required
                  disabled={loadingFoodItems || isCreatingOrder}
                  isInvalid={!!fieldErrors.member}
                >
                  <option value="">Choose member...</option>
                  {members.map(member => (
                    <option key={member._id} value={member._id}>
                      {member.memberCode} - {member.fullName}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {fieldErrors.member}
                </Form.Control.Feedback>
              </Form.Group>

              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Form.Label className="mb-0">Food Items *</Form.Label>
                  <Button
                    variant="outline-success"
                    size="sm"
                    type="button"
                    onClick={addFoodItemRow}
                    disabled={loadingFoodItems || isCreatingOrder}
                  >
                    + Add Item
                  </Button>
                </div>

                {fieldErrors.foodItems && (
                  <Alert variant="danger" className="py-2 mb-2">
                    <small>{fieldErrors.foodItems}</small>
                  </Alert>
                )}

                {loadingFoodItems ? (
                  <div className="text-center py-3">
                    <div className="spinner-border spinner-border-sm text-orange" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <small className="text-muted">Loading food items...</small>
                  </div>
                ) : foodItems.length === 0 ? (
                  <Alert variant="warning">
                    No active food items found. Please add food items first.
                  </Alert>
                ) : (
                  <>
                    {orderForm.foodItems.map((item, index) => (
                      <Row key={index} className="mb-2 align-items-center">
                        <Col md={7}>
                          <Form.Select
                            value={item.foodItemId}
                            onChange={(e) => handleFoodItemChange(index, 'foodItemId', e.target.value)}
                            required={index === 0}
                            disabled={loadingFoodItems || isCreatingOrder}
                          >
                            <option value="">Select food item...</option>
                            {foodItems.map(food => (
                              <option key={food._id} value={food._id}>
                                {food.name} ({food.category}) - ₹{food.price}
                              </option>
                            ))}
                          </Form.Select>
                        </Col>
                        <Col md={3}>
                          <Form.Control
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleFoodItemChange(index, 'quantity', e.target.value)}
                            placeholder="Qty"
                            required={index === 0}
                            disabled={loadingFoodItems || isCreatingOrder}
                          />
                        </Col>
                        <Col md={2}>
                          {orderForm.foodItems.length > 1 && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => removeFoodItemRow(index)}
                              disabled={loadingFoodItems || isCreatingOrder}
                            >
                              ×
                            </Button>
                          )}
                        </Col>
                      </Row>
                    ))}
                  </>
                )}
              </div>

              <Form.Group className="mb-3">
                <Form.Label>Remarks (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="remarks"
                  value={orderForm.remarks}
                  onChange={handleOrderInputChange}
                  placeholder="Any special instructions..."
                  disabled={loadingFoodItems || isCreatingOrder}
                />
              </Form.Group>

              {!loadingFoodItems && foodItems.length > 0 && (
                <Card className="bg-light">
                  <Card.Body className="py-2">
                    <Row>
                      <Col>
                        <small>Selected Items:</small>
                        <div className="mt-1">
                          {orderForm.foodItems
                            .filter(item => item.foodItemId)
                            .map((item, idx) => {
                              const foodItem = foodItems.find(f => f._id === item.foodItemId);
                              return foodItem ? (
                                <Badge key={idx} bg="light" text="dark" className="me-1 mb-1">
                                  {foodItem.name} × {item.quantity}
                                </Badge>
                              ) : null;
                            })}
                        </div>
                      </Col>
                      <Col className="text-end">
                        <div className="fw-bold text-success">
                          Total: ₹{calculateCurrentOrderTotal()}
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowOrderModal(false)}
                disabled={isCreatingOrder}
              >
                Cancel
              </Button>
              <Button
                variant="orange"
                type="submit"
                disabled={isCreatingOrder || loadingFoodItems || foodItems.length === 0}
              >
                {isCreatingOrder ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Creating...
                  </>
                ) : (
                  'Create Order'
                )}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Billing Status Modal */}
        <Modal 
          show={showBillingModal} 
          onHide={() => !isUpdatingBilling && setShowBillingModal(false)}
          backdrop={isUpdatingBilling ? 'static' : true}
          keyboard={!isUpdatingBilling}
        >
          <Modal.Header closeButton={!isUpdatingBilling}>
            <Modal.Title>Update Billing Status</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedOrder && (
              <>
                <p>
                  Are you sure you want to mark this order as{' '}
                  <strong className={selectedOrder.isBilled ? 'text-warning' : 'text-success'}>
                    {selectedOrder.isBilled ? 'unbilled' : 'billed'}
                  </strong>?
                </p>
                <Card className="bg-light">
                  <Card.Body className="py-3">
                    <div className="mb-2">
                      <strong>Order ID:</strong>{' '}
                      <code>#{selectedOrder._id?.substring(selectedOrder._id.length - 6) || 'N/A'}</code>
                    </div>
                    <div className="mb-2">
                      <strong>Member:</strong> {getMemberName(selectedOrder.member)}
                    </div>
                    <div className="mb-2">
                      <strong>Total Amount:</strong> ₹{getTotalAmount(selectedOrder)}
                    </div>
                  </Card.Body>
                </Card>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => setShowBillingModal(false)}
              disabled={isUpdatingBilling}
            >
              Cancel
            </Button>
            <Button 
              variant="orange" 
              onClick={handleUpdateBilling}
              disabled={isUpdatingBilling}
            >
              {isUpdatingBilling ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Updating...
                </>
              ) : (
                'Confirm'
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </Layout>
  );
};

export default FoodOrders;