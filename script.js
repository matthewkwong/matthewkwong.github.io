console.log("javascript is active!");


// Navbar
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    document.getElementById("navbar").style.top = "0";
  } else {
    document.getElementById("navbar").style.top = "-50px";
  }
}


$(document).ready(function() {

  //scroll feature  - Learn More
  $("#about-nav").click(function(){
    $('html, body').animate({
      scrollTop:$("#about").offset().top - 100
    }, 1000);
  });

  //Goes to portfolio
  $("#portfolio-nav").click(function(){
    $('html, body').animate({
      scrollTop:$("#portfolio").offset().top - 100
    }, 1000);
  });


  $('#nav-button').click(function(){
    $('#nav-links').slideToggle();
  });
});
