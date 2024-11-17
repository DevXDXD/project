import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminPage.css';

const AdminPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        console.log('Fetching campaigns...'); // Debugging
        const response = await axios.get('http://localhost:5000/api/admin/campaigns');
        console.log('Campaigns fetched:', response.data); // Debugging
        setCampaigns(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching campaigns:', err);
        setError('Failed to fetch campaigns. Please try again later.');
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  if (loading) {
    return <div className="loading">Loading campaigns...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="admin-page">
      <h1>All Campaigns</h1>
      <table className="campaign-table">
        <thead>
          <tr>
            <th>Message</th>
            <th>Audience</th>
            <th>Scheduled At</th>
            <th>Sent At</th>
            <th>Status</th>
            <th>Is Automated</th>
            <th>Trigger</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign) => (
            <tr key={campaign._id}>
              <td>{campaign.message}</td>
              <td>{campaign.audience?.type || 'N/A'}</td>
              <td>{campaign.scheduledAt ? new Date(campaign.scheduledAt).toLocaleString() : 'N/A'}</td>
              <td>{campaign.sentAt ? new Date(campaign.sentAt).toLocaleString() : 'Not Sent Yet'}</td>
              <td>{campaign.status}</td>
              <td>{campaign.isAutomated ? 'Yes' : 'No'}</td>
              <td>{campaign.trigger || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPage;
