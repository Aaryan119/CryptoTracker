// src/pages/Coin.js
import React, { useEffect, useState, useCallback } from "react"; // Added useCallback
import { useParams } from "react-router-dom";
import Info from "../components/CoinPage/Info";
import LineChart from "../components/CoinPage/LineChart";
import SelectDays from "../components/CoinPage/SelectDays";
import ToggleComponents from "../components/CoinPage/ToggleComponent";
import Button from "../components/Common/Button";
import Header from "../components/Common/Header";
import Loader from "../components/Common/Loader";
import List from "../components/Dashboard/List";
import { getCoinData } from "../functions/getCoinData"; // Correct import
import { getPrices } from "../functions/getPrices";     // Correct import
import { settingChartData } from "../functions/settingChartData";
import { settingCoinObject } from "../functions/settingCoinObject";
import { toast } from "react-toastify"; // Import toast for user feedback

function Coin() {
  const { id } = useParams();
  const [error, setError] = useState(null); // Store error message string or null
  const [loading, setLoading] = useState(true); // Start loading true
  const [chartData, setChartData] = useState({ labels: [], datasets: [{}] });
  const [coin, setCoin] = useState(null); // Initialize coin as null
  const [days, setDays] = useState(30);
  const [priceType, setPriceType] = useState("prices");

  // --- Fetching Logic ---
  // Use useCallback to stabilize function reference if needed as dependency
  const fetchData = useCallback(async () => {
    if (!id) return; // Don't fetch if ID is missing

    setLoading(true);
    setError(null); // Clear previous errors

    try {
      console.log(`[Coin.js] Fetching coin data for ${id}...`);
      const coinDataResult = await getCoinData(id); // Call updated function
      settingCoinObject(coinDataResult, setCoin); // Update coin state

      console.log(`[Coin.js] Fetching prices for ${id} (${days} days, ${priceType})...`);
      const pricesResult = await getPrices(id, days, priceType); // Call updated function
      settingChartData(setChartData, pricesResult); // Update chart state

    } catch (err) {
      console.error("[Coin.js] Error fetching data:", err);
      const errorMessage = err.response?.data?.message || `Failed to load data for ${id}.`;
      setError(errorMessage);
      toast.error(errorMessage); // Show toast notification
      setCoin(null); // Clear potentially partial data on error
      setChartData({ labels: [], datasets: [{}] }); // Clear chart data
    } finally {
      setLoading(false); // Ensure loading is always set to false
    }
  }, [id, days, priceType]); // Dependencies for the fetching logic


  // --- Effects ---
  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]); // Run when fetchData function changes (due to dependencies)


  // --- Event Handlers ---
  const handleDaysChange = (event) => {
    setDays(parseInt(event.target.value));
    // The useEffect depending on 'days' will trigger fetchData
  };

  const handlePriceTypeChange = (event) => {
    setPriceType(event.target.value);
     // The useEffect depending on 'priceType' will trigger fetchData
  };

  // --- Render Logic ---
  const showLoader = loading;
  const showError = !loading && error;
  const showContent = !loading && !error && coin?.id; // Check if coin object has ID

  return (
    <>
      <Header />
      {showLoader ? (
         <Loader />
      ) : showError ? (
        // Display error message
        <div>
          <h1 style={{ textAlign: "center", color: 'red', marginTop: '2rem' }}>
            {error} 😞
          </h1>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              margin: "2rem",
            }}
          >
            <a href="/dashboard">
              <Button text="Go to Dashboard" />
            </a>
          </div>
        </div>
      ) : showContent ? (
        // Display content when data is loaded successfully
        <>
          <div className="grey-wrapper">
            <List coin={coin} delay={0.5} />
          </div>
          <div className="grey-wrapper">
            <SelectDays handleDaysChange={handleDaysChange} days={days} />
            <ToggleComponents
              priceType={priceType}
              handlePriceTypeChange={handlePriceTypeChange}
            />
            <LineChart chartData={chartData} />
          </div>
          <Info title={coin.name} desc={coin.desc} />
        </>
      ) : (
         // Fallback case (should ideally not be reached often with this logic)
         <Loader /> // Or some other placeholder/message
      )}
    </>
  );
}

export default Coin;