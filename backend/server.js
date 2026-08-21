import express from 'express';
const app = express();
//router path
import musicFunc from './routers/musicRouter.js';

//used to set incoming json to parse
app.use(express.json());

app.use(`/musicFunctions`,musicFunc);

app.listen(5000,()=>{
    console.log(`server listening on port 5000`);
})