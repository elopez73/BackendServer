import mysql from 'mysql2';
import dotenv from 'dotenv'
dotenv.config()

const apppool = mysql.createPool({
    host: "us-cdbr-east-06.cleardb.net",
    user: process.env.SQL_User,
    password: process.env.SQL_password,
    database: process.env.SQL_database,
    waitForConnections: true,
    connectionLimit: 10,
}).promise();
export default apppool;
