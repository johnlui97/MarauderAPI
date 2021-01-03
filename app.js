const express = require("express");
const morgan = require("morgan");
const mysql  = require("mysql");
const dotenv = require('dotenv');

const app = express();
const port = process.env.port || 3000;
dotenv.config();

// Creating MySQL Connection
var marauder_db = mysql.createConnection({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:"MarauderDB"
});

app.use(morgan("short"));

const user_routes = require("./Routes/users");
const venues_routes = require("./Routes/venues");
const outings_routes = require("./Routes/outings");
const groups_routes = require("./Routes/groups");
const matches_routes = require("./Routes/matches");
const messages_routes = require("./Routes/messages");

app.use("/users", user_routes);
app.use("/venues", venues_routes);
app.use("/outings", outings_routes);
app.use("/groups", groups_routes);
app.use("/matches", matches_routes);
app.use("/messages", messages_routes);

app.get('/', (req, res) => {
    console.log("Trying to establish Connection to databse.");
    marauder_db.connect((err) => {
        console.log("MarauderAPI_app.js - Database Host is: ", marauder_db.host);
        if(err) {
            throw err;
        }
        console.log("Database Connected.");
    });

    res.send("Welcome to Marauder API.");
});

app.listen(port, () => {
    console.log("Server up and running.");
});