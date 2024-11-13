import React, { useState } from 'react';
import { createCustomer } from '../../services/api';
import './CustomerForm.css';

const CustomerForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailPattern.test(email)) {
      newErrors.email = 'Email is invalid';
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
      await createCustomer({ name, email });
      alert('Customer created successfully');
      setName('');
      setEmail('');
      setErrors({});
    } catch (err) {
      alert('Error creating customer');
      console.error(err);
    }
  };

  return (
    <div className="centered-container">
      <h1 className="heading">Create Customer</h1>
      <form onSubmit={handleSubmit} className="customer-form">
        <div className="form-group">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="input-field"
          />
          {errors.name && <div className="error">{errors.name}</div>}
        </div>

        <div className="form-group">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-field"
          />
          {errors.email && <div className="error">{errors.email}</div>}
        </div>

        <button type="submit" className="submit-button">Create Customer</button>
      </form>
    </div>
  );
};

export default CustomerForm;
