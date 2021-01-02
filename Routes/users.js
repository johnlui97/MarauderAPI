const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  console.log(`Attempting to get all the users`);
  res.send("Acquired all users in database.");
});

router.post("/register", (req, res) => {
  res.send("Registering new User into Marauder Backend.");
});

module.exports = router;