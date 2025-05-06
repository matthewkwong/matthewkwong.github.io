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