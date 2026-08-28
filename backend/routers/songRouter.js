import express from 'express'
const router = express.Router();
//file handler
import multer from 'multer';
import {UploadSong, deleteSong, editSong, loadSongs} from '../controller/songController.js'
import fs from 'fs';
import path from 'path';
import { callbackify } from 'util';

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
        const filepath = path.join('SongFolder/', file.originalname);

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

const fileFilter = (req, file, callback) =>{
    if(allowedMimes.includes(file.mimetype)){
        callback(null, true);
    } 
    else{
        return callback(new Error('Error! file is not an audio'));
    }
}

//create the middleware
const upload = multer({storage: storage, fileFilter: fileFilter});


//image handling for song image 
const storage_SongImage = multer.diskStorage({
    destination:  function (req, file, callback){
        callback(null, 'SongImage/temp/');
    },

    filename: function (req,file, callback){
        callback(null, file.originalname);
    }
})

const allowed_Mimes_SongImage = ['image/jpeg', 'image/pjpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/tiff', 'image/avif'];

const fileFilter_SongImage = (req,file,callback) =>{
    if(allowed_Mimes_SongImage.includes(file.mimetype)){
        callback(null, true)
    }
    else{
        return callback(new Error('Not a valid file type!'))
    }
}

const upload2 = multer({storage: storage_SongImage, fileFilter : fileFilter_SongImage});

router.post('/UploadSong', upload.array('files',10), UploadSong);
router.delete('/deleteSong', deleteSong);
router.put('/editSong/:id', upload2.single('file'), editSong);
router.get('/loadSongs/:offset', loadSongs);

export default router;