import db from '../db.js';

export const createPlaylist = async (req,res) =>{
    try{
        const PlaylistName = req.body.PlaylistName;

        if(!PlaylistName){
            return res.status(400).json({message: "PlayList name cannot be empty!"});
        }

        const [result] = await db.execute(`select * from playlist where playlist_name = ?`, [PlaylistName]);

        if(result.length > 0){
            return res.status(400).json({message: 'A Playlist already uses this name!'});
        }

        await db.execute(`insert into playlist (playlist_name) values(?)`, [PlaylistName]);

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

