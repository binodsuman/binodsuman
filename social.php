<!DOCTYPE html>
<html>
<head>
    <title>My Social Media Links</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
            overflow: hidden;
        }
        .container {
            position: relative;
            height: 100vh;
        }
        .social-icon {
            width: 150px; /* Adjust the size of the circles as needed */
            height: 150px;
            border-radius: 50%;
            background-color: #0077B5; /* LinkedIn blue color, replace with your preferred colors */
            position: absolute;
            top: calc(50% - 75px); /* Adjust the offset to center the circles */
            left: calc(50% - 75px); /* Adjust the offset to center the circles */
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s, opacity 0.2s;
        }
        .social-icon:hover {
            transform: scale(1.1);
        }
        .social-icon img {
            width: 90%; /* Increase the size of the icon inside the circle */
            height: auto;
        }
        .social-text {
            text-align: center;
            margin-top: 10px;
            color: #333;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="social-icon" style="top: 20%; left: 20%;">
            <a href="https://github.com/your_username" target="_blank">
                <img src="github_icon.png" alt="GitHub">
            </a>
            <div class="social-text">GitHub</div>
        </div>
        <div class="social-icon" style="top: 40%; left: 50%;">
            <a href="https://www.kaggle.com/your_username" target="_blank">
                <img src="kaggle_icon.png" alt="Kaggle">
            </a>
            <div class="social-text">Kaggle</div>
        </div>
        <div class="social-icon" style="top: 70%; left: 80%;">
            <a href="https://www.linkedin.com/in/your_username" target="_blank">
                <img src="image/binod_suman_LinkedIn.jpeg" alt="LinkedIn">
            </a>
            <div class="social-text">LinkedIn</div>
        </div>
        <div class="social-icon" style="top: 10%; left: 70%;">
            <a href="https://twitter.com/your_username" target="_blank">
                <img src="image/binod_suman_Tweeter.jpeg" alt="Twitter">
            </a>
            <div class="social-text">Twitter</div>
        </div>
        <div class="social-icon" style="top: 60%; left: 30%;">
            <a href="https://leetcode.com/your_username" target="_blank">
                <img src="image/binod_suman_leetcode.png" alt="LeetCode">
            </a>
            <div class="social-text">LeetCode</div>
        </div>
        <div class="social-icon" style="top: 80%; left: 70%;">
            <a href="https://www.youtube.com/your_channel" target="_blank">
                <img src="image/binod_suman_youtube.png" alt="YouTube">
            </a>
            <div class="social-text">YouTube</div>
        </div>
        <!-- Add more social icons with different top and left values for random distribution -->
    </div>
</body>
</html>
