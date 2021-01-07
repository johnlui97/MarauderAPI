const express = require("express");
const router = express.Router();
const mysql  = require("mysql");
const db = require("../connection");
const { json } = require("body-parser");
const { v4: uuidv4 } = require("uuid");

router.post("/", (req, res) => {
    const message_insertion_statement = `INSERT INTO messages SET ?`;
    const message_id = uuidv4();
    const group_id = req.body.group_id;
    const from_id = req.body.from_id;
    const to_id = req.body.to_id;
    const content = req.body.content;
    var m = new Date();
    var dateString =
        m.getUTCFullYear() + "/" +
        ("0" + (m.getUTCMonth()+1)).slice(-2) + "/" +
        ("0" + m.getUTCDate()).slice(-2) + " " +
        ("0" + m.getUTCHours()).slice(-2) + ":" +
        ("0" + m.getUTCMinutes()).slice(-2) + ":" +
        ("0" + m.getUTCSeconds()).slice(-2);
    var sent = false;

    var message = {
      message_id:message_id,
      group_id:group_id,
      from_id:from_id,
      to_id:to_id,
      content:content,
      time:dateString,
      sent:sent
    }

    if(group_id) {
      // Group Message Multiple Targets Involved.
      console.log("Received a Group Message, multiple targets needed.");
      find_target_query = `SELECT user_id FROM MarauderDB.groups WHERE group_id = '${message.group_id}'`;
      db.query(find_target_query, (err, result) => {
        if(err) {
          console.log("Unable to find group targets, err: ", err);
          return res.sendStatus(500);
        }
        console.log("Send Group Message Via OneSignal or Twilio.");
        return res.send(result);
      });
    } else {
      // Direct Message One Target Needed. No Need to parse for all targets.
      console.log("Send Direct Message Via One Signal or Twilio.")
      return res.send("Direct Message Received Single Target Needed.");
    }
});

module.exports = router;