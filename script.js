const chatBody = document.getElementById('chat-body');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-btn');

// API Keys
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';
const OPENWEATHER_API_KEY = 'YOUR_OPENWEATHER_API_KEY';

// Function to add a message to the chat
function addMessage(content, type) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}-message`;
    messageElement.textContent = content;
    chatBody.appendChild(messageElement);
    chatBody.scrollTop = chatBody.scrollHeight; // Scroll to the bottom
}

// Function to fetch weather data
async function getWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${OPENWEATHER_API_KEY}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('City not found');
        const data = await response.json();
        return `The current temperature in ${city} is ${data.main.temp}°C with ${data.weather[0].description}.`;
    } catch (error) {
        return "Sorry, I couldn't fetch the weather. Please check the city name.";
    }
}

// Function to fetch Google Maps link
function getMapLink(location) {
    const encodedLocation = encodeURIComponent(location);
    return `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
}

// Handle user input and response
async function handleInput() {
    const userMessage = userInput.value.trim().toLowerCase();
    if (userMessage) {
        addMessage(userInput.value, 'user');
        userInput.value = '';

        // Generate bot response
        let botResponse = "I'm sorry, I don't have an answer for that.";

        // Check for weather queries
        if (userMessage.startsWith('weather in')) {
            const city = userMessage.split('weather in')[1].trim();
            if (city) {
                botResponse = await getWeather(city);
            } else {
                botResponse = "Please specify a city to check the weather.";
            }
        }
        // Check for map queries
        else if (userMessage.startsWith('where is')) {
            const location = userMessage.split('where is')[1].trim();
            if (location) {
                const mapLink = getMapLink(location);
                botResponse = `Here is the location of ${location}: [View on Google Maps](${mapLink})`;
            } else {
                botResponse = "Please specify a location to search for.";
            }
        }

        // Add bot response to chat
        setTimeout(() => {
            addMessage(botResponse, 'bot');
        }, 500);
    }
}

// Event listeners
sendButton.addEventListener('click', handleInput);
userInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        handleInput();
    }
});
