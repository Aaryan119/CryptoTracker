import { createTheme, ThemeProvider } from "@mui/material";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Coin from "./pages/Coin";
import Compare from "./pages/Compare";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Watchlist from "./pages/Watchlist";
import { ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React, { useEffect,useRef } from "react";

function App() {
  const theme = createTheme({
    palette: {
      primary: {
        main: "#3a80e9",
      },
    },
  });

  const cursorRef = useRef(null);
  const cursorPointerRef = useRef(null);

  useEffect(() => {
    // Assign DOM elements to ref.current
    cursorRef.current = document.getElementById("cursor");
    cursorPointerRef.current = document.getElementById("cursor-pointer");

    // Add checks to ensure elements exist before adding listeners
    if (!cursorRef.current || !cursorPointerRef.current) {
      console.warn("Cursor elements not found");
      return;
    }

    const handleMouseMove = (e) => {
      // Check refs again inside handlers (good practice)
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX + "px";
        cursorRef.current.style.top = e.clientY + "px";
      }
      if (cursorPointerRef.current) {
        cursorPointerRef.current.style.left = e.clientX + "px";
        cursorPointerRef.current.style.top = e.clientY + "px";
      }
    };

    const handleMouseDown = () => {
      if (cursorRef.current) {
        cursorRef.current.style.height = "0.5rem";
        cursorRef.current.style.width = "0.5rem";
      }
       if (cursorPointerRef.current) {
        cursorPointerRef.current.style.height = "3rem";
        cursorPointerRef.current.style.width = "3rem";
      }
    };

    const handleMouseUp = () => {
      if (cursorRef.current) {
         cursorRef.current.style.height = "0.3rem";
         cursorRef.current.style.width = "0.3rem";
      }
      if (cursorPointerRef.current) {
        cursorPointerRef.current.style.height = "2rem";
        cursorPointerRef.current.style.width = "2rem";
      }
    };

    document.body.addEventListener("mousemove", handleMouseMove);
    document.body.addEventListener("mousedown", handleMouseDown);
    document.body.addEventListener("mouseup", handleMouseUp);

    // Cleanup function
    return () => {
      document.body.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mousedown", handleMouseDown);
      document.body.removeEventListener("mouseup", handleMouseUp);
    };
  }, []); // Empty dependency array is correct here

  return (
    <div className="App">
      <div className="cursor" id="cursor" />
      <div className="cursor-pointer" id="cursor-pointer" />
      <ToastContainer />
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/coin/:id" element={<Coin />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/watchlist" element={<Watchlist />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </div>
  );
}

export default App;
