/*
const mysql = require('mysql');

exports.getConnection = ()=>{
    c = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "1234",
        database: "cruise"
    });
    c.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
      });
    
    return c;
}

con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1234",
    database: "cruise"
});
  
con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  var sql = "INSERT INTO costco (cruiseline, region, month, cruises) VALUES ?";
  var values = [['cruiseline', 'regiona', '2018-01-00', '{"test":1}']];
  con.query(sql, [values], function (err, result) {
    if (err) throw err;
    console.log("1 record inserted");
    });
});
*/

const util = require('util')
const mysql = require('mysql')
const pool = mysql.createPool({
    connectionLimit: 10,
    host: "localhost",
    user: "root",
    password: "1234",
    database: "cruise"
})

// Ping database to check for common exception errors.
/*
pool.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.')
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.')
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.')
        }
        throw err;
    }

    if (connection) connection.release()
    return;
})
*/
// Promisify for Node.js async/await.
pool.query = util.promisify(pool.query)

module.exports = pool