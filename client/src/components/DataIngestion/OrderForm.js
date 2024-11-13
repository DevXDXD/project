import React, { useState } from 'react';
import { createOrder } from '../../services/api';
import './OrderForm.css';

const OrderForm = () => {
  const [customerId, setCustomerId] = useState('');
  const [amount, setAmount] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!customerId.trim()) {
      newErrors.customerId = 'Customer ID is required';
    }

    if (!amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(amount) || parseFloat(amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Form submitted');  // Debugging statement
    const newErrors = validate();
    console.log('Validation errors:', newErrors);  // Debugging statement

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      console.log('Creating order with:', { customer: customerId, amount: parseFloat(amount) });  // Debugging statement
      await createOrder({ customerId: customerId, amount: parseFloat(amount) });
      alert('Order created successfully');
      setCustomerId('');
      setAmount('');
      setErrors({});
    } catch (err) {
      console.error('Error creating order:', err);  // Debugging statement
      alert('Error creating order');
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit} className="form">
        <h2 className="heading">Create Order</h2>
        <div className="form-group">
          <input
            type="text"
            placeholder="Customer ID"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            required
            className="input"
          />
          {errors.customerId && <div className="error">{errors.customerId}</div>}
        </div>
        <div className="form-group">
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="input"
          />
          {errors.amount && <div className="error">{errors.amount}</div>}
        </div>
        <button type="submit" className="button" disabled={Object.keys(errors).length > 0}>Create Order</button>
      </form>
    </div>
  );
};

export default OrderForm;
