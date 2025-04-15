// src/functions/getCoinData.js
import axios from "axios";


const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_URL; // Or VITE_BACKEND_URL
const BACKEND_COIN_DATA_URL = `${BACKEND_BASE_URL}/api/coins/`; // Note the trailing slash

export const getCoinData = async (id) => {
  if (!id) {
    console.error("[Frontend] getCoinData requires a coin ID.");
    throw new Error("Coin ID is required.");
  }

  try {
    const response = await axios.get(`${BACKEND_COIN_DATA_URL}${id}`, {
        timeout: 10000
    });
    // console.log(`[Frontend] Coin Data for ${id} from backend:`, response.data);
    return response.data;

  } catch (error) {
    console.error(`[Frontend] Error fetching coin data for ${id} from backend:`);
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