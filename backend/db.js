import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
	host: process.env.DATABASE_HOST,
	user: process.env.DATABASE_USER,
	password: process.env.DATABASE_PASSWORD,
	port: process.env.DATABASE_PORT,
	database: process.env.DATABASE_NAME,
	waitForConnections: true, //if connection hits its limit users will have to wait
	connectionLimit: 10, //max user that can use the database
	maxIdle: 10, //max idle connections, it keeps the connection alive
	idleTimeout: 60000, //how long the connection idles, in milliseconds 1s = 1000ms
	queueLimit: 0, //limit to user queuing to use the database
	enableKeepAlive: true, //makes the connection stay active until timeout
	keepAliveInitialDelay: 0
})


export default pool;
