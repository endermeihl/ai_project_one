// Node.js + Express 服务器，负责静态资源和配置文件的读写

const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const port = 3000;

// 解析JSON请求体
app.use(express.json());
// 静态资源服务，支持前端页面和静态文件
app.use(express.static('.'));

// 首页路由，返回主页面
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 编辑页路由，返回编辑页面
app.get('/edit', (req, res) => {
    res.sendFile(path.join(__dirname, 'edit.html'));
});

// 保存配置接口，接收POST请求，写入config.json
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

// 获取配置接口，返回config.json内容
app.get('/config', async (req, res) => {
    try {
        const configData = await fs.readFile('config.json', 'utf8');
        res.json(JSON.parse(configData));
    } catch (error) {
        res.status(404).json({ error: 'Configuration not found' });
    }
});

// 启动服务器
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 