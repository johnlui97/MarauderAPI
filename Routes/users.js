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
  db.connect((err) => {
    if(err) {
        throw err;
    }
    console.log("Database Connected.");
  });
  res.send("Acquired all users in database.");
});

router.post("/register", (req, res) => {
  res.send("Registering new User into Marauder Backend.");
});

module.exports = router;