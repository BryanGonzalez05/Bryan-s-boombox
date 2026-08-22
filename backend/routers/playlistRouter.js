import express from 'express';
import {createPlaylist} from '../controller/playlistController';
const router = express.router();


router.post('/createPlaylist', createPlaylist);

export default router;