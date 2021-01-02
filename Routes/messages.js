const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    console.log(`Attempting to get all the messages.`);
    res.send("Acquired all messages in database.");
  });

module.exports = router;