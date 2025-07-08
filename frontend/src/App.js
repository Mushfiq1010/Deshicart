import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SellerSignup from "./pages/sellerSignup";
import CustomerSignup from "./pages/customerSignup";
import CustomerLogin from "./pages/CustomerLogin";
import SellerLogin from "./pages/SellerLogin";
import HomePage from "./pages/HomePage";
import AddProduct from "./components/SellerProducts/AddProduct";
import ProductList from "./components/SellerProducts/ProductList";
import EditProduct from "./components/SellerProducts/EditProduct";
import EditProfile from "./components/Editprofile";
import ChangePassword from "./components/changePassword";
import Allproducts from "./components/customerProducts/Allproducts";
import ProductPage from "./pages/ProductPage";
import OrderPage from "./pages/OrderPage"; // Adjust path
import { CategoryProvider } from "./context/CategoryContext"; // ✅ import

function App() {
  return (
    <Router>
      
    <CategoryProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup/seller" element={<SellerSignup />} />
        <Route path="/signup/customer" element={<CustomerSignup />} />
        <Route path="/login/customer" element={<CustomerLogin />} />
        <Route path="/login/seller" element={<SellerLogin />} />
        <Route path="/seller/products" element={<ProductList />} />
         <Route path="/customer/products" element={<Allproducts />} />
        <Route path="/seller/products/new" element={<AddProduct />} />
        <Route path="/seller/products/edit/:id" element={<EditProduct />} />
        <Route path="/seller/edit-profile" element={<EditProfile />} />
        <Route path="/seller/change-password" element={<ChangePassword />} />
        <Route path="/customer/products/:id" element={<ProductPage />} />
        <Route path="/order/:id" element={<OrderPage />} />
      </Routes>
      </CategoryProvider>
    </Router>
  );
}

export default App;



