const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const mysql  = require("mysql");
const db = require("../connection");
const { json } = require("body-parser");

router.get("/", (req, res) => {
    console.log(`Attempting to get all the venues within range.`);
    const latitude = req.query.latitude;
    const longitude = req.query.longitude;
    const range = req.query.range;
    const get_all_venues = `SELECT *, (3959 * acos(cos(radians(${latitude}))*cos(radians(latitude))*cos(radians(longitude)-radians(${longitude}))+sin(radians(${latitude}))*sin(radians(latitude)))) AS distance
                            FROM MarauderDB.venues
                            HAVING distance < ${range}
                            ORDER BY distance
                            LIMIT 25;`;

    db.query(get_all_venues, (err, rows) => {
      if (err) {
        console.log("MarauderAPI - /login POST failed to register new user, error: ", err);
        return res.sendStatus(500);
      }
      res.send(rows);
    });
});

router.post("/generate_venues", (req, res) => {
  const uniqueId = uuidv4();
  const venue = {
    venue_id:uniqueId,
    name:req.body.name,
    address:req.body.address,
    latitude:req.body.latitude,
    longitude:req.body.longitude, 
    tag:req.body.tag,
    media_link:req.body.media_link
  }

  const insert_entry = `INSERT INTO venues SET ?`;

  db.query(insert_entry, venue, (err, result) => {
    if (err) {
      console.log("MarauderAPI - /login POST failed to register new user, error: ", err);
      return res.sendStatus(500);
    }
    console.log("MarauderAPI - /login POST registed new user: ", venue.venue_id);
    res.sendStatus(200);
  });
});

module.exports = router;