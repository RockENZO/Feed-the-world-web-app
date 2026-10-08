# Feed the World — Volunteer Organisation Web App

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
A four-person University of Adelaide web/database coursework project built with Express, MySQL and vanilla HTML/CSS/JavaScript. This website serves as a space for a volunteer organization to create posts, events, and gain members. Users can sign up, join locations, see events, view posts, and change their details. Managers can create posts and events, while admins can edit user roles and create branches.

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
- Argon2 password hashing and Google login integration

## Prerequisites

- Node.js and npm; a version/pinned runtime matrix is not published.
- A local MySQL server and a dedicated disposable development database.
- Optional Google OAuth configuration for third-party login.

## Installation and current configuration

```bash
git clone https://github.com/RockENZO/Feed-the-world-web-app.git
cd Feed-the-world-web-app
npm ci
```

Start MySQL using your platform’s service manager. The app attempts `service mysql start`, which is Linux-specific; start MySQL separately on other platforms. Import the actual root-level schema:

```bash
mysql -u YOUR_DATABASE_USER -p < usermanagement.sql
```

**Use a disposable local database:** this file creates/uses `usermanagement`, drops existing application tables and inserts demonstration rows. It is not a migration or a safe update command for existing data.

Configure the database pool in `app.js` to match that local database/user. The checked-in code contains host/database settings and commented credential placeholders; it does **not** load a `.env` file or read database credentials from environment variables. Avoid committing real credentials. Google login settings also require review in the frontend/auth routes before using your own OAuth client; registration of a `.env` alone does not configure it.

## Usage

```bash
npm start
```

The npm script runs `node app.js`. Its default port is **3000**, configurable via the `PORT` environment variable. Open `http://127.0.0.1:3000/` (or your selected port). `bin/www` is a legacy alternative launcher and is not the npm entry point.

This is a coursework prototype, not a production deployment recipe. Database setup, Google login and email configuration need local verification; this README update does not establish successful startup or full authentication/security coverage.

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

