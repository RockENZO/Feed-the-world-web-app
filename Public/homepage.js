document.addEventListener('DOMContentLoaded', function() {
    let slideIndex = 0;
    showSlides();

    function showSlides() {
        let i;
        let slides = document.getElementsByClassName("mySlides");
        let dots = document.getElementsByClassName("dot");

        // Hide all slides
        for (i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";
        }
        slideIndex++;
        // Reset slideIndex if it exceeds the number of slides
        if (slideIndex > slides.length) {slideIndex = 1}

        // Ensure the current slide is displayed
        slides[slideIndex-1].style.display = "block";

        // Remove 'active' class from all dots
        for (i = 0; i < dots.length; i++) {
            dots[i].className = dots[i].className.replace(" active", "");
        }

        // Add 'active' class to the current dot if it exists
        if (dots.length > 0 && slideIndex-1 < dots.length) {
            dots[slideIndex-1].className += " active";
        }

        // Change image every 2 seconds
        setTimeout(showSlides, 2000);
    }
});