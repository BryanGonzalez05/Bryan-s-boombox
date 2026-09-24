
const songPageBTN = document.getElementById('songPageBTN');
const playlistPageBTN = document.getElementById('playlistPageBTN');
let currentPage = 'none';

if(songPageBTN.classList.contains('active')) {
    console.log('song page btn');
    currentPage = 'song';
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

close_song_container_btn.addEventListener('click', ()=>{
    add_song_container.classList.add('hidden');
    document.body.style.overflow = '';
    selected_file.value = '';
    song_name.value = '';
    artist_name.value = '';
})


/* submit song to backend */
const submit_song_form = document.getElementById('song-form');
submit_song_form.addEventListener('submit', async(event)=>{
    event.preventDefault();
    try{
        const form_data = new FormData();

        const songInfo = {
            songName: song_name.value,
            artistName: artist_name.value
        }

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
        }
        else{
            console.log(data.message);
        }

    }
    catch(error){
        console.log(error);
    }
})


