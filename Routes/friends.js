const { json } = require("express");
const express = require("express");
const router = express.Router();
const mysql  = require("mysql");
const db = require("../connection");
const { v4: uuidv4, validate } = require("uuid");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

router.get("/", (req, res) => {
    console.log("Getting all friends associated with user.");
    const user_id = req.query.user_id;
    const friends_query = `SELECT * FROM MarauderDB.friends;`;

    db.query(friends_query, (err, rows) => {
        if (err) {
            console.log("Internal error retrieving all entries for user: ", user_id);
            return res.sendStatus(500);
        }
        console.log(rows);
        return res.sendStatus(200);
    });

    return res.send("Getting all entries in friends table.")
});

router.get("/friend_requests", (req, res) => {
    console.log("Querying for all friend requests associated with user.");
    const user_id = req.query.user_id;
    const query = `SELECT friends.friend_id, user_id, full_name, username, age, gender, image_link
                   FROM MarauderDB.users
                   JOIN MarauderDB.friends
                   ON users.user_id = friends.from_id
                   WHERE friends.to_id = '${user_id}' AND friends.isConfirmed = 0;`;

    db.query(query, (err, rows) => {
        if(err) {
            console.log("Error in querying for all friend requests error: ", err);
            return res.sendStatus(500);
        }
        return res.send(rows);
    });
});

router.get("/my_friends", (req, res) => {
    console.log("getting all my friends.");
    const user_id = req.query.user_id;
    const friends_list=`SELECT users.user_id, users.full_name, users.username, users.age, users.gender
                        FROM MarauderDB.users
                        WHERE users.user_id = (
                            SELECT friends.from_id
                            FROM MarauderDB.friends
                            WHERE to_id = '${user_id}' AND isConfirmed = 1
                        ) OR users.user_id = (
                            SELECT friends.to_id
                            FROM MarauderDB.friends
                            WHERE from_id = '${user_id}' AND isConfirmed = 1
                        );`;

    db.query(friends_list, (err, rows) => {
        if(err) {
            console.log("Error in obtaining user's friends list.");
            return res.sendStatus(500);
        }
        return res.send(rows);
    });
});

router.post("/", (req, res) => {
    console.log("Sending initial friend Request!");
    const uniqueId = uuidv4();
    const friendship = {
        friend_id:uniqueId,
        from_id:req.body.from_id,
        to_id:req.body.to_id,
        isConfirmed:false
    }

    const insertion_query = `INSERT INTO friends SET ?`;
    db.query(insertion_query, friendship, (err, rows) => {
        if(err) {
            console.log("Error inserting new friend request to friends table. Error: ", err);
            return res.sendStatus(500);
        }
        return res.sendStatus(200);
    });
});

router.put("/request_update", (req, res) => {
    console.log("Updating a friend request!");
    const update = req.body.isConfirmed;
    const friend_id = req.body.friend_id;
    const update_query = `UPDATE MarauderDB.friends
                          SET isConfirmed = ${update}
                          WHERE friend_id = '${friend_id}';`

    db.query(update_query, (err, rows) => {
        if(err) {
            console.log("Error in Updating entry in friends table, err: ", err);
            return res.sendStatus(500);
        }
        return res.sendStatus(200);
    });
});

module.exports = router;