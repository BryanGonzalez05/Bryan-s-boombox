import express from 'express';
const app = express();
//router path
import songRouter from './routers/songRouter.js';
import playlistRouter from './routers/playlistRouter.js';


//used to set incoming json to parse
app.use(express.json());


//fetches image from directory
import path from 'path';

//used to access directory 
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


//express.static is for handling static files like img, js , css etc
//path joins the set varibles into a directory string
//__dirname is the directory path in which the file is in
app.use('/SongImage', express.static(path.join(__dirname, '..','SongImage')));
app.use('/PlaylistImage', express.static(path.join(__dirname, '..', 'PlaylistImage')));


app.use(`/song`,songRouter);
app.use('/playlist', playlistRouter)

app.listen(5000,()=>{
    console.log(`server listening on port 5000`);
})