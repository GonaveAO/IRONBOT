
var mysql = require('mysql2/promise');
const bluebird = require('bluebird');
const { db } = require('./config.json')

const con = mysql.createPool({

    host: db.host,
    user: db.user,
    password: db.password,
    database: db.database,
    charset: db.charset,
    Promise: bluebird
})


module.exports = con;

