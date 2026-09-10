import Database from 'better-sqlite3';

const db = new Database('testDB.db');
console.log('db function has been created\n');
export default db;