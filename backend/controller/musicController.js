
exports.UploadSong = async(req,res)=>{
     
   const files = req.files;
   
   //checks if are files
   if(!files ||files.length === 0){
        return res.status(404).json({message: 'Error! there are no files inputted'})
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

     //store info to database
     console.log(`filename : ${match.originalname}\n artist name: ${si.artistName}`)
   }

   files.forEach(file => {
        console.log(file);
   });

   return res.status(200).json({message: "Success"})
}
