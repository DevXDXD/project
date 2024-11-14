// CampaignList.js

import React, { useState, useEffect } from 'react';
import { getCampaigns, deleteCampaign } from '../../services/api';
import './CampaignList.css';

const CampaignList = () => {
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const campaignsData = await getCampaigns();
        setCampaigns(campaignsData.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCampaigns();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this campaign?");
    if (confirmDelete) {
      try {
        await deleteCampaign(id);
        setCampaigns(campaigns.filter(campaign => campaign._id !== id)); // Update state after deletion
      } catch (err) {
        console.error("Error deleting campaign:", err);
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
          {campaigns.map((campaign) => (
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
                <button onClick={() => handleDelete(campaign._id)} className="delete-button">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CampaignList;
