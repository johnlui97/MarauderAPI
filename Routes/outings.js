const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    console.log(`Attempting to get all the outings.`);
    res.send("Acquired all outings in database.");
  });

module.exports = router;