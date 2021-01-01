const express = require("express");
const morgan = require("morgan");
const app = express();
const port = process.env.port || 3000;

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
    console.log("Establishing Connection to Server.");
    res.send("Welcome to Marauder API.");
});

app.listen(port, () => {
    console.log("Server up and running.");
});