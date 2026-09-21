
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
const artiest_name = document.getElementById('artiest-name');

close_song_container_btn.addEventListener('click', ()=>{
    add_song_container.classList.add('hidden');
    document.body.style.overflow = '';
    selected_file.value = '';
    song_name.value = '';
    artiest_name.value = '';
})


/* submit song to backend */
const submit_song_form = document.getElementById('submit-song-form');
submit_song_form.addEventListener('submit', async()=>{
    try{
        const form_data = new FormData();

        const songInfo = {
            songName: song_name.value,
            artistName: artiest_name.value
        }

        form_data.append('file', selected_file.files[0]);
        form_data.append('songInfo', JSON.stringify(songInfo));

        const response = await fetch('http://localhost:5000/song/UploadSong',{
            method: 'POST',
            body: form_data
        })

        const data = await response.json();
        
        console.log(data.message)
    }
    catch(error){
        console.log(error);
    }
})


