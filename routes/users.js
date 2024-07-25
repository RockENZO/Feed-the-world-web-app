var express = require('express');
var router = express.Router();
const xss = require('xss-clean');



var bodyParser = require('body-parser');
const mysql = require('mysql2');
const path = require('path');

const pool = mysql.createConnection({
    host: 'localhost',
    database: 'usermanagement',
});
// Serve static files from the 'public' folder
router.use(express.static(path.join(__dirname, '../Public')));
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../Public/users.html'));
});

router.get('/', (req, res) => {
    const sqlUsers = 'SELECT Users.username, Users.role, Branches.name AS branch_name FROM Branches LEFT JOIN UserBranches ON Branches.branch_id = UserBranches.branch_id LEFT JOIN Users ON UserBranches.user_id = Users.user_id';
    const sqlBranches = 'SELECT * FROM Branches';
    req.pool.query(sqlUsers, (errorUsers, resultsUsers) => {
        if (errorUsers) {
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            req.pool.query(sqlBranches, (errorBranches, resultsBranches) => {
                if (errorBranches) {
                    res.status(500).json({ error: 'Internal Server Error' });
                } else {
                    res.render('users', { users: resultsUsers, branches: resultsBranches }); // Render users.html with both users and branches data
                }
            });
        }
    });
});

router.use(bodyParser.json());







// Endpoint to add an existing user to a branch
router.post('/branches/:branchId/users', (req, res) => {
    const branchId = req.params.branchId;
    const { user_id } = req.body;
    pool.query('INSERT INTO UserBranches (branch_id, user_id) VALUES (?, ?)', [branchId, user_id], (error, results) => {
        if (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json({ success: true });
        }
    });
});

// Endpoint to update user role
router.put('/:id', (req, res) => {
    const userId = req.params.id;
    const { role } = req.body;
    pool.query('UPDATE Users SET role = ? WHERE user_id = ?', [role, userId], (error, results) => {
        if (error) {
            // console.error('Error updating user role:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json({ success: true });
        }
    });
});

// Endpoint to delete a user from a branch
router.delete('/:branchId/users/:userId', (req, res) => {
    const branchId = req.params.branchId;
    const userId = req.params.userId;
    pool.query('DELETE FROM UserBranches WHERE branch_id = ? AND user_id = ?', [branchId, userId], (error, results) => {
        if (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json({ success: true });
        }
    });
});

module.exports = router;
