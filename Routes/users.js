const { json } = require("express");
const express = require("express");
const router = express.Router();
const mysql  = require("mysql");
const db = require("../connection");
const { v4: uuidv4 } = require("uuid");
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

router.post("/register", (req, res) => {
  const uniqueId = uuidv4();
  const salt = bcrypt.genSaltSync(10);
  const hashed_password = bcrypt.hashSync(req.body.password, salt);

  const user = {
    user_id: uniqueId,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    age: req.body.age,
    gender: req.body.gender,
    password: hashed_password,
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