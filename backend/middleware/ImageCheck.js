import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function imageCheck (req, res, next){
    const defaultSongImagePath = path.join(__dirname, '..', '..', 'SongImage', 'song-place-holder.webp');
    const defaultPlaylistImagePath = path.join(__dirname, '..', '..', 'PlaylistImage', 'playlist-img-placeholder.webp');

    const songImageMissing = !fs.existsSync(defaultSongImagePath);
    const playlistImageMissing = !fs.existsSync(defaultPlaylistImagePath);

    if(songImageMissing || playlistImageMissing){
        return res.status(503).json({
            error : "Missinng Images",
            songImageMissing : songImageMissing,
            playlistImageMissing : playlistImageMissing,
        });
    }

    next();
} 
