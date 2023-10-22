//document.addEventListener("DOMContentLoaded", function () {
    // Example course data

    const homeSection = document.getElementById("home");
    const aboutSection = document.getElementById("about");
    const latsetSection = document.getElementById("latest");
    const mostSection = document.getElementById("most");
        
        aboutSection.style.display = "none";
        latsetSection.style.display = "none";
        mostSection.style.display = "none";
      
    const mostWatchedCourses = [
        { title: "Data Science", description: "Convolutional Neural Networks | CNN | Kernel | Stride | Padding | Pooling | Flatten | Formula", id: "Y1qxI-Df4Lk" },
        { title: "Data Engineering", description: "Box Plot - 1 | How to draw Box Plot and Outlier | Data Mining | Statistics" , id: "sytBDWefYb0"},
        { title: "Data Science", description: "Recurrent Neural Networks | RNN LSTM Tutorial | Why use RNN | On Whiteboard | Compare ANN, CNN, RNN", id: "KBftoy0DPxI" }
        
    ];

    const latestVideos = [
        { title: "Data Science", description: "What is Vector Database | Milvus Attu Installation | Word Embedding | End to end Demo", id: "612Y0jXmWKk" },
        { title: "NLP", description: "Introduction to NLP | Word2Vec | Word Embedding | Whiteboard explanation | Gensim Coding" , id: "9Ppg8NLk4NE"},
        { title: "ChatGPT", description: "ChatGPT: A Game Changer for System Design", id: "yE3O28E38_E" }
       
    ];

     // Function to display courses
     function displayLatestVideos() {
        console.log("displayLatestVideos() called");
        //document.body.style.backgroundImage = 'url("youtube_thumbnail.png")';
        document.body.style.animation = " moveBackground 0s linear infinite"; 
        const coursesSection = document.getElementById("latest");
        latestVideos.forEach(course => {
            const courseDiv = document.createElement("div");
            courseDiv.classList.add("course");
            
            courseDiv.innerHTML = `<h3>${course.title}</h3><p>${course.description}</p><iframe width="560" height="315" src="https://www.youtube.com/embed/${course.id}" frameborder="0" allowfullscreen></iframe>`;
            coursesSection.appendChild(courseDiv);
        });
    }

    // Function to display courses
    function displayMostVideos() {
        console.log("displayMostVideos() called");
        document.body.style.animation = " moveBackground 0s linear infinite"; 
        
        const coursesSection = document.getElementById("most");
        mostWatchedCourses.forEach(course => {
            const courseDiv = document.createElement("div");
            courseDiv.classList.add("course");
            
            courseDiv.innerHTML = `<h3>${course.title}</h3><p>${course.description}</p><iframe width="560" height="315" src="https://www.youtube.com/embed/${course.id}" frameborder="0" allowfullscreen></iframe>`;
            coursesSection.appendChild(courseDiv);
        });
    }
 
    // Call the function to display courses
    //displayMostVideos();
    //displayLatestVideos();
    
    


    // Function to display the selected section and hide others
    function showSection(sectionId) {
        const sections = ['home','latest', 'about', 'most'];
        sections.forEach(section => {
            const element = document.getElementById(section);
            if (section === sectionId) {
                element.style.display = 'block';
            } else {
                element.style.display = 'none';
            }
        });
    }

    // Add click event handlers to the links
    const latestLink = document.getElementById('latest-link');
    const aboutLink = document.getElementById('about-link');
    const mostLink = document.getElementById('most-link');
    const homeLink = document.getElementById('home-link');
    const about_me_Link = document.getElementById('about-me-link');
    
    //const youtubeLink = document.getElementById('youtube-link');

    

    homeLink.addEventListener('click', function (event) {
        console.log("Home link called");
        document.body.style.animation = " moveBackground 10s linear infinite"; 
        event.preventDefault();
        showSection('home');
    });

    latestLink.addEventListener('click', function (event) {
        displayLatestVideos();
        event.preventDefault();
        showSection('latest');
    });

    aboutLink.addEventListener('click', function (event) {
        document.body.style.animation = " moveBackground 10s linear infinite"; 
        event.preventDefault();
        showSection('about');
    });

    

    mostLink.addEventListener('click', function (event) {
        displayMostVideos();
        event.preventDefault();
        showSection('most');
    });

    function scrollThumbnails(direction) {
        const container = document.querySelector('.thumbnails-container');
        const scrollAmount = 200; // Adjust the scroll amount as needed
    
        if (direction === 'left') {
            container.scrollBy(-scrollAmount, 0);
        } else if (direction === 'right') {
            container.scrollBy(scrollAmount, 0);
        }
    }
    
    function openVideo(videoUrl) {
        // Open the YouTube video in a new tab
        window.open(videoUrl, '_blank');
    }

    
    