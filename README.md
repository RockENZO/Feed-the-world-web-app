# 2024 Web Application Group Project

## Table of Contents
- [About the Project](#about-the-project)
- [Team Members](#team-members)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
## About the Project
This website serves as a space for a volunteer organization to create posts, events, and gain members. Users can sign up, join locations, see events, view posts, and change their details. Managers can create posts and events, while admins can edit user roles and create branches.

## Team Members
- Leesa Trembath - a1824870
- Daniel Congedi - a1671575
- Ge Wang - a1880714
- Matthew Kleinig - a1888736

## Features
- User registration and login
- Join and leave branches
- View and create events
- Manage user roles and branches
- Secure authentication with Argon2 and Google OAuth

## Prerequisites
- Node.js
- npm
- MySQL server

## Installation
1. Clone the repository:
    ```sh
    git clone https://github.com/your-repo.git
    cd your-repo
    ```
2. Install dependencies:
    ```sh
    npm install
    ```
3. Set up the MySQL database:
    ```sh
    service mysql start
    mysql -u root -p < database.sql
    ```
4. Configure environment variables:
    - Create a `.env` file and add necessary environment variables (e.g., database credentials, OAuth client ID).

## Usage
1. Start the server:
    ```sh
    npm start
    ```
2. Open your browser and go to `127.0.0.1:8080`.

## API Documentation
### Endpoints
- **POST /login**: User login
- **POST /signup**: User registration
- **POST /logout**: User logout
- **POST /update-user**: Update user details
- **GET /userbranches**: Get branches for a user
- **POST /userbranches/:branch_id/join**: Join a branch
- **POST /userbranches/:branch_id/leave**: Leave a branch

## Contributing
1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Open a pull request.
