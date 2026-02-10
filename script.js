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
  
  
  // Disable scroll when mobile menu is open (lock both html and body)
  var savedScrollY = 0;
  function disable(){
    savedScrollY = window.scrollY || document.documentElement.scrollTop;
    document.documentElement.classList.add('disable-scroll');
    document.body.classList.add('disable-scroll');
    document.body.style.top = '-' + savedScrollY + 'px';
  }

  function enable(){
    document.documentElement.classList.remove('disable-scroll');
    document.body.classList.remove('disable-scroll');
    document.body.style.top = '';
    window.scrollTo(0, savedScrollY);
  }

  var hamburger = document.querySelector('#hamburger');
  var closeBtn = document.querySelector('#close');
  var checkbox = document.querySelector('#checkbox_toggle');

  // Drive scroll-locking off the checkbox state (labels toggle it).
  // This avoids calling disable()/enable() in the wrong order on close/open.
  if (checkbox) {
    checkbox.addEventListener('change', function() {
      if (this.checked) disable();
      else enable();
    });
  }
  
  // Display year at bottom of nav
  const year = new Date().getFullYear();
  document.getElementById("year").innerHTML = year;