const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/edit', (req, res) => {
    res.sendFile(path.join(__dirname, 'edit.html'));
});

// Save configuration
app.post('/save-config', async (req, res) => {
    try {
        const config = req.body;
        await fs.writeFile('config.json', JSON.stringify(config, null, 2));
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving config:', error);
        res.status(500).json({ error: 'Failed to save configuration' });
    }
});

// Get configuration
app.get('/config', async (req, res) => {
    try {
        const configData = await fs.readFile('config.json', 'utf8');
        res.json(JSON.parse(configData));
    } catch (error) {
        res.status(404).json({ error: 'Configuration not found' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 