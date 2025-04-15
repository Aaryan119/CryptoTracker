// src/functions/getPrices.js
import axios from "axios";

const BACKEND_PRICES_URL = "http://localhost:5000/api/coins/";

export const getPrices = async (id, days, priceType) => {
  if (!id || !days || !priceType) {
     console.error("[Frontend] getPrices requires id, days, and priceType.");
     throw new Error("Missing required parameters for getPrices.");
  }

  const URL = `${BACKEND_PRICES_URL}${id}/market_chart`;
  // console.log("[Frontend] Requesting Prices URL (Backend):", URL, "Params:", { vs_currency: 'usd', days });

  try {
    const response = await axios.get(URL, {
      params: {
        vs_currency: 'usd',
        days: days,
      },
      timeout: 15000
    });

    if (response.data && response.data[priceType]) {
      // console.log(`[Frontend] Prices (${priceType}) for ${id} from backend:`, response.data[priceType]);
      return response.data[priceType];
    } else {
      console.error(`[Frontend] Price type '${priceType}' not found in backend response data for ${id}. Available keys:`, Object.keys(response.data || {}));
      throw new Error(`Price type '${priceType}' not found in API response.`);
    }
  } catch (error) {
     console.error(`[Frontend] Error fetching prices for ${id} (days: ${days}) from backend:`);
     if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Data:", error.response.data);
         if (error.response.status === 429) {
           console.warn(`[Frontend] Backend reported: Rate limit hit fetching prices for ${id}.`);
        }
     } else if (error.request) {
        console.error("[Frontend] Could not connect to backend:", error.request);
     } else {
        console.error("[Frontend] Axios setup error:", error.message);
     }
    throw error;
  }
};