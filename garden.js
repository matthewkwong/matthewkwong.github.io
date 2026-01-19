      const swiper = new Swiper(".mySwiper", {
          spaceBetween: 40,
          centeredSlides: true,
          slidesPerView: 2.43,
          loop: true,
          grabCursor: true,

          effect: "coverflow",
          coverflowEffect: {
            rotate: 0,
            stretch: 0,
            depth: 100,
            modifier: 2.5,
            slideShadows: false
          },

          pagination: {
            el: ".swiper-pagination",
            clickable: true
          }
        });



const images = [
  {
    src: "https://lego.brickinstructions.com/images/boba-fett.png",
    alt: "Illustration",
    code: "# 23",
    link: "https://www.instagram.com/p/DSnzm8UEkRi/?hl=en"
  },
  {
    src: "https://lego.brickinstructions.com/images/boba-fett.png",
    alt: "Illustration",
    code: "# 24",
    link: "https://www.instagram.com/p/DSnzm8UEkRi/?hl=en"
  },
  {
    src: "https://lego.brickinstructions.com/images/boba-fett.png",
    alt: "Illustration",
    code: "# 25",
    link: "https://www.instagram.com/p/DSnzm8UEkRi/?hl=en"
  },
  {
    src: "https://lego.brickinstructions.com/images/boba-fett.png",
    alt: "Illustration",
    code: "# 26",
    link: "https://www.instagram.com/p/DSnzm8UEkRi/?hl=en"
  }
];


const gallery = document.getElementById("gallery");
let activeIndex = 1;

images.forEach((image, index) => {
  const card = document.createElement("div");
  card.className = "card";
  if (index === activeIndex) card.classList.add("active");

  card.innerHTML = `
    <div class="overlay"></div>
    <div class="label">${image.code}</div>
    <img src="${image.src}" alt="${image.alt}">
  `;

  // Hover expands
  card.addEventListener("mouseenter", () => {
    setActive(index);
  });

  // Click logic
card.addEventListener("click", () => {
  if (activeIndex === index) {
    window.open(image.link, "_blank", "noopener,noreferrer");
  } else {
    setActive(index);
  }
});

  gallery.appendChild(card);
});

function setActive(index) {
  const cards = document.querySelectorAll(".card");

  cards.forEach((card, i) => {
    card.classList.toggle("active", i === index);
  });

  activeIndex = index;
}

