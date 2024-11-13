import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const createCustomer = (customerData) => api.post('/customers', customerData);
export const createOrder = (orderData) => api.post('/orders', orderData);
export const createAudience = (audienceData) => api.post('/campaigns/audience', audienceData);
export const getCampaigns = () => api.get('/campaigns/')