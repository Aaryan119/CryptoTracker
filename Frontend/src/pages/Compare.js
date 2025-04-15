import React, { useEffect, useState, useCallback } from "react";
import Info from "../components/CoinPage/Info";
import LineChart from "../components/CoinPage/LineChart";
import ToggleComponents from "../components/CoinPage/ToggleComponent";
import Header from "../components/Common/Header";
import Loader from "../components/Common/Loader";
import SelectCoins from "../components/ComparePage/SelectCoins";
import List from "../components/Dashboard/List"; // Assuming this correctly displays a single coin's list view
import { get100Coins } from "../functions/get100Coins";
import { getCoinData } from "../functions/getCoinData";
import { getPrices } from "../functions/getPrices";
import { settingChartData } from "../functions/settingChartData";
import { settingCoinObject } from "../functions/settingCoinObject";

// Debounce function (optional, but can help prevent rapid API calls if needed later)
// function debounce(func, wait) {
//   let timeout;
//   return function executedFunction(...args) {
//     const later = () => {
//       clearTimeout(timeout);
//       func(...args);
//     };
//     clearTimeout(timeout);
//     timeout = setTimeout(later, wait);
//   };
// }

function Compare() {
  const [allCoins, setAllCoins] = useState([]);
  const [loading, setLoading] = useState(true); // Start loading initially
  const [error, setError] = useState(null); // State to hold potential errors

  // Coin selection states
  const [crypto1, setCrypto1] = useState("bitcoin");
  const [crypto2, setCrypto2] = useState("ethereum");

  // Coin data states
  const [coin1Data, setCoin1Data] = useState(null); // Initialize as null
  const [coin2Data, setCoin2Data] = useState(null); // Initialize as null

  // Chart configuration states
  const [days, setDays] = useState(30);
  const [priceType, setPriceType] = useState("prices");
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });


  

  // --- Data Fetching Functions ---

  // Fetch initial list of all coins for dropdowns
  const fetchAllCoins = useCallback(async () => {
    try {
      const coins = await get100Coins();
      if (coins) {
        setAllCoins(coins);
        return coins; // Return coins for subsequent fetches
      } else {
        throw new Error("Could not fetch list of coins.");
      }
    } catch (e) {
      console.error("Error fetching all coins:", e);
      setError("Failed to load coin list. Please refresh.");
      setAllCoins([]); // Ensure it's an empty array on error
      return null;
    }
  }, []); // Empty dependency array - function identity is stable

  // Fetch data and prices for the currently selected coins and days
  // Inside Compare.js

const fetchChartData = useCallback(async (coin1Id, coin2Id, numDays, priceKind) => {
  setLoading(true);
  setError(null);
  try {
    // --- SEQUENCE the API calls ---

    // 1. Fetch Coin 1 Data
    console.log(`Fetching data for ${coin1Id}...`);
    const data1 = await getCoinData(coin1Id);
    if (data1) {
       settingCoinObject(data1, setCoin1Data); // Update state immediately if desired
    } else {
      throw new Error(`Failed to fetch data for ${coin1Id}.`);
    }

    // 2. Fetch Coin 2 Data
    console.log(`Fetching data for ${coin2Id}...`);
    const data2 = await getCoinData(coin2Id);
     if (data2) {
       settingCoinObject(data2, setCoin2Data); // Update state immediately if desired
    } else {
      throw new Error(`Failed to fetch data for ${coin2Id}.`);
    }

    // 3. Fetch Coin 1 Prices
     console.log(`Fetching prices for ${coin1Id}...`);
    const prices1 = await getPrices(coin1Id, numDays, priceKind);
    if (!prices1) {
         throw new Error(`Failed to fetch prices for ${coin1Id}.`);
    }

    // 4. Fetch Coin 2 Prices
     console.log(`Fetching prices for ${coin2Id}...`);
    const prices2 = await getPrices(coin2Id, numDays, priceKind);
     if (!prices2) {
         throw new Error(`Failed to fetch prices for ${coin2Id}.`);
    }

    // 5. Update Chart Data (only after all prices are fetched)
    console.log("Setting chart data...");
    settingChartData(setChartData, prices1, prices2);

  } catch (e) {
    console.error("Error during sequential fetch:", e); // More specific log
    setError(`Failed to load data: ${e.message}. Check console.`);
    // Consider how to handle partial failures - maybe clear chart?
    // setChartData({ labels: [], datasets: [] });
  } finally {
    setLoading(false);
  }
}, []); // Dependency array remains empty as args are passed


  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  // --- Inside Compare.js ---
  
  // Create a debounced version of your fetching logic
  // Note: Using useCallback helps stabilize the debounced function reference
  const debouncedFetchChartData = useCallback(
     debounce((coin1Id, coin2Id, numDays, priceKind) => {
        fetchChartData(coin1Id, coin2Id, numDays, priceKind);
     }, 500), // Wait 500ms after the last change
     [fetchChartData] // Recreate if fetchChartData changes (which it shouldn't often with useCallback)
  );

  // --- Effects ---

  // Initial data load effect
  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      setError(null);
      const coinsList = await fetchAllCoins();
      if (coinsList) {
        // If coin list loaded, fetch data for default coins
        await fetchChartData(crypto1, crypto2, days, priceType);
      } else {
        // If fetching all coins failed, stop loading
        setLoading(false);
      }
    };
    initialLoad();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAllCoins]); // Run only once on mount essentially, fetchAllCoins is stable

  // Effect to refetch prices when days or priceType changes
  useEffect(() => {
    // Prevent running on initial mount if data is already loading
    if (!loading && coin1Data && coin2Data) {
       fetchChartData(crypto1, crypto2, days, priceType);
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, priceType]); // Re-run when days or priceType changes

  // --- Event Handlers ---

  const handleCoinChange = async (e, isCoin2) => {
    const newCoinId = e.target.value;
    let coin1ToFetch = crypto1;
    let coin2ToFetch = crypto2;

    if (isCoin2) {
        if (newCoinId === crypto1) return; // Prevent selecting the same coin
        setCrypto2(newCoinId);
        coin2ToFetch = newCoinId;
    } else {
        if (newCoinId === crypto2) return; // Prevent selecting the same coin
        setCrypto1(newCoinId);
        coin1ToFetch = newCoinId;
    }
    // Fetch data for the potentially new pair
    debouncedFetchChartData(coin1ToFetch, coin2ToFetch, days, priceType);
  };

  const handleDaysChange = (e) => {
    setDays(parseInt(e.target.value)); // Update days state, useEffect will trigger refetch
  };

  const handlePriceTypeChange = (e) => {
    setPriceType(e.target.value); // Update priceType state, useEffect will trigger refetch
  };

  // --- Render Logic ---

  // Determine if we should show the loader
  const showLoader = loading || (!error && (!coin1Data?.id || !coin2Data?.id));
  // Determine if we should show the main content
  const showContent = !showLoader && !error && coin1Data?.id && coin2Data?.id;

  return (
    <div>
      <Header />
      {/* Display global error message if any */}
      {error && <div style={{ color: 'red', textAlign: 'center', margin: '1rem' }}>{error}</div>}

      {/* Always render SelectCoins if allCoins list is available, even if loading */}
      {allCoins.length > 0 && (
           <SelectCoins
             allCoins={allCoins}
             crypto1={crypto1}
             crypto2={crypto2}
             onCoinChange={handleCoinChange}
             days={days}
             handleDaysChange={handleDaysChange}
            />
      )}


      {showLoader && <Loader />}

      {showContent && (
        <>
          {/* Display Coin 1 Info */}
          <div className="grey-wrapper">
            {/* Use List component if it's designed for single coin display */}
            <List coin={coin1Data} />
            {/* Or use Info component if List isn't suitable */}
            {/* <Info title={coin1Data.name} desc={coin1Data.desc} /> */}
          </div>

          {/* Display Coin 2 Info */}
          <div className="grey-wrapper">
            <List coin={coin2Data} />
            {/* <Info title={coin2Data.name} desc={coin2Data.desc} /> */}
          </div>

          {/* Display Chart and Controls */}
          <div className="grey-wrapper">
            <ToggleComponents
              priceType={priceType}
              handlePriceTypeChange={handlePriceTypeChange}
            />
            <LineChart chartData={chartData} multiAxis={true} />
          </div>

          {/* Display Detailed Info Sections */}
          <Info title={coin1Data.name} desc={coin1Data.desc} />
          <Info title={coin2Data.name} desc={coin2Data.desc} />
        </>
      )}
    </div>
  );
}

export default Compare;