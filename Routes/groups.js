const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    console.log(`Attempting to get all the users`);
    res.send("Acquired all users in database.")
  });

module.exports = router;