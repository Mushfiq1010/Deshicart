import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Wallet from "./components/Wallet";
import AddWallet from "./components/AddWallet";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("walletToken"));

  const handleLogin = () => {
    setIsLoggedIn(true); 
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={isLoggedIn ? <Wallet /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/wallet" element={isLoggedIn ? <Wallet /> : <Navigate to="/login" />} />
        <Route path="/add-wallet" element={<AddWallet/>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
