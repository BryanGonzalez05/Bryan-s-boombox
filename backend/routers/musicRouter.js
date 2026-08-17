const express = require("express");
const router = express.Router();
const multer = require('multer');
const musicController = require('../controller/musicController');
const fs = require('fs');
const path = require('path');

//controls where to store the file 
const storage = multer.diskStorage({
    //sets the destination of where to store the file
    destination: function(req, file, callback){
        callback(null, 'SongFolder/')
    },
    //sets the name of the file to the original name
    //if not given a name, a random name will be given
    filename: function (req, file, callback){

        //fetch a file with the original name
        filepath = path.join('../../songFolder', file.originalname);
        console.log(filepath);
        //checks if there is a file with the same name
        if(fs.existsSync(filepath)){
            //returns error if a file shares the same name of an already stored file
            return callback(new Error('There already exists a file with this name'));
        }

        callback(null,file.originalname)
    },
})

//check if the file inputted is an audio file
const allowedMimes = ['audio/mpeg', 'audio/ogg', 'audio/wav'];

const fileFilter = (req,file, callback) =>{
    if(allowedMimes.includes(file.mimetype)){
        callback(null, true);
    } 
    else{
        return callback(new Error('Error! file is not an audio'));
    }
}

//create the middleware
const upload = multer({storage: storage, fileFilter: fileFilter});

router.post('/UploadSong', upload.array('files',10), musicController.UploadSong);

module.exports = router;