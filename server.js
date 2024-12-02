const express = require('express');
const dotenv = require('dotenv');

dotenv.config();
console.log('Loaded API Key:', process.env.GROK_API_KEY);


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('./'));

app.post('/api/grok', async (req, res) => {
    try {
        const { userText } = req.body;
        console.log('Received request:', userText);
        
        const API_KEY = process.env.GROK_API_KEY;
        
        if (!API_KEY) {
            console.error('API key is missing');
            throw new Error('API key not configured');
        }

        console.log('Making request to Grok API...');
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
            const errorText = await response.text();
            console.error('API Error:', response.status, errorText);
            throw new Error(`API call failed: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        console.log('Received response:', data);

        if (!data.choices || !data.choices[0]?.message?.content) {
            console.error('Invalid response format:', data);
            throw new Error('Invalid response format from API');
        }

        res.json({ choices: [{ message: { content: data.choices[0].message.content }}] });
    } catch (error) {
        console.error('Detailed error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

app.get('*', (req, res) => {
    res.sendFile('index.html', { root: './' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('API Key exists:', !!process.env.GROK_API_KEY);
});