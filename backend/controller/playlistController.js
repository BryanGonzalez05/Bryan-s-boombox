import db from '../database/db.js';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';

//change the database syntax 

export const createPlaylist = async (req,res) =>{
    try{
        const {PlaylistName, PlaylistDescription} = JSON.parse(req.body.playlistInfo);


        if(!PlaylistName?.trim()){
            return res.status(400).json({message: "PlayList name cannot be empty!"});
        }

        const result =  db.prepare(`select * from playlist where playlist_name = ?`).get(PlaylistName.trim());

        if(result){
            return res.status(400).json({message: 'A Playlist already uses this name!'});
        }

        
        if(!req.file){
            const default_PL_IMG_Path = path.join('PlaylistImage','playlist-img-placeholder.webp');
            db.prepare(
                `insert into playlist (playlist_name, playlist_description, imagePath) 
                 values(?, ?, ?)`
            ).run(
                PlaylistName.trim(),
                PlaylistDescription?.trim(),
                default_PL_IMG_Path
            );
        }
        else{
            const existingPath = path.join('PlaylistImage', req.file.filename);

            if(fs.existsSync(existingPath)){
                fs.unlinkSync(req.file.path);
            }
            else{
                fs.renameSync(req.file.path, existingPath);
            }

            const imagePath = existingPath;
            db.prepare(
                `insert into playlist
                 (playlist_name, playlist_description, imagePath)
                 values (?,?,?)`
            ).run(    
                PlaylistName.trim(),
                PlaylistDescription?.trim(),
                imagePath
            );
        }
        

        return res.status(200).json({message: 'Playlist has been created!'});
    }
    catch(error){
        console.log(error.message);
        return res.status(500).json({message: 'Internal server error!'})
    }
}

export const deletePlaylist = (req,res) =>{
    try{
        const playlist_id = req.params.playlistID;

        const result =  db.prepare('delete from playlist where playlist_id = ?').run(playlist_id);

        if(result.changes === 0){
            return res.status(404).json({message: 'Playlist does not exist'});
        }

        return res.status(200).json({message: 'Playlist has been deleted!'});
    }
    catch(error){
        console.log(error.message);
        return res.status(500).json({message: 'Internal server error!'});
    }
} 

// do the same like you did for edit song image
export const editPlaylist = (req,res) =>{
    try{
        const playlist_id = req.params.playlistID;
        const {playlist_name, playlist_description} = JSON.parse(req.body.playlistInfo);
        const new_playlist_name = playlist_name?.trim();
        const new_playlist_description = playlist_description?.trim();


        //check if playlist id was sent
        if(!playlist_id){
            return res.status(400).json({message: 'Missing Playlist!'});
        }


        if(!new_playlist_name && !new_playlist_description && !req.file){
            return res.status(400).json({message: 'Must include one change!'});
        }


        //check if playlist exist
        const checkExistance = db.prepare(`select * from playlist where playlist_id = ?`).get(playlist_id);
        if(!checkExistance){
            return res.status(404).json({message: 'Playlist does not exist!'});
        }


        //what to do if there was a name change
        if(new_playlist_name){
            //prevent dups 
            const result = db.prepare(
                `select * from playlist
                 where playlist_name = ? and playlist_id != ?`
             ).get(
                new_playlist_name,
                playlist_id
            );

            if(!result){
                return res.status(400).json({message: 'A playlist already has this name!'});
            }

            db.prepare(
                `update playlist
                 set playlist_name = ? 
                 where playlist_id = ?`
            ).run(
                new_playlist_name,
                playlist_id
            );
        }



        if(checkExistance.playlist_description !== new_playlist_description){
            db.prepare(
                `update playlist
                 set playlist_description = ?
                 where playlist_id = ?`
            ).run(
                new_playlist_description,
                playlist_id
            );    
        }


        let imagePath = checkExistance.imagePath;
        if(req.file){
            const existingPath = path.join('PlaylistImage',req.file.filename);
            const tempPath = req.file.path;

            if(fs.existsSync(existingPath)){
                console.log('File already exist');
                fs.unlinkSync(tempPath);
            }
            else{
                console.log('File is new');
                fs.renameSync(tempPath, existingPath);
            }

            imagePath = existingPath;
            db.prepare(
                `update playlist
                 set imagePath = ?
                 where playlist_id = ?`
            ).run(
                 imagePath,
                 playlist_id
                );
        }


        console.log('transaction was successful');
        return res.status(200).json({message: 'Changes have been commmited!'});
    }
    catch(error){
        console.log(error);
        return res.status(500).json({message: 'Internal server error!'});
    }
}

export const loadPlaylist = async(req,res) =>{
    try{
        const offset = Number(req.params.offset);

        const result = db.prepare(`select * from playlist limit 10 offset ?`).all(offset);
        
        if(result.length === 0){
            return res.status(403).json({message: 'No more playlist to load!'});
        }

        return res.status(200).json({message: 'Playlists sent', playlists : result})
    }   
    catch(error){
        console.log(error.message);

        return res.status(500).json({message: 'Internal server error!'})
    }
}

export const addSongToPlaylist = async(req,res) =>{
    try{
        const playlistId = req.params.playlistId;
        const songId = req.params.songId;

        const song_check = db.prepare(`select * from songLib where songID = ?`).get(songId);
        if(!song_check){
            return res.status(400).json({message: 'Song does not exist!'});
        }


        const playlist_check = db.prepare(`select * from playlist where playlist_ID = ?`).get(playlistId);
        if(!playlist_check){
            return res.status(400).json({message: 'Playlist does not exist!'});
        }


        db.prepare(`insert into playlist_song (playlist_ref, song_ref) values(?,?)`).run(playlistId, songId);

        return res.status(200).json({message: 'song has been added to playlist'});
    }
    catch(error){
        console.log(error.message);
        return res.status(500).json({message: 'Internal server error!'});
    }
}

export const deleteSongFromPlaylist = async(req,res) =>{
    try{
        const playlistId = req.params.playlistId;
        const songId = req.params.songId;

        const song_check =  db.prepare(`select * from songLib where songID = ?`).get(songId);
        if(!song_check){
            return res.status(400).json({message: 'Song does not exist!'});
        }


        const playlist_check = db.prepare(`select * from playlist where playlist_ID = ?`).get(playlistId);
        if(!playlist_check){
            return res.status(400).json({message: 'Playlist does not exist!'});
        }
        

        db.prepare('delete from playlist_song where playlist_ref = ? and song_ref = ?').run(playlistId, songId);

    }
    catch(error){
        console.log(error.message);
        return res.status(500).json({message: 'Internal server error'});
    }
}