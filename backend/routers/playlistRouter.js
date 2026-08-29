import express from 'express';
import {createPlaylist, deletePlaylist, editPlaylist,
        loadPlaylist, addSongToPlaylist, deleteSongFromPlaylist} from '../controller/playlistController.js';
        
const router = express.Router();

import multer from 'multer';

const storage = multer.diskStorage({
    destination: function (req, file, callback){
        callback(null, 'PlaylistImage/temp');
    },

    filename: function (req, file, callback){
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
router.put('/editPlaylist/:playlistID', upload.single('file'), editPlaylist);
router.get('/loadPlaylist/:offset', loadPlaylist);
router.post('/:playlistId/song/:songId', addSongToPlaylist);
router.delete('/:playlistId/song/:songId', deleteSongFromPlaylist)

export default router;