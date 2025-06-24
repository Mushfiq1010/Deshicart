import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SellerSignup from "./components/sellerSignup";
import CustomerSignup from "./components/customerSignup";
import CustomerLogin from "./components/CustomerLogin";
import SellerLogin from "./components/SellerLogin";
import HomePage from "./components/HomePage";
import AddProduct from "./components/SellerProducts/AddProduct";
import ProductList from "./components/SellerProducts/ProductList";
import EditProduct from "./components/SellerProducts/EditProduct";
import EditProfile from "./components/Editprofile";
import ChangePassword from "./components/changePassword";

function App() {
  return (
    <Router>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup/seller" element={<SellerSignup />} />
        <Route path="/signup/customer" element={<CustomerSignup />} />
        <Route path="/login/customer" element={<CustomerLogin />} />
        <Route path="/login/seller" element={<SellerLogin />} />
        <Route path="/seller/products" element={<ProductList />} />
        <Route path="/seller/products/new" element={<AddProduct />} />
        <Route path="/seller/products/edit/:id" element={<EditProduct />} />
        <Route path="/seller/edit-profile" element={<EditProfile />} />
        <Route path="/seller/change-password" element={<ChangePassword />} />
      </Routes>
    </Router>
  );
}

export default App;



