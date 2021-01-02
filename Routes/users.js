const { json } = require("express");
const express = require("express");
const router = express.Router();
const mysql  = require("mysql");
const db = require("../connection");

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
  res.send("Registering new User into Marauder Backend.");
});

module.exports = router;