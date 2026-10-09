import express from 'express';
import multer from 'multer';
import { fileURLToPath } from 'url';
import path from 'path';
import { newDefaultImg } from '../controller/extraFuncController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.join(__filename);
const PlaylistImageDir = path.join(__dirname, '..', '..', 'PlaylistImage', 'temp');
const songImageDir = path.join(__dirname, '..', '..', 'SongImage', 'temp');

const storage = multer.diskStorage({
    destination: function (req, file, callback){
        if(file.fieldname === 'defaultPlaylistImage'){
            callback(null, PlaylistImageDir);
        }
        else if(file.fieldname === 'defaultSongImage'){
            callback(null, songImageDir);
        }
        else{
            callback(new Error('Unexpected Error!'));
        }
    },

    filename: function(req, file, callback){
        callback(null,file.originalname);
    }
})

const allowed_Mimes = ['image/jpeg', 'image/pjpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/tiff', 'image/avif'];
const fileFilterType = (req,file,callback)=>{
    if(allowed_Mimes.includes(file.mimetype)){
        callback(null,true);
    }

    else return callback(new Error('Invalid mime type'))
} 


const upload = multer({storage : storage, fileFilter: fileFilterType})

const router = express.Router();

router.post('/restoreDefaultImgs', upload.fields([
        {name: 'defaultSongImage', maxCount: 1},
        {name : 'defaultPlaylistImage', maxCount:1}
    ]),
    newDefaultImg
)
