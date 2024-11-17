import React, { useState, useEffect } from 'react';
import { getCampaigns, deleteCampaign } from '../../services/api';
import './CampaignList.css';

const CampaignList = () => {
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    const fetchCampaigns = async () => {
      // Extract googleId from query params if redirected after OAuth login
      const urlParams = new URLSearchParams(window.location.search);
      const googleIdFromUrl = urlParams.get('googleId');

      if (googleIdFromUrl) {
        localStorage.setItem('googleId', googleIdFromUrl); // Store googleId in local storage
        window.history.replaceState({}, document.title, '/home'); // Remove googleId from the URL
      }

      const googleId = localStorage.getItem('googleId'); // Retrieve googleId from local storage
      if (!googleId) {
        console.error('googleId not found in localStorage.');
        return;
      }

      try {
        const campaignsData = await getCampaigns(googleId); // Pass googleId to the API call
        setCampaigns(campaignsData.data);
      } catch (err) {
        console.error('Error fetching campaigns:', err);
      }
    };

    fetchCampaigns();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this campaign?');
    if (confirmDelete) {
      try {
        await deleteCampaign(id);
        setCampaigns(campaigns.filter(campaign => campaign._id !== id)); // Update state after deletion
      } catch (err) {
        console.error('Error deleting campaign:', err);
      }
    }
  };

  return (
    <div>
      <h2 className="heading">Your Campaigns</h2>
      <table className="table">
        <thead>
          <tr>
            <th className="message-column">Message</th>
            <th className="scheduledAt-column">Scheduled At</th>
            <th className="sentAt-column">Sent At</th>
            <th>Status</th>
            <th>Audience Size</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.length > 0 ? (
            campaigns.map((campaign) => (
              <tr key={campaign._id}>
                <td className="message-column">{campaign.message}</td>
                <td className="scheduledAt-column">
                  {campaign.scheduledAt ? new Date(campaign.scheduledAt).toLocaleString() : 'N/A'}
                </td>
                <td className="sentAt-column">
                  {campaign.sentAt ? new Date(campaign.sentAt).toLocaleString() : 'Not Sent Yet'}
                </td>
                <td>{campaign.status}</td>
                <td>{campaign.audience?.length || 'N/A'}</td>
                <td>
                  <button
                    onClick={() => handleDelete(campaign._id)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="no-data">
                No campaigns found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CampaignList;
