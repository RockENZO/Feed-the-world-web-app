# Template Repository for COMP SCI 2207/7207 Web & Database Computing (2023 Semester 1)

Contains environment files for WDC 2023. Copy this template for a general sandbox.

Auto commit/push/sync to Github is disabled by default in this template repository.
Enable the GitDoc extension to use this fucntionality (either in your VSCode settings, or in the Dev Container settings)

# 2024 Web Application Group Project
UG_Group 1 - single-organization approach
- Leesa Trembath - a1824870
- Daniel Congedi - a1671575
- Ge Wang - a1880714
- Matthew Kleinig - a1888736

# About the Project
This website serves as a space for a volunteer organisation to create posts, events and gain members.
On this website you can sign up as a new user and join locations for organisation where they can volunteer.
A member can join different locations, see events for those locations, view posts from organisations and change their user details.
Managers can create posts and events for users to see.
Admins can edit users roles and create branches.


# Starting the server
Run the following commands:
```code
service mysql start
npm start
```

After a while, the server will be available. Go to 127.0.0.1:8080 for the home page.
At the top of the screen, you can navigate to different pages and login.

# Note on mysql2
Some of us were having issues using mysql. It came with the following error message:
```code
Error connecting to MySQL: Error: ER_NOT_SUPPORTED_AUTH_MODE: Client does not support authentication protocol requested by server; consider upgrading MySQL client
```
Since we don't know what caused it or how to fix it, and mysql2 works for all of us, we used that.

# Users
```
Users in database:
Admin role:
Username: admin
Password: admin123

Manager role:
Username: manager
Password: hell0

Normal user role:
Username: user
Password: hello
```
