const { json } = require("express");
const express = require("express");
const router = express.Router();
const mysql  = require("mysql");
const db = require("../connection");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt")

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
      console.log("Failed to register new user into Database, error: ", err);
      return res.sendStatus(500);
    }
    res.send("Successfully registered new User into Marauder Backend.");
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
      console.log(true);
      return res.send("Successfully Validated!");
    } else {
      console.log(false);
      return res.send("Unsucessful Validation.");
    }    
  });
});

module.exports = router;