const mysql = require("mysql");
const dotenv = require("dotenv");

dotenv.config();

// Creating MySQL Connection
var connection = mysql.createConnection({
    host:'marauder-db.clm4xkmydujh.us-east-2.rds.amazonaws.com',
    user:'admin',
    password:'January-1997-October',
    database:"MarauderDB"
});

module.exports = connection;