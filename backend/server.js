import express from 'express';
const app = express();
//router path
import musicFunc from './routers/musicRouter.js';

app.use(express.json());
//install muller to test and upload files to backend
app.use(`/musicFunctions`,musicFunc);

app.listen(5000,()=>{
    console.log(`server listening on port 5000`);
})