//offest for loading songs
let song_offset = 0;
let playlist_offset = 0;

const songMap = new Map();


//fire load function when anchor is in view port
const song_library_anchor = document.getElementById('song-library-anchor');
let isloading = false;

const MissingContainer = document.getElementById('Missing-container');

const observer = new IntersectionObserver(async(entries) =>{
    if(entries[0].isIntersecting && !isloading){

        isloading = true;
        
        try{

            if(currentPage === 'song'){
                const response = await load_songs_to_library(song_offset);
                
                if(response.success){
                    response.songs.forEach(song=>{
                        console.log(song);
                        songMap.set(song.songID,{   
                                songID : song.songID,
                                songName : song.songName,
                                artistName : song.artistName,
                                duration : song.duration,
                                imagePath : song.imagePath,
                                songPath : song.songPath
                            })

                        add_new_song_div(song);
                    })

                    console.log(songMap);
                    song_offset += 100;
                }
                else if(response.status === 503){
                    console.log('error here');
                    document.body.style.overflow = 'hidden';
                    MissingContainer.classList.remove('hidden');
                    song_library_anchor.classList.add('hidden');
                    MissingImages(response);
                }
                else {
                    song_library_anchor.classList.add('hidden');
                }
            }
        }
        catch(error){
            console.log(error);
        }
        finally{
            isloading = false;
        }
        
    }
}, {rootMargin : '200px'})



//load song function
const songLib_body = document.getElementById('songLib-body');
async function load_songs_to_library (o){
    const url = `http://localhost:5000/song/loadSongs/${o}`;

    try{
        const response = await fetch(url,{
            method : 'GET',
            headers : {
                'Content-Type' : 'application/json'
            }
        })

        const data = await response.json();
        if(response.ok){
            return {success : true, songs: data.songs, message : data.message};
        }
        if(response.status === 503){
            return {
                success : false, message : data.message,
                status: response.status,
                MissingSongImg : data.songImageMissing,
                MissingPlaylistImg : data.playlistImageMissing}
        }
        else{
            return {success : false, message : data.message};
        }
    }
    catch(err){
        console.error(err);
        return {success : false, message : 'Error! server failed'};
    }

}



/* Missing import images function */
const missingSongImageDiv = document.getElementById('missing-songImage');
const missingPlaylistImageDiv = document.getElementById('missing-playlistImage');

function MissingImages(response){
    //fetches two booleans 
    const missingSongImage = response.MissingSongImage;
    const missingPlaylistImage = response.MissingPlaylistImage;

    
    if(missingPlaylistImage){
        missingPlaylistImageDiv.classList.remove('hidden');
    }
    if(missingSongImage){
        missingSongImageDiv.classList.remove('hidden');
    }
}


const MissingformDiv = document.getElementById('Missing-form');

MissingformDiv.addEventListener('submit', (e)=>{
    e.preventDefault();
    const formData = new FormData(MissingformDiv);

    /*create the function and use a multer feild of upload.fields([
    { name: 'songImage', maxCount: 1 },
    { name: 'playlistImage', maxCount: 1 }
    ])*/
})



//create the new song elements to song body
function add_new_song_div(s){

    const fetchImage = `http://localhost:5000/${s.imagePath}`;

    const new_song_div = document.createElement('div');
    new_song_div.classList.add('song-div');
    new_song_div.dataset.songID = s.songID;
    new_song_div.innerHTML = `
        <div class="left">
                <img src="${fetchImage}" alt="song image">
                <div class="songInfo">
                    <p>${s.songName}</p>
                    <p>${s.artistName}</p>
                </div>
            </div>
            <div class="right">
                <button class="optionBTN">...</button>
                <p>${s.duration}</p>
            </div>
    `;

    songLib_body.appendChild(new_song_div);
}


const songPageBTN = document.getElementById('songPageBTN');
const playlistPageBTN = document.getElementById('playlistPageBTN');
let currentPage = 'none';

if(songPageBTN.classList.contains('active')) {
    console.log('song page btn');
    currentPage = 'song';
    observer.observe(song_library_anchor);

}
else{
    console.log('playlist page btn');
    currentPage = 'playlist'
}




const activationBTN = document.getElementById('activationBTN');
const add_song_container = document.getElementById('add-song-container');
const add_song_div = document.getElementById('add-song-div');
const close_song_container_btn = add_song_container.querySelector('.closeBTN');

/* action btn function*/
activationBTN.addEventListener('click', ()=>{
    switch(currentPage){
        case 'song':    
            
            add_song_container.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            break;
        default:
            console.log('error');
    }

})


/* close add-song-container */
const selected_file = document.getElementById('selected-file');
const song_name = document.getElementById('song-name');
const artist_name = document.getElementById('artist-name');
const song_added_status = document.getElementById('song-added-status');

close_song_container_btn.addEventListener('click', ()=>{
    add_song_container.classList.add('hidden');
    song_added_status.classList.add('hidden')
    document.body.style.overflow = '';
    selected_file.value = '';
    song_name.value = '';
    artist_name.value = '';
})


/* submit song to backend */
const submit_song_form = document.getElementById('song-form');
submit_song_form.addEventListener('submit', async(event)=>{

    //prevent refresh when submitting 
    event.preventDefault();

    try{
        
        //creates an object to store the data from the from
        const form_data = new FormData();

        //create an object to send to backend as it expects an object
        const songInfo = {
            songName: song_name.value,
            artistName: artist_name.value
        }

        //append data to formdata
        form_data.append('file', selected_file.files[0]);
        form_data.append('songInfo', JSON.stringify(songInfo));


        const response = await fetch('http://localhost:5000/song/UploadSong',{
            method: 'POST',
            body: form_data
        })

        const data = await response.json();
        if(response.ok){
            console.log('song has been added to library');
            selected_file.value = '';
            song_name.value = '';
            artist_name.value = '';
            
            songMap.set(response.newSong.songID, {
                    songID : response.newSong.songID,
                    songName : response.newSong.songName,
                    artistName : response.newSong.artistName,
                    duration : response.newSong.duration,
                    imagePath : response.newSong.imagePath,
                    songPath : response.newSong.songPath
            })

            load_songs_to_library(response.newSong);
        }
        else{
            console.log(data.message);
        }
        song_added_status.textContent = data.message;
    }
    catch(error){
        song_added_status.textContent = 'file is already stored or server error!';
        console.log(error);
    }
})




