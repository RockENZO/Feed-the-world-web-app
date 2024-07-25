const express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
const path = require('path');
router.use(bodyParser.json());
/*
router.get('/', (req, res, next) => {
    res.render('events', { title: 'Events' });
});
*/
// Template function to streamline the get/post routes.
function queryDatabase(req, res, query, prepared_statements, callback) {
  req.pool.getConnection((connectionError, connection) => {
    // Could not connect to database.
    if (connectionError) {
      console.log("Could not connect to database");
      res.sendStatus(500);
      return;
    }

    connection.query(query, prepared_statements, (queryError, rows, fields) => {
      connection.release();
      // Could not query.
      if (queryError) {
        console.log("Could not query database");
        res.sendStatus(500);
        return;
      }

      // Call the function based on the rows.
      callback(rows);
    });
  });
}


router.get('/getEvents', (req, res, next) => {
  queryDatabase(req, res, `SELECT Events.event_id, Events.title, Events.content,
    Events.timestamp, Branches.name AS branch
    FROM Events INNER JOIN Branches ON Branches.branch_id=Events.branch_id`, [], (row) => {
    res.json(row);
  });
});

router.get('/userRole', (req, res, next) => {
  res.json({ role: req.session.user.role });
});

router.get('/getRsvp', (req, res, next) => {
  queryDatabase(req, res, `SELECT RsvpStatus.event_id FROM RsvpStatus
        WHERE RsvpStatus.user_id=?`, [req.session.user.user_id], (row) => {
    res.json(row);
  });
});

router.get('/rsvpUsers', (req, res, next) => {
  queryDatabase(req, res, `SELECT Users.username, Events.title FROM
    ((Users INNER JOIN
    RsvpStatus ON Users.user_id=RsvpStatus.user_id) INNER JOIN
    Events ON RsvpStatus.event_id=Events.event_id)`, [], (row) => {
    res.json(row);
  });
});

router.post('/setRsvp', (req, res, next) => {
  queryDatabase(req, res, `INSERT INTO RsvpStatus (user_id, event_id)
    VALUES (?, ?)`, [req.session.user.user_id, req.body.eventId], (row) => {
    res.sendStatus(200);
  });
});

router.post('/addEvent', (req, res, next) => {
  queryDatabase(req, res, `SELECT Branches.branch_id FROM Branches
    WHERE Branches.name=?`, [req.body.branch], (row) => {
    if (row.length == 0) {
      res.sendStatus(500);
    } else {
      queryDatabase(req, res, `INSERT INTO Events (title, content, branch_id)
    VALUES (?, ?, ?)`, [req.body.title, req.body.content, row[0].branch_id], (row) => {
        res.sendStatus(200);
      });
    }
  });
});

router.get('/getBranches', (req, res, next) => {
  queryDatabase(req, res, `SELECT Branches.name AS branch FROM Branches
    INNER JOIN BranchManagers ON BranchManagers.user_id=?
    AND Branches.branch_id=BranchManagers.branch_id`, [req.session.user.user_id], (row) => {
    res.json(row);
  });
});

module.exports = router;
