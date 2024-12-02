// server.js
const express = require('express');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware để parse JSON bodies
app.use(express.json());

// Serve static files từ thư mục gốc
app.use(express.static('./'));

// Grok API endpoint
app.post('/api/grok', async (req, res) => {
    try {
        const { userText } = req.body;
        
        // Sử dụng API key từ environment variables
        const API_KEY = process.env.GROK_API_KEY;
        
        if (!API_KEY) {
            throw new Error('API key not configured');
        }

        const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [{ role: "user", content: userText }]
            })
        });

        if (!response.ok) {
            throw new Error(`API call failed: ${response.statusText}`);
        }

        const data = await response.json();
        res.json({ choices: [{ message: { content: data.choices[0].message.content }}] });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

// Serve index.html cho tất cả các route khác
app.get('*', (req, res) => {
    res.sendFile('index.html', { root: './' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});