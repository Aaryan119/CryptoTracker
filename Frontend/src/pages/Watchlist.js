import React, { useEffect, useState, useCallback } from "react";
import Button from "../components/Common/Button";
import Header from "../components/Common/Header";
import TabsComponent from "../components/Dashboard/Tabs";
import { get100Coins } from "../functions/get100Coins";
import Loader from "../components/Common/Loader"; // Assuming Loader exists
import { toast } from "react-toastify";       // Assuming toast exists

function Watchlist() {
  // Use useState's initializer function to read localStorage only once
  const [watchlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("watchlist")) || [];
    } catch (e) {
      console.error("Error parsing watchlist from localStorage", e);
      return []; // Return empty array on parsing error
    }
  });

  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true); // Start loading

  // Callback now depends on the stable 'watchlist' state reference
  const getData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all coins via backend proxy
      const allCoins = await get100Coins();
      if (allCoins) {
        // Filter using the stable watchlist state
        setCoins(allCoins.filter((coin) => watchlist.includes(coin.id)));
      } else {
        setCoins([]);
      }
    } catch (error) {
       console.error("Error fetching coins for watchlist:", error);
       // Display error only if it's not just an empty list scenario
       if (watchlist.length > 0) {
           toast.error("Could not load watchlist coins.");
       }
       setCoins([]);
    } finally {
       setLoading(false);
    }
  }, [watchlist]); // Dependency array is correct now

  // Effect now depends on stable getData and watchlist references
  useEffect(() => {
    if (watchlist && watchlist.length > 0) {
      getData();
    } else {
      // No items in watchlist, stop loading
      setLoading(false);
      setCoins([]); // Ensure coins are empty
    }
  }, [watchlist, getData]); // Dependency array is correct now


  return (
    <div>
      <Header />
      {loading ? (
        <Loader />
       ) : coins.length > 0 ? ( // Check coins state after loading
        <TabsComponent coins={coins} isWatchlist={true} />
      ) : (
        // Show if not loading AND (watchlist was empty OR fetch failed/filtered to empty)
        <div>
          <h1 style={{ textAlign: "center", marginTop: '2rem' }}>
            Your Watchlist is Empty.
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
      )}
    </div>
  );
}

export default Watchlist;