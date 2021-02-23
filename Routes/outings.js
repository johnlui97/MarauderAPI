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
    const my_outings_query = `SELECT outings.outing_id, outings.group_id, outings.match_id, outings.user_id, outings.is_confirmed, venues.venue_id, venues.name, venues.address, venues.venue_image_link FROM MarauderDB.outings
                              JOIN MarauderDB.venues ON outings.venue_id = venues.venue_id
                              WHERE outings.user_id = '${req.params.id}';`
    db.query(my_outings_query, (err, rows) => {
      if(err) {
        console.log("There was an error inserting into outigns table: ", err);
        return res.sendStatus(500);
      } 
      console.log(rows);
      return res.json(rows);
    });
});

router.get("/users/:outing_id/:group_id", (req, res) => {
  // We need outing_id because matches are associated with it
  // And right now we dont have functionality to do matches.
    console.log(req.params.outing_id);
    console.log(req.params.group_id);
    const outingUsersQuery = `SELECT * FROM MarauderDB.groups
                              JOIN MarauderDB.users ON MarauderDB.groups.user_id = MarauderDB.users.user_id
                              WHERE MarauderDB.groups.group_id = '${req.params.group_id}';`;

    db.query(outingUsersQuery, (err, rows) => {
      if(err) {
        console.log("There was an error inserting into outigns table: ", err);
        return res.sendStatus(500);
      } 
      return res.json(rows);
    }); 
});

router.post("/", (req, res) => {
  console.log("Posting new outing into outing table.");
  // const uniqueId = uuidv4();
  const outing = {
    outing_id: "12345",
    group_id: req.body.group_id,
    venue_id: req.body.venue_id,
    user_id_1: req.body.user_id_1,
    user_id_2: req.body.user_id_2,
    user_id_3: req.body.user_id_3,
    user_id_4: req.body.user_id_4
  }
  console.log(outing)
  return res.send("Success");
});

router.put("/confirm_outing/:outing_id/:user_id", (req, res) => {
  const updateOutingConfirmationQuery = `UPDATE outings SET is_confirmed = 1 
                                        WHERE outings.user_id = '${req.params.user_id}' 
                                        AND outings.outing_id = '${req.params.outing_id}';`;
  db.query(updateOutingConfirmationQuery, (err, rows) => {
    if(err) {
      console.log("There was an error inserting into outigns table: ", err);
      return res.sendStatus(500);
    }
    return res.json("Success");
  });
});

router.delete("/decline_outing/:outing_id/:user_id", (req, res) => {
  const deleteOutingConfirmationQuery = `DELETE FROM MarauderDB.outings 
                                         WHERE MarauderDB.outings.outing_id = '${req.params.outing_id}' 
                                         AND MarauderDB.outings.user_id = '${eq.params.user_id}';`;
  db.query(deleteOutingConfirmationQuery, (err, rows) => {
    if(err) {
      console.log("There was an error inserting into outigns table: ", err);
      return res.sendStatus(500);
    }
    return res.json("Success");
  });
});

module.exports = router;