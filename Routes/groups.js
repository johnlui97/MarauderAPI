const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    console.log(`Attempting to get all Groups in Backend.`);
    res.send("Acquired all groups in database.");
});

router.post("/", (req, res) => {
    console.log("Creating a new group event!");

    // Adding logic to handle creating new group events
    // 4 Maximum members, and will need mysql statements to create
    // entries into multiple tables.

    res.send("Creating new Group Outing");
});

module.exports = router;