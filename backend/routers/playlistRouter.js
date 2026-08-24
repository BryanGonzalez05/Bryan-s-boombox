import express from 'express';
import {createPlaylist, deletePlaylist} from '../controller/playlistControler.js';
const router = express.Router();


router.post('/createPlaylist', createPlaylist);
router.delete('/deletePlaylist/:playlistID', deletePlaylist);
export default router;