console.log("javascript is active!");

$(document).ready(function() {
  $("#logo").effect("bounce", {
      times: 1
  }, 530);
});
// background is as big as the screen size
// document.body.style.height = window.innerHeight;


$(document).ready(function() {
  //scroll feature  - Learn More
  $("#about-nav").click(function(){
    $('html, body').animate({
      scrollTop:$("#about").offset().top - 100
    }, 1000);
  });


  $("#portfolio-nav").click(function(){
    $('html, body').animate({
      scrollTop:$("#portfolio").offset().top - 100
    }, 1000);
  });
});
