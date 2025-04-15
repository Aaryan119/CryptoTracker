// src/functions/get100Coins.js
import axios from "axios";

const BACKEND_API_URL = "http://localhost:5000/api/coins/markets";

export const get100Coins = async (page = 1) => {
  try {
    const response = await axios.get(BACKEND_API_URL, {
      params: {
        page: page,
        per_page: 100,
        vs_currency: 'usd',
        order: 'market_cap_desc',
        sparkline: false
      },
      timeout: 10000,
    });
    // console.log("[Frontend] RESPONSE from Backend (/markets)>>>", response.data);
    return response.data;

  } catch (error) {
    console.error(`[Frontend] Error fetching 100 coins (page ${page}) from backend:`);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else if (error.request) {
      console.error("Could not connect to backend:", error.request);
    } else {
      console.error("Axios setup error:", error.message);
    }
    throw error;
  }
};