const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    console.log(`Attempting to get all the matches.`);
    res.send("Acquired all matches in database.");
});

module.exports = router;