import express from 'express';
const app = express();
//router path
import songRouter from './routers/songRouter.js';
import playlistRouter from './routers/playlistRouter.js';

//used to set incoming json to parse
app.use(express.json());


//fetches image from directory
import path from 'path';
//express.static is for handling static files like img, js , css etc
//process.cwd means start from current directory 
app.use('/SongImage', express.static(path.join(process.cwd(),'SongImage')))

//do the same for playlist

app.use(`/song`,songRouter);
app.use('/playlist', playlistRouter)

app.listen(5000,()=>{
    console.log(`server listening on port 5000`);
})