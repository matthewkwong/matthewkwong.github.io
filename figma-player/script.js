var state = "State: Login Page";

// Get the hash of the url
const hash = window.location.hash
    .substring(1)
    .split("&")
    .reduce(function (initial, item) {
        if (item) {
            var parts = item.split("=");
            initial[parts[0]] = decodeURIComponent(parts[1]);
        }
        return initial;
    }, {});

window.location.hash = "";

// Set token
let _token = hash.access_token;
const authEndpoint = "https://accounts.spotify.com/authorize";

// Replace with your app's client ID, redirect URI and desired scopes
// const clientId = "369e950eef504137aa80cdc2114a3396";
const redirectUri = "https://www.matthewkwong.com/figma-player/index.html";
const redirectUri = "http://127.0.0.1:8080/figma-player/index.html";

const scopes = [
    "user-read-email",
    "user-read-private",

    "streaming",
    "user-read-playback-state",
    "user-library-read",
    "user-read-recently-played",
    "user-read-currently-playing",
    // Modify Previous and Next
    "user-modify-playback-state",
    //   Get playlists
    "playlist-read-private",
    "playlist-read-collaborative"
];

// If there is no token, redirect to Spotify authorization
function login() {
    if (!_token) {
        window.location = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join(
            "%20"
        )}&response_type=token&show_dialog=true`;
    }
    state = "State: loggedin";
}
console.log(state);

activatePlayer();


let device_id = 0;
// Waits for user to be logged in
function activatePlayer() {
    if (_token) {
        // Set up the Web Playback SDK
        window.onSpotifyPlayerAPIReady = () => {
            let player = new Spotify.Player({
                name: "Figma Spotify Web Player",
                getOAuthToken: cb => {
                    cb(_token);
                }
            });

            // Error handling
            player.on("initialization_error", e => console.error(e));
            player.on("authentication_error", e => console.error(e));
            player.on("account_error", e => console.error(e));
            player.on("playback_error", e => console.error(e));

            // Playback status updates
            player.on("player_state_changed", state => {
                console.log(state);
                $("#current-track-image").attr(
                    "src",
                    state.track_window.current_track.album.images[0].url
                );
                $("#current-track-name").text(state.track_window.current_track.name);

                $("#current-track-artist").text(state.track_window.current_track.artists[0].name);
                // console.log(state.track_window.current_track.artists[0]);
            });

            player.on("ready", data => {
                console.log("Ready with Device ID", data.device_id);
                device_id = data.device_id
                // Play a track using our new device ID
                // play(data.device_id);
            });

            // Connect to the player!
            player.connect();
        };
        state = "State: Player connected";
        console.log(state);
    }
}
let playlist_id = 0;

if (state == "State: Player connected") {
    //Remove Home login screen, display player
    document.getElementById("home").style.display = "none";
    document.getElementById("login-home").style.display = "block";

    // Welcome message
    $.ajax({
        url: "https://api.spotify.com/v1/me",
        type: "GET",
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + _token);
        },
        success: function (user) {
            let username = document.getElementById("username");
            username.textContent += user.display_name;
            state = "State: Got username";
            console.log(state);
        }
    });

    // Gets user's first 4 playlists
    let selectedPlaylist = 0;
    $.ajax({
        url: "https://api.spotify.com/v1/me/playlists?limit=4",
        type: "GET",
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + _token);
        },
        success: function (data) {

            let playlist_id_collection = [];
            let playlist_name_collection = [];
            let playlist_image_collection = [];

            let img = null;

            selectedPlaylistImageUrl = null;

            data.items.map(function (playlist) {
                playlist_id = playlist.id;
                let playlistName = playlist.name;
                let playlistImage = playlist.images[0].url;

                playlist_id_collection.push(playlist_id);
                playlist_name_collection.push(playlistName);
                playlist_image_collection.push(playlistImage);

                // In div wrapper - already made. 

                // Create new div 
                // inside div has image 
                // inside dive has playlist name

                img = $("<img/>");
                // img.appendTo(playlist_image_collection);
                console.log(playlist_image_collection);
                img.attr("src", playlist.images[0].url);
                img.appendTo("#users-playlists-wrapper");

            });

            console.log(playlist_name_collection);
            console.log(playlist_id_collection);

            state = "State: Retrieved user's playlists";
            console.log(state);


            // User clicks a playlist
            $("#users-playlists-wrapper img").click(function () {

                // Hide login-home and show the tracks of the playlist:                
                document.getElementById("login-home").style.display = "none";
                document.getElementById("playlist-view").style.display = "block";

                // Sets selectedPlaylist equal to the number the user clicked
                selectedPlaylist = $("#users-playlists-wrapper img").index(this);
                console.log(`User selected playlist #${selectedPlaylist}`);

                // Get Selected playlist album cover
                let selectedPlaylistImage = $("<img/>");
                selectedPlaylistImage.attr("src", playlist_image_collection[selectedPlaylist]);
                selectedPlaylistImage.appendTo("#playlist-image-wrapper");

                // Check which playlist user selected
                // If selected 1, find 1 in the selectedPlaylist array. 

                // Use the playlist number the user clicked on to get back the 
                // nth playlist id number from the playlist_id_collection array. 
                playlist_id = playlist_id_collection[selectedPlaylist];
                playlistName = playlist_name_collection[selectedPlaylist];
                console.log("playlist_id = " + playlist_id);

                // Set playlist name as header on the next page
                document.getElementById("playlist-name").innerHTML = playlistName;

                state = "Get user playlist data";
                console.log(state);

                // Second API call that searches for the user's selected playlist
                // display playlist image
                // display title of playlist
                // display list of songs.
                getPlaylistData(playlist_id);
            });
        }
    });
} else {
    console.log("fail");
}


let song_uri = 0;
let song_uri_collection = [];

function getPlaylistData(playlist_id) {
    // console.log("Currently in: Playlist " + playlist_id);

    $.ajax({
        url: `https://api.spotify.com/v1/playlists/` + playlist_id + `/tracks?fields=items(track(name,uri))`,
        type: "GET",
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + _token);
        },

        // Adds each song into a list
        success: function (songs) {

            for (let i = 0; i < songs.items.length; i++) {

                // Add each song to the songID collection 
                song_uri = songs.items[i].track.uri;
                song_uri_collection.push(song_uri);

                // console.log(songs.items[i].track.name);
                let song = $("<a><li>" + songs.items[i].track.name + "</li></a>")

                song.appendTo($("#playlist-songs"));
            }
            // console.log(song_uri_collection);

            // User selects a song:
            $("#playlist-songs li").click(function () {
                let selectedSong = $("#playlist-songs li").index(this);
                song_uri = song_uri_collection[selectedSong];
                console.log("Spotify URI: " + song_uri);

                // Hide playlist songs and show player:                
                document.getElementById("playlist-view").style.display = "none";
                document.getElementById("player").style.display = "block";

                state = "State: User selected song";
                console.log(state);

                play(device_id, song_uri);
            });
        }
    });

    state = "State: Aquired current playlists songs"
    console.log(state);


    // getPlaylistImage();
}


// function getPlaylistImage(){
//     $.ajax({
//         url: "https://api.spotify.com/v1/playlists/" + playlist_id + "/images",
//         type: "GET",
//         beforeSend: function (xhr) {
//             xhr.setRequestHeader("Authorization", "Bearer " + _token);
//         },
//         success: function (playlist) {

//             // let playlistImage = playlist[0].height;
//         }
//     });

//     state = "State: Added playlist album art";
//     console.log(state);
// }



function playPlaylist() {
    console.log(playlist_id);
    let playlist_uri = `spotify:playlist:${playlist_id}`;
    console.log(playlist_uri);

    $.ajax({
        url: "https://api.spotify.com/v1/me/player/play?device_id=" + device_id,
        type: "PUT",
        data: JSON.stringify({ "context_uri": playlist_uri }),
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + _token);
        }
    });

    document.getElementById("player").style.display = "block";
    document.getElementById("playlist-view").style.display = "none";

    state = "State: Song playing";
    console.log(state);
}


// Play a specified track on the Web Playback SDK's device ID
function play(device_id, song_uri) {
    console.log("Playing: " + song_uri);

    $.ajax({
        url: "https://api.spotify.com/v1/me/player/play?device_id=" + device_id,
        type: "PUT",
        data: JSON.stringify({ "uris": [song_uri] }),
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + _token);
        }
    });
    // currentSong();

    state = "State: Song playing";
    console.log(state);
}



// // Current Playling Song
// function currentSong() {
//     $.ajax({
//         url: "https://api.spotify.com/v1/me/player/currently-playing",
//         type: "GET",
//         beforeSend: function (xhr) {
//             xhr.setRequestHeader("Authorization", "Bearer " + _token);
//         },
//         success: function (song) {

//             // document.getElementById("current-track-image")
//             console.log(song.item.album.artists[]);
//             // let songImage = user.item;
//             // console.log(songImage);
//             // let songTitle = ;
//             // let song

//             state = "State: Got song data";
//             console.log(state);
//         }
//     });
// }


let image = document.getElementById("playlist-image-wrapper");


// Have a bunch of if else statements to go back to different views depending on what they click. 
function back() {
    // If on the playlists views
    if (state == "State: Aquired current playlists songs") {
        document.getElementById("home").style.display = "none";
        document.getElementById("playlist-view").style.display = "none";
        document.getElementById("login-home").style.display = "block";


        //Removes duplicate cover problem where if user goes back, 
        // all previous playlists will show
        while (image.childNodes.length > 0) {
            image.removeChild(image.childNodes[0]);
        }
        // image.removeChild(image.childNodes[0]);
        // image.removeChild(image.childNodes[1]);
        state = "State: returned to login-home";
        console.log(state);
    }

    if (state == "State: returned to login-home") {
        state = "State: returned to playlist view";
        console.log(state);
    }

    // If on the player
    else if (state == "State: Song playing" || state == "State: Song paused") {
        document.getElementById("player").style.display = "none";
        document.getElementById("playlist-view").style.display = "block";
        state = "State: returned to playlist view";
        console.log(state);
    }

    // Go back to home page:
    else if (state == "State: returned to playlist view") {
        document.getElementById("playlist-view").style.display = "none";
        document.getElementById("login-home").style.display = "block";


        //Removes duplicate cover problem where if user goes back, 
        // all previous playlists will show
        while (image.childNodes.length > 0) {
            image.removeChild(image.childNodes[0]);
        }

        state = "State: returned to home page";
        console.log(state);
    }
}




// Play and Pausing playback
let currentSongImage = document.getElementById("current-track-image");
currentSongImage.style.animationPlayState = "running";




function playPauseButton() {
    var playPauseButton = document.getElementById("play-pause-song");
    // If "mystyle" exist, overwrite it with "mystyle2"
    if (playPauseButton.className === "fas fa-pause-circle") {
        console.log("Pause");
        playPauseButton.className = "fas fa-play-circle";
    } else {
        console.log("Playing");
        playPauseButton.className = "fas fa-pause-circle";
    }
}

function playPause() {

    playPauseButton();


    if (state == "State: Song playing") {
        $.ajax({
            url: "https://api.spotify.com/v1/me/player/pause",
            type: "PUT",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Bearer " + _token);
            }
        });
        // playPauseButton.className("fa-pause-circle");

        // Change play icon to pause icon

        currentSongImage.style.animationPlayState = "paused";
        state = "State: Song paused";
        console.log(state);
    }
    else if ((state = "State: Song paused")) {
        $.ajax({
            url: "https://api.spotify.com/v1/me/player/play",
            type: "PUT",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Bearer " + _token);
            }
        });

        // playPauseButton.className("fa-play-circle");

        currentSongImage.style.animationPlayState = "running";
        state = "State: Song playing";
        console.log(state);
    }
}


// Previous song
function previous() {
    $.ajax({
        url: "https://api.spotify.com/v1/me/player/previous",
        type: "POST",
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + _token);
        },
        success: function (data) {
            state = "State: Previous song";
            console.log(state);
        }
    });
}

// Skip to next song
function forward() {
    $.ajax({
        url: "https://api.spotify.com/v1/me/player/next",
        type: "POST",
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + _token);
        },
        success: function () {
            state = "State: Next song";
            console.log(state);
        }
    });
}
