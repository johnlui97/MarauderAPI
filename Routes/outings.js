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

router.get("/my_outings/:id", (req, res) => {
    const my_outings_query = `SELECT MarauderDB.groups.user_id, outings.outing_id, outings.group_id, outings.venue_id, venues.venue_image_link FROM MarauderDB.outings
                              JOIN MarauderDB.groups ON outings.group_id = MarauderDB.groups.group_id
                              JOIN MarauderDB.venues ON outings.venue_id = venues.venue_id
                              WHERE MarauderDB.groups.user_id = '${req.params.id}';`
    db.query(my_outings_query, (err, rows) => {
      if(err) {
        console.log("There was an error inserting into outigns table: ", err);
        return res.sendStatus(500);
      } 
      return res.json(rows);
    });
});

router.post("/", (req, res) => {
    console.log("Generating new outings in outings table.");

    const outing_id = uuidv4();
    const group_id = req.body.group_id;
    const match = null;
    const venue_id = req.body.venue_id;
    var m = new Date();
    var dateString =
        m.getUTCFullYear() + "/" +
        ("0" + (m.getUTCMonth()+1)).slice(-2) + "/" +
        ("0" + m.getUTCDate()).slice(-2) + " " +
        ("0" + m.getUTCHours()).slice(-2) + ":" +
        ("0" + m.getUTCMinutes()).slice(-2) + ":" +
        ("0" + m.getUTCSeconds()).slice(-2);

    const outing = {
      outing_id:outing_id,
      group_id:group_id,
      match_id: match,
      venue_id: venue_id,
      time:dateString
    }

    const insertion_statement = `INSERT INTO outings SET ?;`

    db.query(insertion_statement, outing, (err, rows) => {
      if(err) {
        console.log("There was an error inserting into outigns table: ", err);
        return res.sendStatus(500);
      }
      console.log("Succesfully entered outing into the table.");
    });
    return res.sendStatus(200);
  });

module.exports = router;