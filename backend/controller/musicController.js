

exports.UploadSong = async(req,res)=>{
    const musicID = req.query.id;

    console.log(musicID);
    res.send(`song has been received music id: ${musicID}`);
}
