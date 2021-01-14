const { json } = require("express");
const express = require("express");
const router = express.Router();
const mysql  = require("mysql");
const db = require("../connection");
const { v4: uuidv4, validate } = require("uuid");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

router.get("/", (req, res) => {
  console.log(`Attempting to get all the users`);
  var get_all_users_querry = `SELECT * FROM users`;
  db.query(get_all_users_querry, (err, rows) => {
    if (err) {
      console.log(`Failed to query for users`, err);
      return res.sendStatus(404);
    }
    console.log(`Completed fetching for the user`);
    return res.json(rows);
  });
});

router.get("/search", (req, res) => {
    console.log("Conducting user search within database.");

    const user = req.query.name;
    const user_query = `SELECT users.user_id, users.first_name, users.email, users.image_link, users.age FROM MarauderDB.users
                        WHERE first_name LIKE '${user}%'
                        LIMIT 10;`;

    db.query(user_query, (err, result) => {
        if(err) {
          console.log("MarauderAPI - /validate_email has encountered an error while validating email, err: ", err);
          return res.sendStatus(500);
        }
        return res.send(result);
    });
});

router.get("/validate_email", (req, res) => {
    console.log("Validating for unique email address for new user.");
    const email = req.query.email;
    console.log(email);
    var validate_email_query = `SELECT * FROM MarauderDB.users WHERE email = '${email}';`;
    db.query(validate_email_query, (err, result) => {
        if(err){
          console.log("MarauderAPI - /validate_email has encountered an error while validating email, err: ", err);
          return res.sendStatus(500);
        }
        if(result[0] == null) {
          return res.sendStatus(200);
        } else {
          return res.sendStatus(409);
        }
    });
});

router.get("/validate_username", (req, res) => {
    console.log("Validating for unique username for new user.");
    const username = req.query.username;
    var validate_email_query = `SELECT * FROM MarauderDB.users WHERE username = '${username}';`;
    db.query(validate_email_query, (err, result) => {
        if(err){
          console.log("MarauderAPI - /validate_email has encountered an error while validating email, err: ", err);
          return res.sendStatus(500);
        }
        if(result[0] == null) {
          return res.sendStatus(200);
        } else {
          return res.sendStatus(409);
        }
    });
});

router.post("/register", (req, res) => {
  const uniqueId = uuidv4();
  const salt = bcrypt.genSaltSync(10);
  const hashed_password = bcrypt.hashSync(req.body.password, salt);

  const user = {
    user_id: uniqueId,
    full_name: req.body.full_name,
    username: req.body.username,
    email: req.body.email,
    age: req.body.age,
    gender: req.body.gender,
    password: hashed_password,
    range:req.body.range,
    image_link: req.body.image_link
  };

  var insert_user_querry = `INSERT INTO users SET ?`;

  db.query(insert_user_querry, user, (err, result) => {
    if (err) {
      console.log("MarauderAPI - /login POST failed to register new user, error: ", err);
      return res.sendStatus(500);
    }
    console.log("MarauderAPI - /login POST registed new user: ", user.user_id);
    res.sendStatus(200);
  });
});

router.post("/login", (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  };
  const targetted_email = req.body.email;
  const getUserByEmailQuerry = `SELECT * FROM users WHERE email = '${targetted_email}';`;

  db.query(getUserByEmailQuerry, (err, rows) => {
    if(err) {
      return res.send(err);
    }
    if(rows === undefined || rows.length == 0) {
      console.log("MarauderAPI - /login POST Request Failed to find user with specified email, prompt signup instead.");
      return res.sendStatus(422);
    }
    queried_password = rows[0].password;
    if(bcrypt.compareSync(req.body.password, queried_password)) {
      console.log("MarauderAPI - /login POST Request Validation Returns: ", true);
      return res.sendStatus(200);
    } else {
      console.log("MarauderAPI - /login POST Request Validation Returns: ", false);
      return res.sendStatus(403);
    }    
  });
});

router.post("/test_generate_web_token", (req, res) => {
  const user = {
    "user_id":req.body.user_id
  }
  const secret = '359e36710b19042eb11b4f6e7cfb69ab72e75d1e12ff7eeb0e04ab7db84fa64cbf88602873eff698645c63ea1d1e847ab44ead664d3dfe62419a838e42a19ff3';
  var token = jwt.sign(user, secret);
  return res.json({"accessToken":token});
});

router.post("/validate_web_token", (req, res) => {
  const incoming_token = {
    "token":req.body.token
  }
  jwt.verify(incoming_token, '359e36710b19042eb11b4f6e7cfb69ab72e75d1e12ff7eeb0e04ab7db84fa64cbf88602873eff698645c63ea1d1e847ab44ead664d3dfe62419a838e42a19ff3', (err, user) => {
    if (err) {
      console.log(err);
      return res.sendStatus(403);
    }
      console.log("Successfully Validated Token.");
    return res.sendStatus(200);
  });

});

module.exports = router;