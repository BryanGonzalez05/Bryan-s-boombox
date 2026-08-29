import db from '../db.js';
import fs from 'fs';
import path from 'path';


export const createPlaylist = async (req,res) =>{
    try{
        const {PlaylistName, PlaylistDescription} = JSON.parse(req.body.playlistInfo);


        if(!PlaylistName?.trim()){
            return res.status(400).json({message: "PlayList name cannot be empty!"});
        }

        const [result] = await db.execute(`select * from playlist where playlist_name = ?`, [PlaylistName.trim()]);

        if(result.length > 0){
            return res.status(400).json({message: 'A Playlist already uses this name!'});
        }

        
        if(!req.file){
            const default_PL_IMG_Path = path.join('PlaylistImage','playlist-img-placeholder.webp');
            await db.execute(
                `insert into playlist (playlist_name, playlist_description, imagePath) 
                 values(?, ?, ?)`, [PlaylistName.trim(), PlaylistDescription?.trim(), default_PL_IMG_Path]
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
            await db.execute(
                `insert into playlist (playlist_name, playlist_description, imagePath)
                 values (?,?,?)`, [PlaylistName.trim(), PlaylistDescription?.trim(), imagePath]
            );
        }
        

        return res.status(200).json({message: 'Playlist has been created!'});
    }
    catch(error){
        console.log(error.message);
        return res.status(500).json({message: 'Internal server error!'})
    }
}

export const deletePlaylist = async (req,res) =>{
    try{
        const playlist_id = req.params.playlistID;

        const [result] = await db.execute('delete from playlist where playlist_id = ?', [playlist_id]);

        if(result.affectedRows === 0){
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
export const editPlaylist = async (req,res) =>{
    const transaction = await db.getConnection();

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


        transaction.beginTransaction();


        //check if playlist exist
        const [checkExistance] = await transaction.execute(`select * from playlist where playlist_id = ?`, [playlist_id]);
        if(checkExistance.length === 0){
            await transaction.rollback();
            return res.status(404).json({message: 'Playlist does not exist!'});
        }


        //what to do if there was a name change
        if(new_playlist_name){
            //prevent dups 
            const [result] = await transaction.execute(`select * from playlist where playlist_name = ? and playlist_id != ?`, [new_playlist_name, playlist_id]);
            if(result.length !== 0){
                await transaction.rollback();
                return res.status(400).json({message: 'A playlist already has this name!'});
            }

            await transaction.execute(`update playlist set playlist_name = ? where playlist_id = ?`,[new_playlist_name, playlist_id]);
        }



        if(checkExistance[0].playlist_description !== new_playlist_description && new_playlist_description){
            await transaction.execute(`update playlist set playlist_description = ? where playlist_id = ?`, [new_playlist_description, playlist_id]);    
        }


        let imagePath = checkExistance[0].imagePath;
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
            await transaction.execute(`update playlist set imagePath = ? where playlist_id = ?`, [imagePath, playlist_id]);
        }


        await transaction.commit();
        console.log('transaction was successful');
        return res.status(200).json({message: 'Changes have been commmited!'});
    }
    catch(error){
        await transaction.rollback();
        console.log(error);
        return res.status(500).json({message: 'Internal server error!'});
    }
    finally{
        transaction.release();
    }
}

export const loadPlaylist = async(req,res) =>{
    try{
        const offset = req.params.offset;

        const [result] = await db.execute(`select * from playlist limit 10 offset ?`, [offset]);
        
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

        const [song_check] = await db.execute(`select * from songLib where songID = ?`, [songId]);
        if(song_check.length === 0){
            return res.status(400).json({message: 'Song does not exist!'});
        }

        const [playlist_check] = await db.execute(`select * from playlist where playlist_ID = ?`, [playlistId]);
        if(playlist_check.length === 0){
            return res.status(400).json({message: 'Playlist does not exist!'});
        }

        await db.execute(`insert into playlist_song (playlist_ref, song_ref) values(?,?)`, [playlistId, songId]);

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

        const [song_check] = await db.execute(`select * from songLib where songID = ?`, [songId]);
        if(song_check.length === 0){
            return res.status(400).json({message: 'Song does not exist!'});
        }

        const [playlist_check] = await db.execute(`select * from playlist where playlist_ID = ?`, [playlistId]);
        if(playlist_check.length === 0){
            return res.status(400).json({message: 'Playlist does not exist!'});
        }
        
        await db.execute('delete from playlist_song where playlist_ref = ? and song_ref = ?', [playlistId, songId]);

    }
    catch(error){
        console.log(error.message);
        return res.status(500).json({message: 'Internal server error'});
    }
}