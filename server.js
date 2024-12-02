// server.js
const express = require('express');
const fetch = require('node-fetch');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

// API endpoint for frontend to call Grok API
app.post('/api/grok', async (req, res) => {
    const { userText } = req.body;

    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.API_KEY}`, // API key from .env
        },
        body: JSON.stringify({
            model: "grok-beta",
            messages: [
                { role: "system", content: "You are a test assistant." },
                { role: "user", content: userText },
            ],
            temperature: 0.7,
            stream: false,
        }),
    };

    try {
        const response = await fetch("https://api.x.ai/v1/chat/completions", requestOptions);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve response from Grok API" });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
