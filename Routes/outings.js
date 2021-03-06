const express = require("express");
const util = require('util');
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const mysql  = require("mysql");
const db = require("../connection");
const { json } = require("body-parser");


router.get("/", (req, res) => {
    console.log(`Attempting to get all the outings.`);
    res.send("Acquired all outings in database.");
});

router.get("/my_outings/:id", (req, res) => {
    const my_outings_query = `SELECT outings.outing_id, outings.group_id, outings.match_id, outings.user_id, outings.is_confirmed, venues.venue_id, venues.name, venues.address, venues.venue_image_link FROM MarauderDB.outings
                              JOIN MarauderDB.venues ON outings.venue_id = venues.venue_id
                              WHERE outings.user_id = '${req.params.id}';`
    db.query(my_outings_query, (err, rows) => {
      if(err) {
        console.log("There was an error inserting into outigns table: ", err);
        return res.sendStatus(500);
      } 
      console.log(rows);
      return res.json(rows);
    });
});

router.get("/users/:outing_id/:group_id", (req, res) => {
  // We need outing_id because matches are associated with it
  // And right now we dont have functionality to do matches.
    console.log(req.params.outing_id);
    console.log(req.params.group_id);
    const outingUsersQuery = `SELECT * FROM MarauderDB.groups
                              JOIN MarauderDB.users ON MarauderDB.groups.user_id = MarauderDB.users.user_id
                              WHERE MarauderDB.groups.group_id = '${req.params.group_id}';`;

    db.query(outingUsersQuery, (err, rows) => {
      if(err) {
        console.log("There was an error inserting into outigns table: ", err);
        return res.sendStatus(500);
      } 
      return res.json(rows);
    }); 
});

router.post("/", (req, res) => {
  const users = req.body.users;
  const userInjectionString = users.map(c => `'${c}'`).join(', ');
  const group_member_verification_query =  `SELECT MarauderDB.groups.membership_id, MarauderDB.groups.group_id, COUNT(MarauderDB.groups.group_id) as group_id_frequency 
                                            FROM MarauderDB.groups
                                            WHERE (MarauderDB.groups.user_id IN (${userInjectionString})) 
                                            GROUP BY MarauderDB.groups.group_id
                                            HAVING group_id_frequency = ${users.length};`;
  db.query(group_member_verification_query, (err, rows) => {
    if(err) {
      console.log("There was an error inserting into outigns table: ", err);
      return res.sendStatus(500);
    }
    if(rows[0].length != 0) {
      const group_id = rows[0].group_id;
      for(i = 0; i < users.length; i++) {
        const new_outing_id = uuidv4();
        const outing = {
          outing_id:new_outing_id,
          venue_id:req.body.venue_id,
          group_id:group_id,
          match_id:null,
          user_id:users[i],
          is_confirmed:false
        }
        const insert_new_outing_query = `INSERT INTO outings SET ?`;
        db.query(insert_new_outing_query, outing, (err, rows) => {
          if(err) {
            console.log("There was an error inserting into outigns table: ", err);
            return res.sendStatus(500);
          }
        });
      }
    } else {
      const group_id = uuidv4();
      for(i = 0; i < users.length; i++) {
        const membership = uuidv4();
        const group = {
          membership_id:membership,
          group_id:group_id,
          user_id:users[i]
        }
        const insert_new_group_query = `INSERT INTO groups SET ?`;
        db.query(insert_new_group_query, group, (err, rows) => {
          if(err) {
            console.log("There was an error inserting into outigns table: ", err);
            return res.sendStatus(500);
          }
        });
      }
      for(i = 0; i < users.length; i++) {
        const new_outing_id = uuidv4();
        const outing = {
          outing_id:new_outing_id,
          venue_id:req.body.venue_id,
          group_id:group_id,
          match_id:null,
          user_id:users[i],
          is_confirmed:false
        }
        const insert_new_outing_query = `INSERT INTO outings SET ?`;
        db.query(insert_new_outing_query, outing, (err, rows) => {
          if(err) {
            console.log("There was an error inserting into outigns table: ", err);
            return res.sendStatus(500);
          }
        });
      }
    }
    return res.sendStatus(200);
  });                         
});

router.post("/outing_with_promises", (req, res) => {
    const users = req.body.users;
    const userInjectionString = users.map(c => `'${c}'`).join(', ');
    const group_existence_query =  `SELECT MarauderDB.groups.membership_id, MarauderDB.groups.group_id, COUNT(MarauderDB.groups.group_id) as group_id_frequency 
                    FROM MarauderDB.groups
                    WHERE (MarauderDB.groups.user_id IN (${userInjectionString})) 
                    GROUP BY MarauderDB.groups.group_id
                    HAVING group_id_frequency = ${users.length};`;
    const query = util.promisify(db.query).bind(db);
    (async () => {
      try {
        const rows = await query(group_existence_query);
        console.log(rows);
      } finally {
        query.end();
      }
    })()
});

router.put("/confirm_outing/:outing_id/:user_id", (req, res) => {
  const updateOutingConfirmationQuery = `UPDATE outings SET is_confirmed = 1 
                                        WHERE outings.user_id = '${req.params.user_id}' 
                                        AND outings.outing_id = '${req.params.outing_id}';`;
  db.query(updateOutingConfirmationQuery, (err, rows) => {
    if(err) {
      console.log("There was an error inserting into outigns table: ", err);
      return res.sendStatus(500);
    }
    return res.json("Success");
  });
});

router.delete("/decline_outing/:outing_id/:user_id", (req, res) => {
  const deleteOutingConfirmationQuery = `DELETE FROM MarauderDB.outings 
                                         WHERE MarauderDB.outings.outing_id = '${req.params.outing_id}' 
                                         AND MarauderDB.outings.user_id = '${eq.params.user_id}';`;
  db.query(deleteOutingConfirmationQuery, (err, rows) => {
    if(err) {
      console.log("There was an error inserting into outigns table: ", err);
      return res.sendStatus(500);
    }
    return res.json("Success");
  });
});

module.exports = router;