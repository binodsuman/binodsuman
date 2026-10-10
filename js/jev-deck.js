(function () {
    var slides = [
        { src: "slides/01.jpg", title: "The dawn of System One AI" },
        { src: "slides/02.jpg", title: "Coercing chatbots to do software’s job" },
        { src: "slides/03.jpg", title: "AI forgot to build System One" },
        { src: "slides/04.jpg", title: "Meet Jev: the if/else of the AI world" },
        { src: "slides/05.jpg", title: "Non-autoregressive inference" },
        { src: "slides/06.jpg", title: "System 2 versus System 1" },
        { src: "slides/07.jpg", title: "One state, many questions in parallel" },
        { src: "slides/08.jpg", title: "Choice, score, and noul" },
        { src: "slides/09.jpg", title: "Calibrated honesty via RLCD" },
        { src: "slides/10.jpg", title: "Logic in code, not prompts" },
        { src: "slides/11.jpg", title: "Use case: the AI router" },
        { src: "slides/12.jpg", title: "Use case: high-volume triage" },
        { src: "slides/13.jpg", title: "Use case: real-time reflexes" },
        { src: "slides/14.jpg", title: "The hybrid stack" },
        { src: "slides/15.jpg", title: "Build software that thinks fast" }
    ];

    var root = document.getElementById("presentation");
    if (!root) return;

    var img = document.getElementById("jev-slide");
    var caption = document.getElementById("jev-caption");
    var count = document.getElementById("jev-count");
    var bar = document.getElementById("jev-progress");
    var thumbs = document.getElementById("jev-thumbs");
    var index = 0;

    slides.forEach(function (slide, i) {
        var button = document.createElement("button");
        button.type = "button";
        button.setAttribute("aria-label", "Slide " + (i + 1) + ": " + slide.title);
        var thumb = document.createElement("img");
        thumb.alt = "";
        thumb.loading = "lazy";
        thumb.src = slide.src;
        button.appendChild(thumb);
        button.addEventListener("click", function () { show(i); });
        thumbs.appendChild(button);
    });

    function show(next) {
        index = (next + slides.length) % slides.length;
        var slide = slides[index];
        img.src = slide.src;
        img.alt = "Slide " + (index + 1) + " of " + slides.length + ". " + slide.title;
        caption.textContent = slide.title;
        count.textContent = (index + 1) + " / " + slides.length;
        bar.style.width = ((index + 1) / slides.length * 100) + "%";
        var buttons = thumbs.querySelectorAll("button");
        buttons.forEach(function (button, i) {
            button.classList.toggle("is-on", i === index);
        });
        if (buttons[index]) {
            var button = buttons[index];
            thumbs.scrollTo({
                left: button.offsetLeft - thumbs.clientWidth / 2 + button.clientWidth / 2,
                behavior: "smooth"
            });
        }
        var ahead = slides[(index + 1) % slides.length];
        var preload = new Image();
        preload.src = ahead.src;
    }

    root.querySelector(".jev-nav.prev").addEventListener("click", function () { show(index - 1); });
    root.querySelector(".jev-nav.next").addEventListener("click", function () { show(index + 1); });

    document.addEventListener("keydown", function (event) {
        var box = root.getBoundingClientRect();
        var onScreen = box.top < window.innerHeight * 0.85 && box.bottom > 80;
        if (!onScreen) return;
        if (event.key === "ArrowRight") {
            show(index + 1);
            event.preventDefault();
        } else if (event.key === "ArrowLeft") {
            show(index - 1);
            event.preventDefault();
        }
    });

    show(0);
})();
