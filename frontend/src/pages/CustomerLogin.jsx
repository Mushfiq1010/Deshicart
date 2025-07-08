import React, { useState } from "react";
import API from "../Api.js";
import Login from "../components/Login.jsx";
import { useNavigate } from "react-router-dom";

const CustomerLogin = () => {
  return (
    <Login userType="customer"></Login>
  );
};

export default CustomerLogin;
