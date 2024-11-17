# Mini CRM Application

This is a Mini CRM (Customer Relationship Management) Application developed using the MERN (MongoDB, Express.js, React.js, Node.js) stack. The application provides features for ingesting customer and order data, creating audiences based on rules, sending campaigns to the defined audiences, and tracking campaign delivery statuses.

## Features

- **Data Ingestion**: APIs for ingesting customer and order data into the database.
- **Audience Creation**: A web application where users can create audiences based on rules such as total spend, number of visits, and last visit date. Users can combine multiple rules using AND/OR operators and check the audience size before saving.
- **Campaign Management**: Users can send personalized campaigns to the created audiences and track the delivery statuses (sent or failed) of the campaigns.
- **User Authentication**: Users can authenticate using the provided password and username.
- **Google Authentication**: Users can authenticate using their Google accounts to access the application.
- **Scalability and Performance Optimizations**: The application implements a pub/sub model using a message broker (e.g., RabbitMQ) for data ingestion and delivery receipt updates. It also supports batch processing for database operations to improve performance.

## Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Message Broker**: RabbitMQ 
- **Authentication**: Google and client Authentication with auth.service.js

## Installation

1. **Clone the repository**:

    ```bash
    git clone https://github.com/DevXDXD/project-xeno.git
    ```

2. **Install server dependencies**:

    ```bash
    cd mini-crm-app/server
    npm install
    ```

3. **Install client dependencies**:

    ```bash
    cd ../client
    npm install
    ```

4. **Set up environment variables**:
    - Create a `.env` file in the `server` directory.
    - Add the following variables:

        ```env
        MONGODB_URI=your_mongodb_connection_string
        GOOGLE_CLIENT_ID=your_google_client_id
        GOOGLE_CLIENT_SECRET=your_google_client_secret
        SESSION_SECRET=your_session_secret
        APP_USERNAME=given_username
        APP_PASSWORD=given_password
        ```

5. **Start the server**:

    ```bash
    cd ../server
    npm start
    ```

6. **Start the client**:

    ```bash
    cd ../client
    npm start
    ```

The client will be running at `http://localhost:3000` and the server at `http://localhost:5000`.

## Usage

1. **Access the application** at `http://localhost:3000`.
2. **Login** with your Google account.
3. **Ingest Data**: Use the "Create Customer" and "Create Order" sections.
4. **Create Audience**: Define rules to create a new audience.
5. **Manage Campaigns**: View past campaigns and their delivery stats in the "Campaign List" section. Send new campaigns to created audiences.

