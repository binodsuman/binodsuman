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
            const targetSection = document.getElementById('section6'); // Change 'section2' to the ID of the desired section
            
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


