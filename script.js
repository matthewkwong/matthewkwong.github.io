document.addEventListener("DOMContentLoaded", function() {
    const toggleButton = document.getElementById("toggleButton");
    const moreWorkSection = document.querySelector(".more-work");

    toggleButton.addEventListener("click", function(event) {
        event.preventDefault(); // Prevent default link behavior

        if (!moreWorkSection.classList.contains("visible")) {
            // Show the section
            moreWorkSection.style.display = "block";
            // Force a reflow
            moreWorkSection.offsetHeight;
            // Add the visible class to trigger the transition
            moreWorkSection.classList.add("visible");
            toggleButton.innerHTML = 'Show <a href="#" id="toggleLink">less work</a> 🫣';
        } else {
            // Remove the visible class to trigger the transition
            moreWorkSection.classList.remove("visible");
            // Wait for the transition to complete before hiding
            setTimeout(() => {
                moreWorkSection.style.display = "none";
            }, 300); // Match this with the transition duration in CSS
            toggleButton.innerHTML = 'Looking for <a href="#" id="toggleLink">more work</a>? 👀';
        }
    });
});

$(document).ready(function(){
    /*Fades in page on load */
    $('body, .about-me-wrapper').css('display', 'none');
    $('body, .about-me-wrapper').fadeIn(1000);
  });
  
  // Image - Fullscreen on click
  window.onload = () => {
    let images = document.querySelectorAll("img");
    let fullscreen = document.getElementById("fullscreen");
   
  // Clones into fullscreen div
    if (images.length > 0) {
      for (let x of images) {
        x.onclick = (e) => {
          // Prevent fullscreen for images in nav or footer, or with logo ids
          if (
            x.closest('nav') ||
            x.closest('#footer-content') ||
            x.id === 'logo' ||
            x.id === 'logo-white'
          ) {
            return;
          }
          let clone = x.cloneNode();
          clone.className = "";
          fullscreen.innerHTML = "";
          fullscreen.appendChild(clone);
          fullscreen.className = "show";
        };
      }
    }
  
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
  
  // Display year at bottom of nav
  const year = new Date().getFullYear();
  document.getElementById("year").innerHTML = year;