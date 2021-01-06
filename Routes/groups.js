const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const mysql  = require("mysql");
const db = require("../connection");
const { json } = require("body-parser");
// import { compareAsc, format } from 'date-fns';

router.get("/", (req, res) => {
    console.log(`Attempting to get all Groups in Backend.`);
    res.send("Acquired all groups in database.");
});

router.post("/", (req, res) => {
    console.log("Creating a new group event!");

    const group_id  = uuidv4();
    const user_id_1 = req.body.user_id_1;
    const user_id_2 = req.body.user_id_2;
    const user_id_3 = req.body.user_id_3;
    const user_id_4 = req.body.user_id_4;

    const insertion_statement = `INSERT INTO MarauderDB.groups (group_entry_id, group_id, user_id) VALUES ?;`;

    if(user_id_1 && user_id_2 && user_id_3 && user_id_4) {
        var user_array = [user_id_1, user_id_2, user_id_3, user_id_4];
        var insertion_array = [];
        for(i = 0; i < user_array.length; i++) {
            var unique_entry_id = uuidv4();
            insertion_array.push([unique_entry_id, group_id, user_array[i]]);
        }
        db.query(insertion_statement, [insertion_array], (err, result) => {
            if (err) {
                console.log("MarauderAPI - /groups POST failed to register new group, error: ", err);
                return res.sendStatus(500);
            }
            console.log("MarauderAPI - /groups POST Successfully to register new group");
        });
        return res.sendStatus(200);
    }
    if(user_id_1 && user_id_2 && user_id_3) {
        var user_array = [user_id_1, user_id_2, user_id_3];
        var insertion_array = [];
        for(i = 0; i < user_array.length; i++) {
            var unique_entry_id = uuidv4();
            insertion_array.push([unique_entry_id, group_id, user_array[i]]);
        }
        db.query(insertion_statement, [insertion_array], (err, result) => {
            if (err) {
                console.log("MarauderAPI - /groups POST failed to register new group, error: ", err);
                return res.sendStatus(500);
            }
            console.log("MarauderAPI - /groups POST Successfully to register new group");
        });
        return res.sendStatus(200);
    }
    if(user_id_1 && user_id_2) {
        var user_array = [user_id_1, user_id_2];
        var insertion_array = [];
        for(i = 0; i < user_array.length; i++) {
            var unique_entry_id = uuidv4();
            insertion_array.push([unique_entry_id, group_id, user_array[i]]);
        }
        db.query(insertion_statement, [insertion_array], (err, result) => {
            if (err) {
                console.log("MarauderAPI - /groups POST failed to register new group, error: ", err);
                return res.sendStatus(500);
            }
            console.log("MarauderAPI - /groups POST Successfully to register new group");
        });
        return res.sendStatus(200);
    }
});

module.exports = router;