import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const createCustomer = (customerData) => api.post('/customers', customerData);

export const createOrder = (orderData) => {
  const googleId = localStorage.getItem('googleId'); // Retrieve googleId from local storage
  if (!googleId) {
    return Promise.reject(new Error('googleId not found. Please log in again.'));
  }
  return api.post('/orders', { ...orderData, googleId }); // Include googleId in the payload
};

export const createAudience = (audienceData) => api.post('/campaigns/audience', audienceData);
export const getCampaigns = (googleId) => api.get(`/campaigns?googleId=${googleId}`);
export const deleteCampaign = (id) => api.delete(`/campaigns/${id}`);
