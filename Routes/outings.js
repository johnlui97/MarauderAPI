const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const mysql  = require("mysql");
const db = require("../connection");
const { json } = require("body-parser");

router.get("/", (req, res) => {
    console.log(`Attempting to get all the outings.`);
    res.send("Acquired all outings in database.");
});

router.post("/", (req, res) => {
    console.log("Generating new outings in outings table.");

    const sample_group_id = uuidv4();
    const match = null;
    const venue_id = '35f1289c-aaa1-4c68-a56d-976e0387231a';
    const timestamp = Date.now();

    const outing = {
      outing_id:venue_id,
      group_id:sample_group_id,
      match_id: match,
      venue_id: venue_id,
      time:timestamp
    }

    const insertion_statement = `INSERT INTO outings SET ?;`

    db.query(insertion_statement, outing, (err, rows) => {
      if(err) {
        console.log("There was an error inserting into outigns table: ", err);
        return res.sendStatus(500);
      }
      console.log("Succesfully entered outing into the table.");
      res.sendStatus(200);
    });
  });

module.exports = router;