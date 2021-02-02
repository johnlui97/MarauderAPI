const { json } = require("express");
const express = require("express");
const router = express.Router();
const mysql  = require("mysql");
const db = require("../connection");
const { v4: uuidv4, validate } = require("uuid");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

router.get("/search", (req, res) => {
    console.log("Conducting user search within database.");
    const user = req.query.name;
    const user_query = `SELECT users.user_id, users.full_name, users.username, users.image_link, users.age FROM MarauderDB.users
                        WHERE full_name LIKE '${user}%'
                        LIMIT 10;`;
    db.query(user_query, (err, result) => {
        if(err) {
          console.log("MarauderAPI - /validate_email has encountered an error while validating email, err: ", err);
          return res.sendStatus(500);
        }
        return res.send(result);
    });
});

router.get("/validate_number", (req, res) => {
    console.log("Validating for unique phone number within database.");
    const incoming_number = req.query.phone_number;
    const validation_query = `SELECT * FROM MarauderDB.users WHERE phone_number = '${incoming_number}'`;
    db.query(validation_query, (err, result) => {
        if (err) {
          console.log("MarauderAPI - /validate_number has encountered an error while validating number, err: ", err);
          return res.sendStatus(500);
        }
        if(result[0] == null) {
            console.log("MarauderAPI - /validate_number has encountered no known number of input value.");
            return res.sendStatus(200);
        } else {
            console.log("MarauderAPI - /validate_number has encountered an existing entry of input value.");
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

  const user = {
    user_id: uniqueId,
    phone_number: req.body.number,
    username: req.body.username,
    age: req.body.age,
    gender: req.body.gender,
    range: req.body.range,
    lower_match_age: req.body.lower_match_age,
    upper_match_age: req.body.upper_match_age,
    match_male: req.body.match_male,
    match_female: req.body.match_female,
    match_nonbinary: req.body.match_nonbinary,
    profile_image_1: "req.body.profile_image_1",
    profile_image_2: "req.body.profile_image_2",
    profile_image_3: "req.body.profile_image_3",
    profile_image_4: "req.body.profile_image_4",
    profile_caption: req.body.profile_caption,
    is_account_paused: req.body.is_account_paused
  };

  var insert_user_querry = `INSERT INTO users SET ?`;

  db.query(insert_user_querry, user, (err, result) => {
    if (err) {
      console.log("MarauderAPI - /login POST failed to register new user, error: ", err);
      return res.sendStatus(500);
    }

    const secret = process.env.SECRET;
    var token = jwt.sign(uniqueId, secret, {
      expiresIn: '7d'
    });

    console.log("MarauderAPI - /login POST registed new user: ", user.user_id);
    return res.json(
      {
        "user_id":uniqueId,
        "token":token
      });
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
  const user = {"user_id":req.body.user_id}
  const secret = process.env.SECRET;
  var token = jwt.sign(user, secret, {
    expiresIn: '30s'
  });
  return res.json({"access_token":token});
});

router.post("/validate_web_token", authenticateToken, (req, res) => {
  jwt.verify(req.token, process.env.SECRET, (err, authData) => {
    if(err) {
      return res.sendStatus(403);
    } else {
      console.log(authData);
      return res.sendStatus(200);
    }
  });
});

function authenticateToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if(typeof bearerHeader !== 'undefined') {
      const bearer = bearerHeader.split(' ');
      const token  = bearer[1];
      req.token = token;
      next();
    } else {
      res.sendStatus(403);
    }
}

module.exports = router;