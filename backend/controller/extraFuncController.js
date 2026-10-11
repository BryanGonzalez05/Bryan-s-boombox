import fs, { unlinkSync } from 'fs';
import path from 'path';
import { fileTypeFromFile } from 'file-type';

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
                fs.unlinkSync(SF_path);
            }

            const r = await fileTypeFromFile(newDefautlSongFile.path);
            const changedSongFileType = path.join(process.cwd(), 'SongImage', 'song-place-holder.webp');
            if(r.ext === 'webp'){
                fs.renameSync(newDefautlSongFile.path, changedSongFileType);
            }
            else{
                await sharp(newDefautlSongFile.path).webp({quality: 100}).toFile(changedSongFileType);
                fs.unlinkSync(newDefautlSongFile.path);
            }
            
            repairedSongImg = true;
        }

        //now finish for playlist
        if(newDefaultPlaylistFile){
            const PF_path = path.join('PlaylistImage', newDefaultPlaylistFile.filename);

            if(fs.existsSync(PF_path)){
                fs.unlinkSync(PF_path);
            }
            
            const r2 = fileTypeFromFile(newDefaultPlaylistFile.path);
            const changePlaylistFileType = path.join(process.cwd(),'PlaylistImage', 'playlist-img-placeholder.webp');
            if(r2.ext === 'webp'){
                fs.rename(newDefaultPlaylistFile, changePlaylistFileType);
            }
            else{
                await sharp(newDefaultPlaylistFile.path).webp({quality: 100}).toFile(changePlaylistFileType);
                fs.unlinkSync(newDefaultPlaylistFile.path);
            }
            
            repairedPlaylistImg = true;
        }

        return res.status(200).json({message: 'Everything has been restored '})
    }
    catch(error){
        console.log(error)
        return res.status(500);
    }
    
}