-- Use or create the database
CREATE DATABASE IF NOT EXISTS usermanagement;
USE usermanagement;

-- Drop existing tables if they exist to avoid conflicts
DROP TABLE IF EXISTS RsvpStatus;
DROP TABLE IF EXISTS Posts;
DROP TABLE IF EXISTS Events;
DROP TABLE IF EXISTS UserBranches;
DROP TABLE IF EXISTS BranchManagers;
DROP TABLE IF EXISTS Branches;
DROP TABLE IF EXISTS Users;

-- Create Users table
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(250) NOT NULL,
    role ENUM('Admin', 'Manager', 'User') NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL
);

-- Create Branches table
CREATE TABLE Branches (
    branch_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Create Branch Managers table
CREATE TABLE BranchManagers (
    user_id INT,
    branch_id INT,
    PRIMARY KEY (user_id, branch_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (branch_id) REFERENCES Branches(branch_id)
);

-- Create UserBranches table
CREATE TABLE UserBranches (
    user_id INT NOT NULL,
    branch_id INT NOT NULL,
    PRIMARY KEY (user_id, branch_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (branch_id) REFERENCES Branches(branch_id)
);

-- Create Events table
CREATE TABLE Events (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(50) NOT NULL,
    content VARCHAR(512) NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    branch_id INT NOT NULL,
    FOREIGN KEY (branch_id) REFERENCES Branches(branch_id)
);

-- Create Posts table
CREATE TABLE Posts (
    post_id INT AUTO_INCREMENT PRIMARY KEY,
    post_content VARCHAR(300),
    branch_id INT,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (branch_id) REFERENCES Branches(branch_id)
);

-- Create RSVP Status table
CREATE TABLE RsvpStatus (
    rsvp_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (event_id) REFERENCES Events(event_id)
);


-- Insert a Admin
INSERT INTO Users (user_id, username, email, password, role, first_name, last_name)
VALUES (1, 'admin', 'feedtheworld@gmail','$argon2id$v=19$m=65536,t=3,p=4$9l84ON+vqI2aPN2xbRFBRg$RHygINQfSEelSUkR+PUTBmld8Z5jY7kG/aj/KS3rSlk','Admin','N/A','N/A'), (2, 'manager', 'hello@gmail','$argon2id$v=19$m=65536,t=3,p=4$dfJt38MkZhxFMAdX4YkLsQ$BJbOAyGnffBR/NEUZxENWdZdfMniLtyWfC4f2x1KgCo','Manager','John','Smith'), (3, 'user', 'example@gmail','$argon2id$v=19$m=65536,t=3,p=4$dfJt38MkZhxFMAdX4YkLsQ$BJbOAyGnffBR/NEUZxENWdZdfMniLtyWfC4f2x1KgCo','User','Jane','Doe');

-- Insert a branch
INSERT INTO Branches
VALUES (1,'Marion'),(2,'Glenelg'),(3,'Seaford'),(4,'Belair');

-- Link user to branch
INSERT INTO UserBranches (user_id, branch_id)
VALUES (1, 1),(1, 2),(1, 3),(1, 4),(2, 1),(2, 2),(2, 3),(2, 4),(3,1);

-- Insert a post
INSERT INTO Posts (post_id, post_content, user_id, branch_id)
VALUES (1,'Welcome to Feed the World Marion', 1, 1),(2,'Welcome to Feed the World glenelg', 1, 2), (3,'Welcome to Feed the World Marion', 1, 3),(4,'Welcome to Feed the World Marion', 1, 4),(5,'Hi Marion Team Members! remember to checkout the events page :)', 1, 1);

-- Insert an event
INSERT INTO Events
VALUES (1,'Marion Food Drive','The food dirve will be open, please come by to help out','2024-05-31 06:10:33',1),(2,'Food Box Collection','From this time the food box collection will be out, please donate!','2024-06-10 01:54:02',2);

INSERT INTO BranchManagers
VALUES (1, 1),(1, 2),(1, 3),(1, 4),(2, 1),(2, 2),(2, 3),(2, 4);

-- Commit changes
COMMIT;