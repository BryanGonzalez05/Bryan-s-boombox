import express from 'express';
import {createPlaylist, deletePlaylist, editPlaylist} from '../controller/playlistController.js';
const router = express.Router();


router.post('/createPlaylist', createPlaylist);
router.delete('/deletePlaylist/:playlistID', deletePlaylist);
router.put('/editPlaylist/:playlistID', editPlaylist);
export default router;