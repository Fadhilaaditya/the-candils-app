
const pool = require('../config/db');

const getHomeContent = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT section, content FROM HomeContent');
        
        const content = {};
        rows.forEach(row => {
            let parsedContent = row.content;
            if (typeof parsedContent === 'string') {
                try {
                    parsedContent = JSON.parse(parsedContent);
                } catch (e) {
                    console.error('Failed to parse content JSON:', e);
                }
            }
            content[row.section] = parsedContent;
        });

        res.json({
            success: true,
            data: content
        });
    } catch (error) {
        console.error('Error fetching home content:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch home content',
            error: error.message
        });
    }
};

module.exports = {
    getHomeContent,
    debugWhatsapp
};

const debugWhatsapp = async (req, res) => {
    try {
        const { phone } = req.query;
        const API_URL = process.env.WHATSAPP_API_URL || 'https://api.fonnte.com/send';
        const API_TOKEN = process.env.WHATSAPP_API_TOKEN;

        const debugInfo = {
            env_url: process.env.WHATSAPP_API_URL || '(default)',
            token_configured: !!API_TOKEN,
            token_prefix: API_TOKEN ? API_TOKEN.substring(0, 5) + '...' : 'null',
            target_phone: phone || 'No phone provided'
        };

        if (!API_TOKEN) {
            return res.json({
                success: false,
                message: 'WHATSAPP_API_TOKEN is missing in environment variables',
                debug: debugInfo
            });
        }

        if (!phone) {
            return res.json({
                success: false,
                message: 'Please provide ?phone=628xxx parameter to test sending',
                debug: debugInfo
            });
        }

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': API_TOKEN,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                target: phone,
                message: 'Test message from The Candils Backend Debugger',
                countryCode: '62'
            })
        });

        const result = await response.json();

        res.json({
            success: true,
            debug: debugInfo,
            fonnte_response: result
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error during WA Debug',
            error: error.message
        });
    }
};
