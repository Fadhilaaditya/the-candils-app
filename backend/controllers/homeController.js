
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
    getHomeContent
};
