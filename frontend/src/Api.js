import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api/auth",
  withCredentials: true
});

export default API;