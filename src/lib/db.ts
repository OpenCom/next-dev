// lib/db.js
import mysql from 'mysql2/promise';
//import mariadb from 'mariadb';

//const pool = mariadb.createPool({
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '', // Default to empty if no password
    database: process.env.DB_NAME,
    //connectionLimit: 5 // maria db
});

export default pool;