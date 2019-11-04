$(document).ready(function () {
  //Goes to portfolio
  $("#portfolio-button").click(function(){
    $('html, body').animate({
      scrollTop:$("#portfolio").offset().top - 100
    }, 1000);
  });
});

// Scroll elements fade in
$(document).on("scroll", function () {
  var pageTop = $(document).scrollTop()
  var pageBottom = pageTop + $(window).height()
  var tags = $(".project")

  for (var i = 0; i < tags.length; i++) {
    var tag = tags[i]
    if ($(tag).position().top < pageBottom) {
    $(tag).addClass("visible")
    }
    else {
      $(tag).removeClass("visible")
      }
  }
})

$(document).ready(function(){
  /*Fades in page on load */
  $('body, .about-me-wrapper').css('display', 'none');
  $('body, .about-me-wrapper').fadeIn(1000);
});

// Navbar
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    document.getElementById("navbar").style.top = "0";
  } else {
    document.getElementById("navbar").style.top = "-50px";
  }
}




// navbar slides down on mobile
$(document).ready(function () {
  $('#nav-button').click(function(){
    $('.nav-links').animate({width: 'toggle'}, 300)();
  });
});
