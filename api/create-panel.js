const axios = require('axios');

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        const { serverId, clientId, action } = req.body;

        // Pterodactyl API Endpoint
        const endpoint = `https://your-pterodactyl-server/api/client/servers/${serverId}/${action}`;

        // Replace with your Pterodactyl API key
        const apiKey = 'YOUR_PTERODACTYL_API_KEY';

        try {
            const response = await axios.post(endpoint, {}, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                }
            });
            res.status(200).json(response.data);
        } catch (error) {
            res.status(error.response?.status || 500).json({ error: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};