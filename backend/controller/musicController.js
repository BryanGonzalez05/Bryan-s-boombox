

exports.UploadSong = async(req,res)=>{
   const files = req.files;

   if(!files ||files.length === 0){
        return res.status(404).json({message: 'Error! there are no files inputted'})
   }
   files.forEach(file => {
        console.log(file);
   });

   return res.status(200).json({message: "Success"})
}
