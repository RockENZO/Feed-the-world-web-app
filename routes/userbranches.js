var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.session.user.user_id;
    req.pool.getConnection(function(err, connection) {
        if (err) {
            console.error('Error getting connection:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        const sql = `
            SELECT b.branch_id, b.name,
                   EXISTS(SELECT 1 FROM UserBranches ub WHERE ub.user_id = ? AND ub.branch_id = b.branch_id) AS is_member
            FROM Branches b;
        `;
        connection.query(sql, [userId], (error, results) => {
            connection.release();
            if (error) {
                console.error('Error fetching branches:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                res.json(results);
            }
        });
    });
});

router.post('/:branch_id/join', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('You need to be logged in to join a branch');
    }

    // Ensure branchId is treated as an integer
    const branchId = parseInt(req.params.branch_id, 10);
    const userId = req.session.user.user_id;

    const sql = 'INSERT INTO UserBranches (user_id, branch_id) VALUES (?, ?)';
    req.pool.query(sql, [userId, branchId], (error, results) => {
        if (error) {
            console.error('Error adding user to branch:', error);
            res.status(500).send('Internal Server Error');
        } else {
            // Check if the branches array exists in the session, if not, initialize it
            if (!req.session.branches) {
                req.session.branches = [];
            }
            // Add the new branch ID to the session as an integer
            req.session.branches.push(branchId);
            req.session.save(() => {  // Make sure the session is saved
                res.send('User added to branch successfully');
            });
        }
    });
});

router.post('/:branch_id/leave', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('You need to be logged in to leave a branch');
    }

    const branchId = parseInt(req.params.branch_id, 10);
    const userId = req.session.user.user_id;

    const sql = 'DELETE FROM UserBranches WHERE user_id = ? AND branch_id = ?';
    req.pool.query(sql, [userId, branchId], (error, results) => {
        if (error) {
            console.error('Error removing user from branch:', error);
            res.status(500).send('Internal Server Error');
        } else {
            res.send('User removed from branch successfully');
        }
    });
});

module.exports = router;