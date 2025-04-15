// src/pages/Dashboard.js
import React, { useEffect, useState } from "react";
import Header from "../components/Common/Header";
import Loader from "../components/Common/Loader";
import Search from "../components/Dashboard/Search";
import TabsComponent from "../components/Dashboard/Tabs";
import PaginationComponent from "../components/Dashboard/Pagination";
import TopButton from "../components/Common/TopButton";
import Footer from "../components/Common/Footer/footer";
import { get100Coins } from "../functions/get100Coins"; // Use the updated function
import { toast } from "react-toastify";

const ITEMS_PER_PAGE = 10;

function Dashboard() {
  const [allCoins, setAllCoins] = useState([]);
  const [displayedCoins, setDisplayedCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(10);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    setLoading(true);
    setPage(1); // Reset to page 1 on new data fetch
    try {
      const coinsData = await get100Coins(1); // Fetch first 100 via backend

      if (coinsData && coinsData.length > 0) {
        setAllCoins(coinsData);
        setDisplayedCoins(coinsData.slice(0, ITEMS_PER_PAGE));
        setTotalPages(Math.ceil(coinsData.length / ITEMS_PER_PAGE));
         // console.log("[Frontend] Fetched All Coins via Backend:", coinsData);
      } else {
         setAllCoins([]);
         setDisplayedCoins([]);
         setTotalPages(1);
         toast.warn("No coin data received from the server.");
      }
    } catch (error) {
      console.error("[Frontend] ERROR fetching coins from backend:", error);
      toast.error(error.response?.data?.message || "Could not fetch coin data.");
      setAllCoins([]);
      setDisplayedCoins([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset page when search term changes
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    const initialCount = (value - 1) * ITEMS_PER_PAGE;
    setDisplayedCoins(allCoins.slice(initialCount, initialCount + ITEMS_PER_PAGE));
  };

  const filteredCoins = allCoins.filter(
    (coin) =>
      coin.name.toLowerCase().includes(search.trim().toLowerCase()) ||
      coin.symbol.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <>
      <Header />
      {loading ? (
        <Loader />
      ) : (
        <>
          <Search search={search} handleChange={handleChange} />
          <TabsComponent
            coins={search ? filteredCoins : displayedCoins}
            setSearch={setSearch}
          />
          {!search && totalPages > 1 && (
            <PaginationComponent
              page={page}
              count={totalPages}
              handlePageChange={handlePageChange}
            />
          )}
        </>
      )}
      <TopButton />
      <Footer />
    </>
  );
}

export default Dashboard;