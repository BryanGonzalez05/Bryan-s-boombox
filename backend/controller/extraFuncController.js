import fs from 'fs';
import path from 'path';
//change file types
import sharp from 'sharp';

export const newDefaultImg = async (req, res)=>{

    const newDefautlSongFile = req.files?.defaultSongImage?.[0];
    const newDefaultPlaylistFile = req.files?.defaultPlaylistImage?.[0];

    let repairedSongImg = false;
    let repairedPlaylistImg = false;

    try{
        
        if(newDefautlSongFile){

            const SF_path = path.join('SongImage', newDefautlSongFile.filename);

            if(fs.existsSync(SF_path)){
                fs.unlinkSync(newDefaultSongFile.path);
            }
            const changedSongFileType = path.join('SongImage', 'song-place-holder.webp');
            await sharp(newDefautlSongFile.path).webp({quality: 100}).toFile(changedSongFileType);
            fs.unlinkSync(SF_path);

            repairedSongImg = true;
        }

        //now finish for playlist
    }
    catch(error){
        console.log(error)
        return res.status(500);
    }
    
}