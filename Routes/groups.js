const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    console.log(`Attempting to get all Groups in Backend.`);
    res.send("Acquired all groups in database.");
  });

module.exports = router;