const express = require("express");
const app = express();
const musicFunc = require("./routers/musicFunc");

//install muller to test and upload files to backend

app.use(musicFunc);

app.listen(5000,()=>{
    console.log(`server listening on port 5000`);
})