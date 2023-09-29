document.addEventListener("DOMContentLoaded", function () {
    // Example course data

    const aboutSection = document.getElementById("about");
    const coursesSection = document.getElementById("courses");
        
        aboutSection.style.display = "none";
        coursesSection.style.display = "none";

        // Rest of your JavaScript code...
        
        // Function to display the selected section and hide others
        function showSection(sectionId) {
            const sections = ['contact', 'about', 'courses'];
            sections.forEach(section => {
                const element = document.getElementById(section);
                if (section === sectionId) {
                    element.style.display = 'block';
                } else {
                    element.style.display = 'none';
                }
            });
        }

        
    const courses = [
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
        const coursesSection = document.getElementById("contact");
        latestVideos.forEach(course => {
            const courseDiv = document.createElement("div");
            courseDiv.classList.add("course");
            
            courseDiv.innerHTML = `<h3>${course.title}</h3><p>${course.description}</p><iframe width="560" height="315" src="https://www.youtube.com/embed/${course.id}" frameborder="0" allowfullscreen></iframe>`;
            coursesSection.appendChild(courseDiv);
        });
    }

    // Function to display courses
    function displayCourses() {
        console.log("displayCourses() called");
        const coursesSection = document.getElementById("courses");
        courses.forEach(course => {
            const courseDiv = document.createElement("div");
            courseDiv.classList.add("course");
            
            courseDiv.innerHTML = `<h3>${course.title}</h3><p>${course.description}</p><iframe width="560" height="315" src="https://www.youtube.com/embed/${course.id}" frameborder="0" allowfullscreen></iframe>`;
            coursesSection.appendChild(courseDiv);
        });
    }
    
    

   

    // Call the function to display courses
    displayCourses();
    displayLatestVideos();
    
    
});

    // Function to display the selected section and hide others
    function showSection(sectionId) {
        const sections = ['courses', 'about', 'contact'];
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
    const coursesLink = document.getElementById('courses-link');
    const aboutLink = document.getElementById('about-link');
    const contactLink = document.getElementById('contact-link');

    coursesLink.addEventListener('click', function (event) {
        event.preventDefault();
        showSection('courses');
    });

    aboutLink.addEventListener('click', function (event) {
        event.preventDefault();
        showSection('about');
    });

    contactLink.addEventListener('click', function (event) {
        event.preventDefault();
        showSection('contact');
    });