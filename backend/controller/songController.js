import db from '../database/db.js';
import {parseFile} from 'music-metadata';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';

export const UploadSong = async(req,res)=>{
   try{
       const files = req.files;
       const default_IMG_path = path.join('SongImage', `SongImagePlaceHolder.webp`);
       //checks if are files
       if(!files ||files.length === 0){
            return res.status(400).json({message: 'Error! there are no files inputted'})
       }

       //gets extra info from frontend
       //you cant send json so backend because of middleware 
       //it expects audio files with fieldname: files
       //so send json as a string and its parse here. 
       const songInfo = JSON.parse(req.body.songInfo);

       //iterates through json
       for(const si of songInfo){ 
            //finds a match 
            const match = files.find(f =>{
                 return f.originalname === si.fileName;
            })

            if(!match){
                 return res.status(400).json({message: `Error! file name ${si.fileName} does not match as listed`})
            }

            //list info to see
            //console.log(`filename : ${match.originalname}\n artist name: ${si.artistName}\n filepath: ${match.path}`)

            //store info to database
            const metadata = await parseFile(match.path);

            // debug console.log({songname : si.songName, artistName : si.artistName, duration : metadata.format.duration, path : match.path, image: default_IMG_path})

          db.prepare(
               `INSERT INTO songLib
                (songName, artistName, duration, songPath, imagePath)
                VALUES(?,?,?,?,?)`
          ).run(
               si.songName,
               si.artistName,
               metadata.format.duration,
               match.path,
               default_IMG_path
          );
          console.log('song has been inserted to db \n');
       }

       //list file info to see
       /*files.forEach(file => {
            console.log(file);
       }); */

       return res.status(200).json({message: "Success"})
   }
   catch(error){
     console.log(error);
     return res.status(500).json({message: "internal server error"});
   }
   
}

export const deleteSong = async(req,res)=>{
     try{
          
          //gets list of chosen song id 
          const songIds = req.body.songIds;

          //iterates through them
          for(const id of songIds){

               //searches for them in the db
               const row =  db.prepare('select songPath from songLib where songID = ?').get(id);

               //if nun found continue
               if(!row){
                    continue;
               }

               //gets song path
               const songPath = row.songPath;

               //waits for deletion of the directory 
               await fsp.unlink(songPath);
               
               //deletes from the db
               db.prepare(
                    `DELETE from songLib
                    where songID = ?`
               ).run(id);
               
          }

          //return message
          return res.status(200).json({message: 'song library has been updated!'});
     }
     catch(error){
          console.log(error.message);
          return res.status(500).json({message: "internal server error!"});
     }
}

export const editSong = (req,res)=>{
     try{
          const songId = req.params.id;
          const {newSongName, newArtistName} = JSON.parse(req.body.newSongInfo);


          if(!newSongName?.trim() && !newArtistName?.trim() && !req.file){
               return res.status(400).json({message: 'no change was sent'});
          }

          const checkValid = db.prepare(`select * from songLib where songID = ?`).get(songId);
          if(!checkValid){
               return res.status(400).json({message: 'song does not exist'});
          }

          const SongName = newSongName?.trim() ? newSongName.trim() : checkValid.songName;
          const ArtistName = newArtistName?.trim() ? newArtistName.trim() : checkValid.artistName;
          let imagePath = checkValid.imagePath;

          //if there is a image file sent check if its new or pre-existing
          if(req.file){
               const existingPath = path.join('SongImage', req.file.filename);
               const tempPath = req.file.path;
               if(fs.existsSync(existingPath)){
                    console.log(`file already exist`)
                    fs.unlinkSync(tempPath);
               }
               else{
                    console.log('file is new')
                    fs.renameSync(tempPath, existingPath);
               }

               imagePath = existingPath;
          }

          db.prepare(
               `UPDATE songLib 
               set songName = ?, artistName = ?, imagePath = ? 
               where songID = ?`, 
          ).run(
               SongName,
               ArtistName, 
               imagePath, 
               songId
          );

          return res.status(200).json({message: 'song updated!'});

     }
     catch(error){
          console.log(error);
          return res.status(500).json({message: 'Internal server error!'})
     }
}

export const loadSongs = (req,res) =>{
    try{
        const offset = Number(req.params.offset);

        const result = db.prepare(`
                    select songID, songName, artistName, duration, imagePath 
                    from songLib 
                    limit 20 offset ?`
                    ).all(offset);


        if(result.length === 0){
            return res.status(400).json({message : 'No more songs to load!'});
        }

        
        return res.status(200).json({message: 'song have been fetched', songs : result});
    }
    catch(error){
        console.log(error.message);
        console.log(error);

        return res.status(500).json({message: 'Internal server error!'});
    }
}
