// components/HomePage.js
import React from 'react';
import './HomePage.css'; // Import the CSS file for HomePage styling
import { AiOutlineUserAdd, AiOutlineShoppingCart, AiOutlineTeam, AiOutlineFundProjectionScreen } from 'react-icons/ai'; // New icons from Ant Design icons

const HomePage = () => {
  return (
    <div className="home-page">
      <h1 className="home-page-title">
  Welcome to Your <span className="highlight">Mini-CRM</span> Dashboard
</h1>

      <p className="home-page-intro">Here’s how you can get started:</p>
      <ul className="home-page-list">
        <li>
          <AiOutlineUserAdd className="icon" />
          <div className="content">
            <strong>Add New Customer:</strong> Use this feature to register a new user in the system.
          </div>
        </li>
        <li>
          <AiOutlineShoppingCart className="icon" />
          <div className="content">
            <strong>Create New Order:</strong> Generate an order for a user, including metrics like total spending, visit frequency, and last visit date.
          </div>
        </li>
        <li>
          <AiOutlineTeam className="icon" />
          <div className="content">
            <strong>Build Audience Campaigns:</strong> Design campaigns by targeting customers based on specific conditions:
            <ul className="nested-list">
              <li>Customers with spending over INR 10,000</li>
              <li>Customers who spent over INR 10,000 and visited up to 3 times</li>
              <li>Customers who haven’t visited in the past 3 months</li>
            </ul>
            You can set multiple rules for different fields and combine them using AND/OR logic. Check the audience size before saving the campaign, and once saved, you’ll be redirected to a page displaying all past campaigns, with the newest one on top.
          </div>
        </li>
        <li>
          <AiOutlineFundProjectionScreen className="icon" />
          <div className="content">
            <strong>View Campaign History:</strong> Access a detailed list of all campaigns created so far, arranged chronologically.
          </div>
        </li>
      </ul>
    </div>
  );
};

export default HomePage;
