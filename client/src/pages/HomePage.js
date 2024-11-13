// components/HomePage.js
import React from 'react';
import './HomePage.css'; // Import the CSS file for HomePage styling
import { FaUserPlus, FaClipboardList, FaUsers, FaListAlt } from 'react-icons/fa'; // Import icons

const HomePage = () => {
  return (
    <div className="home-page">
      <h1 className="home-page-title">Welcome to the Mini- CRM Application</h1>
      <p className="home-page-intro">Here's how you can use the application:</p>
      <ul className="home-page-list">
        <li>
          <FaUserPlus className="icon" />
          <div className="content">
            <strong>Create Customer Button:</strong> To create a new user.
          </div>
        </li>
        <li>
          <FaClipboardList className="icon" />
          <div className="content">
            <strong>Create Order Button:</strong> Create an order based on a user. Collects total spend, number of visits, and last visited metrics.
          </div>
        </li>
        <li>
          <FaUsers className="icon" />
          <div className="content">
            <strong>Create Audience Button:</strong> To create a campaign based on an audience of customers with the following criteria:
            <ul className="nested-list">
              <li>Customers with total spends &gt; INR 10,000</li>
              <li>Customers with total spends &gt; INR 10,000 AND max number of visits are 3</li>
              <li>Customers not visited in the last 3 months</li>
            </ul>
            The user should be able to add multiple rules on different available fields and perform AND/OR operations between them. Before saving the audience, they should be able to click a button and check the audience size. Upon saving the audience, step B should happen, and the user should be taken to a screen with a list of past campaigns with the latest campaign on top.
          </div>
        </li>
        <li>
          <FaListAlt className="icon" />
          <div className="content">
            <strong>Campaign List Button:</strong> For seeing data of all campaigns created till now with their details.
          </div>
        </li>
      </ul>
    </div>
  );
};

export default HomePage;
