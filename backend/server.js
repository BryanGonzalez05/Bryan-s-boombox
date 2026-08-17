const express = require("express");
const app = express();
const musicFunc = require('./routers/musicRouter');

//install muller to test and upload files to backend
app.use(`/musicFunctions`,musicFunc);

app.listen(5000,()=>{
    console.log(`server listening on port 5000`);
})