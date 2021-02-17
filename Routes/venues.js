const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const mysql  = require("mysql");
const db = require("../connection");
const { json } = require("body-parser");
const multer = require("multer");
const AWS = require("aws-sdk");

const multerStorage = multer.memoryStorage({
  destination: function(req, file, callback) {
    callback(null, '');
  }
});

const upload = multer({storage: multerStorage}).single('image');
const uploads = multer({storage: multerStorage}).array('images', 4);

const s3 = new AWS.S3({
  accessKeyId:process.env.AWS_ACCESS_ID,
  secretAccessKey:process.env.AWS_ACCESS_SECRET_KEY
});

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
        console.log("MarauderAPI - /venues GET failed to retreive all venues, error: ", err);
        return res.sendStatus(500);
      }
      res.send(rows);
    });
});

router.get("/venue_search", upload, (req, res) => {
    console.log("Searching specific venues within our network.");
    const venue_search_string = req.query.venue_search_string;

    const venue_search_query = `SELECT * FROM MarauderDB.venues
                                WHERE name LIKE '${venue_search_string}%'
                                LIMIT 10;`;

    db.query(venue_search_query, (err, result) => {
        if(err) {
          console.log("MarauderAPI - /login POST failed to register new user, error: ", err);
          return res.sendStatus(500);
        }
        return res.send(result);
    });
});

// router.post("/add_venue", (req, res) => {
//   const random_file_name = uuidv4();
//   // let myFile = req.file.originalname.split('.');
//   // const fileType = myFile[myFile.length-1];
//   // console.log(req.params.name);
//   // console.log(req.params.address);
//   // console.log(req.params.latitude);
//   // console.log(req.params.longitude);
//   // console.log(req.params.tag);

//   console.log(random_file_name);

//   return res.json("Success");
// });

module.exports = router;