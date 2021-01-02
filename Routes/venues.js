const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    console.log(`Attempting to get all the venues.`);
    res.send("Acquired all venues in database.");
  });

module.exports = router;