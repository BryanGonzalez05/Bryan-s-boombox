import express from 'express';
import {createPlaylist, deletePlaylist, editPlaylist, loadPlaylist} from '../controller/playlistController.js';
const router = express.Router();

import multer from 'multer';
import fs from 'fs';
import path from 'path';

const storage = multer.diskStorage({
    destination: function (req, file, callback){
        callback(null, 'PlaylistImage/');
    },

    filename: function (req, file, callback){
        const filepath = path.join('PlaylistImage', file.originalname);

        if(fs.existsSync(filepath)){
            return callback(new Error('There already exist a file with the same name!'));
        }

        callback(null, file.originalname);
    }

})

const allowed_File_type = ['image/jpeg', 'image/pjpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/tiff', 'image/avif'];

const fileFilter = (req, file, callback) =>{
    if(allowed_File_type.includes(file.mimetype)){
        callback(null, true);
    }
    else{
        return callback(new Error('Not a valid file type!'));
    }
}

const upload = multer({storage : storage, fileFilter : fileFilter});

router.post('/createPlaylist', upload.single('file'), createPlaylist);
router.delete('/deletePlaylist/:playlistID', deletePlaylist);
router.put('/editPlaylist/:playlistID', editPlaylist);
router.get('/loadPlaylist/:offset', loadPlaylist);

export default router;