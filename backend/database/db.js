import Database from 'better-sqlite3';
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname,'testDB.db');

//create the database if it does not exist 
//as well as creates the tables if missing
const db = new Database(dbPath);

db.exec(
    `CREATE TABLE IF NOT EXISTS songLib (
songID INTEGER PRIMARY KEY AUTOINCREMENT,
songName TEXT NOT NULL,
artistName Text NOT NULL,
duration INTEGER,
songPath TEXT NOT NULL,
added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
, imagePath text not null);`
)

db.exec(
    `CREATE TABLE IF NOT EXISTS playlist(
playlist_ID integer primary key autoincrement,
playlist_name text not null,
playlist_duration integer default 0,
playlist_description text default null,
song_count integer default 0,
created_date timestamp default current_timestamp
, imagePath text not null);`
)

db.exec(
    `CREATE TABLE IF NOT EXISTS playlist_song(
playlist_ref integer not null,
song_ref integer not null,
primary key (playlist_ref, song_ref),
foreign key (playlist_ref)
references playlist(playlist_ID)
on delete cascade
on update cascade,
foreign key (song_ref)
references songLib(songID)
on delete cascade
on update cascade
);`
)
export default db;