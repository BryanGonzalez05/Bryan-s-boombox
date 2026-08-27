import express from 'express';
import {createPlaylist, deletePlaylist, editPlaylist, loadPlaylist} from '../controller/playlistController.js';
const router = express.Router();


router.post('/createPlaylist', createPlaylist);
router.delete('/deletePlaylist/:playlistID', deletePlaylist);
router.put('/editPlaylist/:playlistID', editPlaylist);
router.get('/loadPlaylist/:offset', loadPlaylist);
export default router;