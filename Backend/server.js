// server.js (Backend Proxy)
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config(); // Load .env variables

const app = express();
const PORT = process.env.PORT || 5000; // Backend runs on port 5000

const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;

if (!COINGECKO_API_KEY) {
    console.warn("Warning: COINGECKO_API_KEY not found in environment variables. Rate limits may be stricter.");
}

// --- Middleware ---
const allowedOrigins = [
    'http://localhost:3000', // Your local React dev server
    // Add your deployed Netlify frontend URL here later
    // Example: 'https://your-crypto-dashboard.netlify.app'
];
  
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));

// --- API Proxy Routes ---

// Proxy for GET /coins/markets
app.get('/api/coins/markets', async (req, res) => {
  console.log('[Backend] Request for /api/coins/markets, query:', req.query);
  try {
    const {
      vs_currency = 'usd',
      order = 'market_cap_desc',
      per_page = 100,
      page = 1,
      sparkline = false
    } = req.query;

    const coingeckoResponse = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency,
        order,
        per_page,
        page,
        sparkline,
        ...(COINGECKO_API_KEY && { x_cg_demo_api_key: COINGECKO_API_KEY }) // Conditionally add API key
      },
      timeout: 10000
    });

    console.log(`[Backend] Forwarding /markets response from CoinGecko (Status: ${coingeckoResponse.status})`);
    res.json(coingeckoResponse.data);

  } catch (error) {
    console.error(
        "[Backend] Error proxying CoinGecko /coins/markets:",
        error.response?.status,
        error.response?.data || error.message
    );
    res.status(error.response?.status || 500).json({
       message: `Error fetching market data from CoinGecko: ${error.response?.statusText || error.message}`,
       details: error.response?.data
      });
  }
});

// Proxy for GET /coins/{id}
app.get('/api/coins/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`[Backend] Request for /api/coins/${id}`);
    try {
        const coingeckoResponse = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}`, {
            params: {
                 ...(COINGECKO_API_KEY && { x_cg_demo_api_key: COINGECKO_API_KEY })
            },
            timeout: 10000
        });

        console.log(`[Backend] Forwarding /coins/${id} response from CoinGecko (Status: ${coingeckoResponse.status})`);
        res.json(coingeckoResponse.data);

    } catch (error) {
        console.error(
            `[Backend] Error proxying CoinGecko /coins/${id}:`,
            error.response?.status,
            error.response?.data || error.message
        );
        res.status(error.response?.status || 500).json({
            message: `Error fetching data for ${id} from CoinGecko: ${error.response?.statusText || error.message}`,
            details: error.response?.data
        });
    }
});

// Proxy for GET /coins/{id}/market_chart
app.get('/api/coins/:id/market_chart', async (req, res) => {
    const { id } = req.params;
    const { vs_currency = 'usd', days = 30 } = req.query;

    console.log(`[Backend] Request for /api/coins/${id}/market_chart, query:`, req.query);
    try {
        const coingeckoResponse = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}/market_chart`, {
            params: {
                vs_currency,
                days,
                interval: 'daily',
                ...(COINGECKO_API_KEY && { x_cg_demo_api_key: COINGECKO_API_KEY })
            },
            timeout: 15000
        });

        console.log(`[Backend] Forwarding /market_chart response for ${id} from CoinGecko (Status: ${coingeckoResponse.status})`);
        res.json(coingeckoResponse.data);

    } catch (error) {
        console.error(
            `[Backend] Error proxying CoinGecko /coins/${id}/market_chart:`,
            error.response?.status,
            error.response?.data || error.message
        );
        res.status(error.response?.status || 500).json({
            message: `Error fetching market chart for ${id} from CoinGecko: ${error.response?.statusText || error.message}`,
            details: error.response?.data
        });
    }
});

// --- Start the server ---
app.listen(PORT, () => {
  console.log(`Backend proxy server running at http://localhost:${PORT}`);
});