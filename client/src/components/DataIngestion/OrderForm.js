import React, { useState } from 'react';
import { createOrder } from '../../services/api';
import { FaShoppingCart } from 'react-icons/fa'; // Import icon
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
    const newErrors = validate();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // Call createOrder API with customerId and amount
      const response = await createOrder({
        customerId: customerId.trim(),
        amount: parseFloat(amount),
      });

      alert(response.data.message); // Show success message
      setCustomerId('');
      setAmount('');
      setErrors({});
    } catch (err) {
      console.error('Error creating order:', err);
      alert('An error occurred while creating the order. Please try again.');
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit} className="form">
        {/* Add Icon */}
        <div className="icon-container">
          <FaShoppingCart className="icon" />
        </div>

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
        <button type="submit" className="button">Create Order</button>
      </form>
    </div>
  );
};

export default OrderForm;
