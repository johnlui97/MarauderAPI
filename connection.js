const mysql = require("mysql");
const dotenv = require("dotenv");

dotenv.config();

// Creating MySQL Connection
var connection = mysql.createConnection({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:"MarauderDB"
});

module.exports = connection;