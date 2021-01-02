const { json } = require("express");
const express = require("express");
const router = express.Router();
const mysql  = require("mysql");

// Creating MySQL Connection
var db = mysql.createConnection({
  host:"marauder-db.clm4xkmydujh.us-east-2.rds.amazonaws.com",
  user:"admin",
  password:"January-1997-October",
  database:"MarauderDB"
});

router.get("/", (req, res) => {
  console.log(`Attempting to get all the users`);
  var get_all_users_querry = "SELECT * FROM users";
  let db_querry = db.query(get_all_users_querry, (err, results) => {
    if(err) throw err;
    console.log(results);
    res.send(json(results));
  });
});

router.post("/register", (req, res) => {
  res.send("Registering new User into Marauder Backend.");
});

module.exports = router;