const { json } = require("express");
const express = require("express");
const router = express.Router();
const mysql  = require("mysql");
const db = require("../connection");
const { v4: uuidv4 } = require("uuid");

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
  const user = {
    id: uniqueId,
    first_name: 'John',
    last_name: 'Doe',
    email: 'doejoh@mcmaster.ca',
    age: 23,
    gender: 'MALE',
    password: '12345abcde',
    image_link: 'World Hello!'
  };
  var inser_user_querry = `INSERT INTO users SET ?`;

  db.query(inser_user_querry, user, (err, rows) => {
    if (err) {
      console.log("Failed to register new user into Database, error: ", err);
      return res.sendStatus(500);
    }
    res.send("Successfully registered new User into Marauder Backend.");
  });
});

module.exports = router;