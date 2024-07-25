const express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
const path = require('path');
router.use(bodyParser.json());

// Template function to streamline the get/post routes.
function queryDatabase(req, res, query, prepared_statements, callback) {
    req.pool.getConnection((connectionError, connection) => {
        // Could not connect to database.
        if (connectionError) {
            console.error("Could not connect to database:", connectionError);
            res.sendStatus(500);
            return;
        }

        connection.query(query, prepared_statements, (queryError, rows, fields) => {
            connection.release();
            // Could not query.
            if (queryError) {
                console.error("Could not query database:", queryError);
                res.sendStatus(500);
                return;
            }

            // Call the function based on the rows.
            callback(rows);
        });
    });
}

// // Make sure the user is logged in before using this page.
// router.use(`/*`, (req, res, next) => {
//     if (!(`user` in req.session)) {
//       res.redirect(`/signin`);
//     }

//     next();
//   });

  router.get('/userRole', (req, res, next) => {
    res.json({ role: req.session.user.role });
  });

// GET route to fetch all posts
router.get('/getPosts', (req, res, next) => {
    queryDatabase(req, res, "SELECT * FROM Posts;", [], (rows) => {
        res.json(rows);
    });
});

// POST route to add a post
router.post('/addPost', (req, res, next) => {
    const { content, branch, user } = req.body;

    // Validate the incoming request
    if (!content || !branch || !user) {
        console.error("Missing required fields:", { content, branch, user });
        return res.status(400).send('Missing required fields');
    }

    // Query to insert a new row into the Posts table
    queryDatabase(req, res, `INSERT INTO Posts (post_content, branch_id, user_id) VALUES (?, ?, ?);`, [content, branch, user], (rows) => {
        res.sendStatus(200);
    });
});

router.get('/getBranches', (req, res, next) => {
    queryDatabase(req, res, `SELECT Branches.name AS branch FROM Branches
      INNER JOIN BranchManagers ON BranchManagers.user_id=?
      AND Branches.branch_id=BranchManagers.branch_id`, [req.session.user.user_id], (row) => {
      res.json(row);
    });
  });

  router.get('/getBranchId', (req, res, next) => {
    const name = req.body.name;
    queryDatabase(req, res, `SELECT Branches.branch_id FROM Branches
                             WHERE Branches.name = ?`, [name], (row) => {
      res.json(row);
    });
  });

module.exports = router;
