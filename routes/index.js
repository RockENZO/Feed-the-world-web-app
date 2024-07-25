var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
const path = require('path');
var xss = require('xss-clean');

const CLIENT_ID = '105901315469-eum6g8uouskprreflpbbsqj0h221pi7g.apps.googleusercontent.com'
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

const argon2 = require('argon2');

router.use(bodyParser.json());

router.post('/', function(req, res) {
    // Login logic here
    res.send('Login route');
});

router.post('/login', async function(req,res,next){

    if ('client_id' in req.body && 'credential' in req.body){


        const ticket = await client.verifyIdToken({
            idToken: req.body.credential,
            audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });
        const payload = ticket.getPayload();
        //console.log(payload['sub']);
        console.log(payload['email']);
        // If request specified a G Suite domain:
        // const domain = payload['hd'];

        req.pool.getConnection(function(cerr, connection) {
          if (cerr) {
            res.sendStatus(500);
            return;
          }

          let query = "SELECT user_id,username,email FROM Users WHERE email = ?";

          connection.query(query, [payload['email']],function(userErr, userRows, fields) {

            connection.release();

            if (userErr) {
              res.sendStatus(500);
              return;
            }

            console.log(JSON.stringify(userRows));

            if (rows.length > 0){
              // Set session with user_id and username, excluding password
              [req.session.user] = rows;
              res.json(req.session.user);

              let branchQuery = "SELECT branch_id FROM UserBranches WHERE user_id = ?";
              connection.query(branchQuery, [userRows[0].user_id], function(branchErr, branchRows) {
                connection.release();

                if (branchErr) {
                  res.sendStatus(500);
                  return;
                }

                req.session.branches = branchRows.map(br => br.branch_id);

                res.json({
                  user: req.session.user,
                  branches: req.session.branches
                });

              });

            } else {
              // No user
              connection.release();
              res.sendStatus(401);
            }

          });

        });


    } else if ('username' in req.body && 'password' in req.body) {


      req.pool.getConnection( function(cerr, connection) {
        if (cerr) {
          res.sendStatus(500);
          return;
        }

        let query = "SELECT user_id,username,email,password,role FROM Users WHERE username = ?";

        connection.query(query, [req.body.username], async function(userErr, userRows, fields) {

          connection.release();

          if (userErr) {
            res.sendStatus(500);
            return;
          }

          console.log(JSON.stringify(userRows));

          if (userRows.length > 0){

            if (await argon2.verify(userRows[0].password, req.body.password)) {

              // clear password
              let [user_props] = userRows;
              delete user_props.password;

              req.session.user = user_props;
              let branchQuery = "SELECT branch_id FROM UserBranches WHERE user_id = ?";
              connection.query(branchQuery, [userRows[0].user_id], function(branchErr, branchRows) {
                connection.release();

                if (branchErr) {
                  res.sendStatus(500);
                  return;
                }

                req.session.branches = branchRows.map(br => br.branch_id);

                res.json({
                  user: req.session.user,
                  branches: req.session.branches
                });

              });

            } else {
              // incorect pass
              res.sendStatus(401);

            }

          } else {
            // No user
            res.sendStatus(401);
          }

        });

      });

    } else {
      res.sendStatus(401);
    }

});

router.post('/signup', function(req,res,next){

    if ('username' in req.body && 'password' in req.body && 'email' in req.body && 'first_name' in req.body && 'last_name' in req.body) {

      req.pool.getConnection( async function(cerr, connection) {
        if (cerr) {
          res.sendStatus(500);
          return;
        }

        const hash = await argon2.hash(req.body.password);

        let query = `INSERT INTO Users (
                        username,
                        password,
                        email,
                        first_name,
                        last_name,
                        role
                    ) VALUES (
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        'User'
                    );`;

        connection.query(query,[req.body.username, hash, req.body.email, req.body.first_name, req.body.last_name],function(qerr, rows, fields) {

          connection.release();

          if (qerr) {
            res.sendStatus(401);
            return;
          }

          res.end();

        });

      });

    } else {
      res.sendStatus(401);
    }

  });

router.post('/logout', function(req, res) {
    if (req.session.user) {
        req.session.destroy(function(err) {
            if (err) {
                console.error('Failed to destroy session:', err);
                res.status(500).send('Failed to log out');
            } else {
                res.send('Logged out successfully');
            }
        });
    } else {
        res.status(403).send('Not logged in');
    }
});

router.post('/google_login', async function(req,res,next){

    const ticket = await client.verifyIdToken({
        idToken: req.body.credential,
        audience: CLIENT_ID
    });
    const payload = ticket.getPayload();
    //console.log(payload['sub']);
    console.log(payload['email']);
    // If request specified a G Suite domain:
    // const domain = payload['hd'];

    res.redirect('/');


});

router.post('/update-user', function(req, res) {
  req.pool.getConnection(async function(cerr, connection) {
      if (cerr) {
          console.error('Failed to get connection:', cerr);
          return res.status(500).send('Failed to connect to database');
      }

      if (!req.session.user || !req.session.user.user_id) {
          connection.release();
          return res.status(400).send('No user session available');
      }

      // Collect fields that are not empty
      const updates = {};
      if (req.body.username) updates.username = req.body.username;
      if (req.body.email) updates.email = req.body.email;
      if (req.body.first_name) updates.first_name = req.body.first_name;
      if (req.body.last_name) updates.last_name = req.body.last_name;

      // Construct the SQL query dynamically
      const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updates);

      values.push(req.session.user.user_id); // Add user_id for the WHERE clause
      let query = `UPDATE Users SET ${setClause} WHERE user_id = ?;`;

      connection.query(query, values, function(qerr, results) {

          if (qerr) {
              console.error('Query error:', qerr);
              connection.release();
              return res.status(500).send('Failed to update user');
          }

          if (results.affectedRows === 0) {
            connection.release();
              return res.status(404).send('User not found');
          }

          connection.release();
          console.log('Profile updated successfully');
          res.redirect('/signin'); // Redirect to login page after successful update
      });
  });
});



module.exports = router;