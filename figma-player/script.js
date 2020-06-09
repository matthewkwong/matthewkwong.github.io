var state = "State: Login Page";

// Get the hash of the url
const hash = window.location.hash
  .substring(1)
  .split("&")
  .reduce(function(initial, item) {
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
const clientId = "369e950eef504137aa80cdc2114a3396";
const redirectUri = "https://www.matthewkwong.com/figma-player/index.html";
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

// Waits for user to be logged in
function activatePlayer() {
  if (_token) {
    // Set up the Web Playback SDK
    window.onSpotifyPlayerAPIReady = () => {
      let player = new Spotify.Player({
        name: "Web Playback SDK Template",
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
        $("#current-track").attr(
          "src",
          state.track_window.current_track.album.images[0].url
        );
        $("#current-track-name").text(state.track_window.current_track.name);
        // $("#current-track-artist").text(state.track_window.current_track.artist);
      });

      player.on("ready", data => {
        console.log("Ready with Device ID", data.device_id);

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

if (state == "State: Player connected") {
  //Remove Home login screen, display player
  document.getElementById("home").style.display = "none";
  // document.getElementById("player").style.display = "block";
  document.getElementById("login-home").style.display = "block";

  // Welcome message
  $.ajax({
    url: "https://api.spotify.com/v1/me",
    type: "GET",
    beforeSend: function(xhr) {
      xhr.setRequestHeader("Authorization", "Bearer " + _token);
    },
    success: function(user) {
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
    beforeSend: function(xhr) {
      xhr.setRequestHeader("Authorization", "Bearer " + _token);
    },
    success: function(data) {
      // Do something with the returned data
      //       data.items.map(function(items) {
      //         // print out the playlist id
      //         console.log(`Here are each of the playlist IDs: ${items.id}`);

      //         let playlistName = $("<a><li>" + items.name + "</li></a>").attr(
      //           "href",
      //           `${items.external_urls.spotify}`
      //         );
      //         playlistName.appendTo($("#users-playlists"));
      //       });
      

      let playlist_id_collection = [];
      let playlist_id = 0;
      
      data.items.map(function(playlist) {
        playlist_id = playlist.id;
        playlist_id_collection.push(playlist_id);
        
        let img = $("<img/>");
        img.attr("src", playlist.images[0].url);
        // img.attr("class", "users-playlists");
        img.appendTo("#users-playlists-wrapper");
      });
      
      console.log(playlist_id_collection);

      state = "State: Retrieved user's playlists";
      console.log(state);

      //Index of each playlist
      $("#users-playlists-wrapper img").click(function(playlist) {

        
        // Hide login-home and show the tracks of the playlist:                
        document.getElementById("login-home").style.display = "none";
        // document.getElementById("player").style.display = "block";
        document.getElementById("playlist-view").style.display = "block";
        
        selectedPlaylist = $("#users-playlists-wrapper img").index(this);
        console.log(`User selected playlist ${selectedPlaylist}`);
              
        let img = $("<img/>");
        img.attr("src", playlist.images.url);
        // img.attr("class", "users-playlists");
        img.appendTo("#playlist-view");
        
        state = "User chose playlist";
        console.log(state);
      
      });
    
      
      
      

    }
  });
} else {
  console.log("fail");
}

// If user chooses a playlist to listen to:
if(state == "State: Retrieved user's playlists"){

}


// Play a specified track on the Web Playback SDK's device ID
function play(device_id) {
  $.ajax({
    url: "https://api.spotify.com/v1/me/player/play?device_id=" + device_id,
    type: "PUT",
    data: '{"uris": ["spotify:track:5FEXPoPnzueFJQCPRIrC3c"]}',
    beforeSend: function(xhr) {
      xhr.setRequestHeader("Authorization", "Bearer " + _token);
    }
  });
  state = "State: first song playing";
  console.log(state);
}

// Pausing playback
function playPause(device_id) {
  if (state == "State: first song playing" || state == "State: song resume") {
    $.ajax({
      url: "https://api.spotify.com/v1/me/player/pause",
      type: "PUT",
      beforeSend: function(xhr) {
        xhr.setRequestHeader("Authorization", "Bearer " + _token);
      }
    });
    state = "State: song paused";
    console.log(state);
  } else if ((state = "State: song paused")) {
    $.ajax({
      url: "https://api.spotify.com/v1/me/player/play",
      type: "PUT",
      beforeSend: function(xhr) {
        xhr.setRequestHeader("Authorization", "Bearer " + _token);
      }
    });
    state = "State: song resume";
    console.log(state);
  }
}

// Pausing playback
function resume(device_id) {}

// Previous song
function back(device_id) {
  $.ajax({
    url: "https://api.spotify.com/v1/me/player/previous",
    type: "POST",
    beforeSend: function(xhr) {
      xhr.setRequestHeader("Authorization", "Bearer " + _token);
    },
    success: function(data) {
      state = "Previous song";
      console.log(state);
    }
  });
}

// Skip to next song
function forward(device_id) {
  $.ajax({
    url: "https://api.spotify.com/v1/me/player/next",
    type: "POST",
    beforeSend: function(xhr) {
      xhr.setRequestHeader("Authorization", "Bearer " + _token);
    },
    success: function(data) {
      state = "Next song";
      console.log(state);
    }
  });
}
