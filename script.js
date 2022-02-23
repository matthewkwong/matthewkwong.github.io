$(document).ready(function(){
  /*Fades in page on load */
  $('body, .about-me-wrapper').css('display', 'none');
  $('body, .about-me-wrapper').fadeIn(1000);
});

// Image - Fullscreen on click
window.onload = () => {
  let images = document.querySelectorAll(".right img");
  let fullscreen = document.getElementById("fullscreen");
 
// Clones into fullscreen div
  if (images.length > 0) { for (let x of images) {
    x.onclick = () => {
      let clone = x.cloneNode();
      clone.className = "";
      fullscreen.innerHTML = "";
      fullscreen.appendChild(clone);
      fullscreen.className = "show";
    };
  }}

  fullscreen.onclick = () => {
    fullscreen.className = "";
  };
};


// Fullscreen Video
var elem = document.querySelector(".vid");

function openFullscreen() {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) { /* Safari */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE11 */
    elem.msRequestFullscreen();
  }
}


// Disable Scroll on nav
function disable(){
  document.querySelector('body').classList.add('disable-scroll');
}

function enable(){
  document.querySelector('body').classList.remove('disable-scroll');
}

document.querySelector('#hamburger').addEventListener('click', disable);
document.querySelector('#close').addEventListener('click', enable);