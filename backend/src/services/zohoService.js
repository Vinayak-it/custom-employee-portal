const axios = require("axios");

let accessToken = null;
let tokenExpiresAt = 0;

const getZohoAccessToken = async () => {
    // Reuse existing token if it is still valid
    if (accessToken && Date.now() < tokenExpiresAt) {
        return accessToken;
    }

    try {
        const response = await axios.post(
            `${process.env.ZOHO_ACCOUNTS_URL}/oauth/v2/token`,
            null,
            {
                params: {
                    refresh_token: process.env.ZOHO_REFRESH_TOKEN,
                    client_id: process.env.ZOHO_CLIENT_ID,
                    client_secret: process.env.ZOHO_CLIENT_SECRET,
                    grant_type: "refresh_token"
                }
            }
        );

        accessToken = response.data.access_token;

        // Keep a small safety buffer before the actual expiry time
        const expiresIn = response.data.expires_in || 3600;
        tokenExpiresAt =
            Date.now() + (expiresIn - 60) * 1000;

        return accessToken;

    } catch (error) {
        console.error(
            "Zoho OAuth error:",
            error.response?.data || error.message
        );

        throw new Error("Unable to generate Zoho access token");
    }
};

module.exports = { getZohoAccessToken };