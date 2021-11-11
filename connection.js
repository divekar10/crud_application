const mysql = require('mysql');

const db = mysql.createConnection({
    host:'localhost',
    user:'web_app',
    password:'admin',
    database: 'master',
    port:3306
});

db.connect(err => {
    if(err) throw err;
    console.log('connected to database');
});

module.exports = db;