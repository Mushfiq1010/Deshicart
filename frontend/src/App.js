import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SellerSignup from "./pages/SellerSignup";
import CustomerSignup from "./pages/customerSignup";
import CustomerLogin from "./pages/CustomerLogin";
import SellerLogin from "./pages/SellerLogin";
import AdminLogin from "./components/AdminLogin";
import HomePage from "./pages/HomePage";
import AdminDashboard from "./pages/AdminDashboard";
import ManageUsers from "./pages/ManageUsers";
import ManageProducts from "./pages/ManageProducts";
import AddProduct from "./components/SellerProducts/AddProduct";
import ProductList from "./components/SellerProducts/ProductList";
import EditProduct from "./components/SellerProducts/EditProduct";
import EditProfile from "./components/Editprofile";
import ChangePassword from "./components/changePassword";
import Allproducts from "./components/customerProducts/Allproducts";
import CategoryBuilder from "./pages/CategoryBuilder";
import ProductPage from "./pages/ProductPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import OrderPage from "./pages/OrderPage"; 
import WalletPay from "./pages/WalletPay"; 
import CartPay from "./pages/CartPay";
import { CategoryProvider } from "./context/CategoryContext"; 
import OrderHistory from "./pages/ManageReports";
import CartPage from "./components/customerProducts/cartproducts";

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
        <Route path="/login/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<ManageUsers />} />
        <Route path="/admin/products" element={<ManageProducts />} />
        <Route path="/admin/categories" element={<CategoryBuilder />} />
        <Route path="/admin/reports" element={<OrderHistory />} />
        <Route path="/seller/products" element={<ProductList />} />
         <Route path="/customer/products" element={<Allproducts />} />
        <Route path="/seller/products/new" element={<AddProduct />} />
        <Route path="/seller/products/edit/:id" element={<EditProduct />} />
        <Route path="/seller/edit-profile" element={<EditProfile />} />
        <Route path="/seller/change-password" element={<ChangePassword />} />
        <Route path="/customer/products/:id" element={<ProductPage />} />
        <Route path="/order/:id" element={<OrderPage />} />
        <Route path="/customer/cart" element={<CartPage />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/wallet-pay" element={<WalletPay />} />
        <Route path="/cart-pay" element={<CartPay />} />
      </Routes>
      </CategoryProvider>
    </Router>
  );
}

export default App;



