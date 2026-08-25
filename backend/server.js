import express from 'express';
const app = express();
//router path
import songRouter from './routers/songRouter.js';
import playlistRouter from './routers/playlistRouter.js';

//used to set incoming json to parse
app.use(express.json());

app.use(`/song`,songRouter);
app.use('/playlist', playlistRouter)

app.listen(5000,()=>{
    console.log(`server listening on port 5000`);
})