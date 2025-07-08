import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../Api.js";
import Login from "../components/Login.jsx";

const SellerLogin = () => {
  return (
    <Login userType="seller"></Login>
  );
};

export default SellerLogin;
