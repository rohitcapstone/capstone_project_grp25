const express = require("express");
const bodyParser = require("body-parser");
const dialogflow = require("@google-cloud/dialogflow");
const { google } = require("googleapis");
const { v4: uuidv4 } = require("uuid");
const app = express();

app.use(bodyParser.json());

// Google Maps API integration (replace with your Google Maps API key)
const googleMapsClient = require('@google/maps').createClient({
  key: 'YOUR_GOOGLE_MAPS_API_KEY'
});

// Dialogflow session client
const sessionClient = new dialogflow.SessionsClient();

// Set up Dialogflow interaction
async function detectIntent(query, sessionId, languageCode = 'en') {
  const sessionPath = sessionClient.projectAgentSessionPath('YOUR_PROJECT_ID', sessionId);

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: query,
        languageCode: languageCode,
      },
    },
  };

  const responses = await sessionClient.detectIntent(request);
  return responses[0].queryResult;
}

// Route for webhook
app.post("/webhook", async (req, res) => {
  const { query, sessionId } = req.body;

  try {
    const response = await detectIntent(query, sessionId);
    res.send({ reply: response.fulfillmentText });
  } catch (error) {
    res.send({ error: "Error processing request." });
  }
});

// Google Maps Integration for Directions
app.post("/get-directions", (req, res) => {
  const { origin, destination } =

  req.body;

  googleMapsClient.directions(
    {
      origin: origin,
      destination: destination,
      mode: "walking", // Can be changed to driving, transit, etc.
    },
    (err, response) => {
      if (!err) {
        const directions = response.json.routes[0].legs[0];
        const directionsSteps = directions.steps
          .map((step) => step.html_instructions.replace(/<[^>]*>?/gm, "")) // Remove HTML tags
          .join(". ");
        res.send({
          reply: `Here are the walking directions: ${directionsSteps}`,
        });
      } else {
        res.send({ error: "Unable to fetch directions." });
      }
    }
  );
});

// General info about landmarks (static data)
const landmarks = {
  "eiffel tower": {
    description: "The Eiffel Tower is an iconic Parisian landmark built in 1889...",
    location: "Champ de Mars, 5 Avenue Anatole, Paris.",
  },
  "louvre museum": {
    description: "The Louvre Museum is the world's largest art museum...",
    location: "Rue de Rivoli, 75001 Paris.",
  },
  // Add more landmarks as needed
};

app.post("/get-landmark-info", (req, res) => {
  const { landmarkName } = req.body;
  const landmark = landmarks[landmarkName.toLowerCase()];

  if (landmark) {
    res.send({
      reply: `Here's some info about the ${landmarkName}: ${landmark.description}. It's located at ${landmark.location}.`,
    });
  } else {
    res.send({ error: "Landmark not found." });
  }
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Tour Guide Chatbot running on port ${port}`);
});
