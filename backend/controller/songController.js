import db from '../db.js';
import {parseFile} from 'music-metadata';
import fs from 'fs';
import path from 'path';

export const UploadSong = async(req,res)=>{
   try{
       const files = req.files;
       const default_IMG_path = '/SongImage/SongImagePlaceHolder.webp';
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
            console.log(`filename : ${match.originalname}\n artist name: ${si.artistName}\n filepath: ${match.path}`)

            //store info to database
            const metadata = await parseFile(match.path);
            await db.execute(
                 `INSERT INTO songLib (songName, artistName, duration, songPath, imagePath) VALUES(?,?,?,?,?)`,
                 [si.songName, si.artistName, metadata.format.duration, match.path, default_IMG_path]
               );
          
       }

       //list file info to see
       files.forEach(file => {
            console.log(file);
       });

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
               const [row] = await db.execute('select songPath from songLib where songID = ?', [id]);

               //if nun found continue
               if(row.length === 0){
                    continue;
               }

               //gets song path
               const songPath = row[0].songPath;

               //waits for deletion of the directory 
               await fs.unlink(songPath, (err)=>{
                    if(err){
                         console.log(err.message);
                         throw err;
                    }
                    else{
                         console.log(`${songPath} has been deleted from songFolder`);
                    }
               })

               //deletes from the db
               await db.execute(`DELETE from songLib where songID = ?`, [id]);

          }

          //return message
          return res.status(200).json({message: 'song library has been updated!'});
     }
     catch(error){
          console.log(error.message);
          return res.status(500).json({message: "internal server error!"});
     }
}

export const editSong = async(req,res)=>{
     try{
          const songId = req.params.id;
          const {newSongName, newArtistName} = JSON.parse(req.body.newSongInfo);


          if(!newSongName?.trim() && !newArtistName?.trim() && !req.file){
               return res.status(400).json({message: 'no change was sent'});
          }

          const [checkValid] = await db.execute(`select * from songLib where songID = ?`, [songId]);
          if(checkValid.length === 0){
               return res.status(400).json({message: 'song does not exist'});
          }

          const SongName = newSongName?.trim() ? newSongName.trim() : checkValid[0].songName;
          const ArtistName = newArtistName?.trim() ? newArtistName.trim() : checkValid[0].artistName;
          let imagePath = checkValid[0].imagePath;

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

               imagePath = `/SongImage/${req.file.filename}`;
          }

          await db.execute(
                              `UPDATE songLib 
                               set songName = ?, artistName = ?, imagePath = ? 
                               where songID = ?`, [SongName, ArtistName, imagePath, songId]
                              );

          return res.status(200).json({message: 'song updated!'});

     }
     catch(error){
          console.log(error);
          return res.status(500).json({message: 'Internal server error!'})
     }
}

export const loadSongs = async (req,res) =>{
    try{
        const offset = req.params.offset;

        const [result] = await db.execute(`
               select songID, songName, artistName, duration, imagePath 
               from songLib limit 20 offset ?`, [offset]);

        console.log(result);

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
