// Get the hash of the url
const hash = window.location.hash
.substring(1)
.split('&')
.reduce(function (initial, item) {
  if (item) {
    var parts = item.split('=');
    initial[parts[0]] = decodeURIComponent(parts[1]);
  }
  return initial;
}, {});

// Opens the authorization window
window.location.hash = '';


// Set token
let _token = hash.access_token;

const authEndpoint = 'https://accounts.spotify.com/authorize';

// Replace with your app's client ID, redirect URI and desired scopes
const clientId = '369e950eef504137aa80cdc2114a3396';
const redirectUri = 'https://meadow-righteous-brook.glitch.me';
const scopes = [
  // 'streaming',
  // 'user-read-playback-state',
  // 'user-library-read',
  // 'user-read-recently-played',
  // 'user-read-currently-playing',
  // 'user-modify-playback-state',
  'playlist-read-private',
  'playlist-read-collaborative'
];
  
// If there is no token, redirect to Spotify authorization
if (!_token) {
  window.location = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join('%20')}&response_type=token&show_dialog=true`;
}


// Set up the Web Playback SDK
// else{
window.onSpotifyPlayerAPIReady = () => {
  let player = new Spotify.Player({
    name: 'Web Playback SDK Template',
    getOAuthToken: cb => { cb(_token); }
  });

  // Error handling
  player.on('initialization_error', e => console.error(e));
  player.on('authentication_error', e => console.error(e));
  player.on('account_error', e => console.error(e));
  player.on('playback_error', e => console.error(e));

  // Playback status updates
  player.on('player_state_changed', state => {
    console.log(state)
    $('#current-track').attr('src', state.track_window.current_track.album.images[0].url);
    $('#current-track-name').text(state.track_window.current_track.name);
  });

  player.on('ready', data => {
    console.log('Ready with Device ID', data.device_id);
    
    // Play a track using our new device ID
    play(data.device_id);
  });

  // Connect to the player!
  player.connect();
}


// Play a specified track on the Web Playback SDK's device ID
function play(device_id) {
  $.ajax({
   url: "https://api.spotify.com/v1/me/player/play?device_id=" + device_id,
   type: "PUT",
   data: '{"uris": ["spotify:track:7L9g4cPfohScjJ8mGwLQWr"]}',
   beforeSend: function(xhr){xhr.setRequestHeader('Authorization', 'Bearer ' + _token );},
   success: function(data) { 
     console.log(data)
   }
  });
}

$.ajax({
   url: "https://api.spotify.com/v1/me/playlists?limit=4",
   type: "GET",
   beforeSend: function(xhr){xhr.setRequestHeader('Authorization', 'Bearer ' + _token );},
   success: function(data) { 
     // Do something with the returned data
     data.items.map(function(item) {
       let playlist = $('<li>' + item.name + '</li>');
       playlist.appendTo($('#top-artists'));
     });
   }
});