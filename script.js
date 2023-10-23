let currentSection = 0;

        document.addEventListener("scroll", function () {
            const sections = document.querySelectorAll("section");
            const offset = window.innerHeight / 2;

            sections.forEach((section, index) => {
                if (section.getBoundingClientRect().top < offset) {
                    currentSection = index;
                }
            });
        });

        document.addEventListener("keydown", function (e) {
            if (e.key === "ArrowDown" && currentSection < 2) {
                currentSection++;
                scrollToSection(currentSection);
            } else if (e.key === "ArrowUp" && currentSection > 0) {
                currentSection--;
                scrollToSection(currentSection);
            }
        });

        function scrollToSection(sectionIndex) {
            const sections = document.querySelectorAll("section");
            sections[sectionIndex].scrollIntoView({ behavior: "smooth" });
        }

        const hoverImage = document.getElementById('page-scroll');
        
        
        hoverImage.addEventListener('mouseover', () => {
            // Get the target section you want to scroll to
            const targetSection = document.getElementById('section2'); // Change 'section2' to the ID of the desired section
            
            if (targetSection) {
                // Calculate the target scroll position
                const scrollPosition = targetSection.offsetTop;
                
                // Animate the scroll with a custom easing function
                const start = window.scrollY;
                const end = scrollPosition;
                const duration = 4000; // Adjust this to control the speed (in milliseconds)

                let startTime;
                function step(timestamp) {
                    if (!startTime) startTime = timestamp;
                    const progress = timestamp - startTime;
                    window.scrollTo(0, easeInOutCubic(progress, start, end - start, duration));
                    if (progress < duration) {
                        requestAnimationFrame(step);
                    }
                }
                requestAnimationFrame(step);
            }
        });

function easeInOutCubic(t, b, c, d) {
    if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
    return c / 2 * ((t -= 2) * t * t + 2) + b;
}

// Add this code to your HTML file or an external script

// window.addEventListener('scroll', function() {
//     var scrollButton = document.querySelector('.scroll-to-top');
//     if (window.scrollY > 100) {
//         scrollButton.classList.add('show');
//     } else {
//         scrollButton.classList.remove('show');
//     }
// });

document.addEventListener("DOMContentLoaded", function () {
    const backToConfirmButton = document.getElementById("backToConfirm");
    const section2 = document.getElementById("section2");

    // Listen for scroll events
    window.addEventListener("scroll", function () {
        const section2Top = section2.getBoundingClientRect().top;

        // If the top of Section 2 is in the viewport, show the button
        if (section2Top < window.innerHeight / 2) {
            backToConfirmButton.style.display = "block";
        } else {
            backToConfirmButton.style.display = "none";
        }
    });
});






