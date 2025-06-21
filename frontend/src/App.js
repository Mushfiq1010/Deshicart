import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Signup from "./components/Signup";
import CustomerLogin from "./components/CustomerLogin";
import SellerLogin from "./components/SellerLogin";

function App() {
  return (
    <Router>
      <nav style={{ padding: "1rem", backgroundColor: "#f0f0f0" }}>
        <Link to="/signup" style={{ marginRight: "1rem" }}>Signup</Link>
        <Link to="/login/customer" style={{ marginRight: "1rem" }}>Customer Login</Link>
        <Link to="/login/seller">Seller Login</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login/customer" element={<CustomerLogin />} />
        <Route path="/login/seller" element={<SellerLogin />} />
      </Routes>
    </Router>
  );
}

export default App;




