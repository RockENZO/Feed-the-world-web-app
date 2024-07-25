const express = require('express');
const router = express.Router();
var bodyParser = require('body-parser');
const mysql = require('mysql2');
const path = require('path');

router.use(bodyParser.json());

const connection = mysql.createConnection({
    host: 'localhost',
    database: 'usermanagement',
});

// Fetch branches and their users
router.get('/', (req, res) => {
    const sql = `
        SELECT
            Branches.branch_id, Branches.name AS branch_name,
            Users.user_id, Users.username AS user_name, Users.role
        FROM
            Branches
        LEFT JOIN
            UserBranches ON Branches.branch_id = UserBranches.branch_id
        LEFT JOIN
            Users ON UserBranches.user_id = Users.user_id
    `;
    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Error fetching branches:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            const branches = {};
            results.forEach(row => {
                if (!branches[row.branch_id]) {
                    branches[row.branch_id] = {
                        branch_id: row.branch_id,
                        name: row.branch_name,
                        users: []
                    };
                }
                if (row.user_id) {
                    branches[row.branch_id].users.push({
                        user_id: row.user_id,
                        name: row.user_name,
                        role: row.role
                    });
                }
            });
            res.json(Object.values(branches));
        }
    });
});

//add a branches
router.post('/', (req, res) => {
    const { name } = req.body;
    const sql = 'INSERT INTO Branches (name) VALUES (?)';
    connection.query(sql, [name], (error, results) => {
        if (error) {
            console.error('Error adding branch:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json({ success: true });
        }
    });
});

// Remove a branch
router.delete('/:id', (req, res) => {
    const branchId = req.params.id;
    connection.query('DELETE FROM UserBranches WHERE branch_id = ?', [branchId], (error, results) => {
        if (error) {
            console.error('Error removing related users from branch:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            const sql = 'DELETE FROM Branches WHERE branch_id = ?';
            connection.query(sql, [branchId], (error, results) => {
                if (error) {
                    console.error('Error removing branch:', error);
                    res.status(500).json({ error: 'Internal Server Error' });
                } else {
                    res.json({ success: true });
                }
            });
        }
    });
});

// Endpoint to add user to a branch
router.post('/:branch_id/users', (req, res) => {
    const { name, role, email } = req.body;
    const branchId = req.params.branch_id;

    // Insert the new user into the Users table
    const insertUserQuery = 'INSERT INTO Users (name, role, email) VALUES (?, ?, ?)';
    connection.query(insertUserQuery, [name, role, email], (err, results) => {
        if (err) {
            console.error('Error inserting user:', err);
            res.status(500).send('Error inserting user');
            return;
        }

        const newUserId = results.insertId;

        // Insert the user into the UserBranches table
        const insertUserBranchQuery = 'INSERT INTO UserBranches (user_id, branch_id) VALUES (?, ?)';
        connection.query(insertUserBranchQuery, [newUserId, branchId], (err, results) => {
            if (err) {
                console.error('Error inserting user into branch:', err);
                res.status(500).send('Error inserting user into branch');
                return;
            }

            res.status(200).send('User added to branch successfully');
        });
    });
});
// Endpoint to remove user from a branch
router.delete('/:branchId/users/:userId', (req, res) => {
    const { branchId, userId } = req.params;
    connection.query('DELETE FROM UserBranches WHERE user_id = ? AND branch_id = ?', [userId, branchId], (error, results) => {
        if (error) {
            console.error('Error removing user from branch:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json({ success: true });
        }
    });
});

module.exports = router;