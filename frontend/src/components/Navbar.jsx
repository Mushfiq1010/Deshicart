import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../Api";

const Navbar = ({ userType }) => {
  const [profile, setProfile] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await API.get(`/auth/${userType}/getMe`);
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to fetch profile");
      }
    };

    const loadCartCount = async () => {
      if (userType === "customer") {
        try {
          const res = await API.get("/customer/cart");
          setCartCount(res.data?.length || 0);
        } catch (err) {
          console.error("Failed to fetch cart count");
        }
      }
    };

    loadProfile();
    loadCartCount();
  }, [userType]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");

      const button = document.querySelector('.logout-btn');
      if (button) {
        button.classList.add('animate-pulse');
        setTimeout(() => {
          alert("Logged out successfully");
          navigate("/");
        }, 300);
      } else {
        alert("Logged out successfully");
        navigate("/");
      }
    } catch (err) {
      alert("Logout failed");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchText.trim()) {
      navigate(`/${userType}/products?name=${encodeURIComponent(searchText)}`);
    }
  };

  const navigationItems = [
    {
      label: "Orders",
      path: `/${userType}/orders`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
  ];

  if (userType === "customer") {
    navigationItems.push(
      {
        label: "Cart",
        path: "/customer/cart",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l1.68 4M7 13l-2.32-5M20 13v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6" />
          </svg>
        ),
        badge: cartCount,
      },
      {
        label: "Wishlist",
        path: "/customer/wishlist",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        ),
      }
    );
  }

  return (
    <nav className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 shadow-xl sticky top-0 z-50 backdrop-blur-sm">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div
            className="flex items-center cursor-pointer group"
            onClick={() => navigate(`/${userType}/products`)}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <span className="text-xl font-bold text-white">🛒</span>
            </div>
            <h1 className="text-2xl font-bold text-white group-hover:text-yellow-300 transition-colors duration-300">
              DeshiCart
            </h1>
          </div>

          <div className="flex-1 max-w-2xl mx-8 hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for products, brands and more..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full px-6 py-3 pr-12 bg-white/90 backdrop-blur-sm border-0 rounded-full text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-all duration-300 shadow-lg"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-2 rounded-full hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>
          </div>

          <div className="hidden md:flex items-center space-x-2">
            {navigationItems.map((item, index) => (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className="relative flex items-center space-x-2 px-4 py-2 text-white hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-105 group"
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-white hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-105"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.5-3.5a4 4 0 01-.5-1.5V11a6 6 0 00-12 0v1c0 .5-.2 1-.5 1.5L0 17h5m5 0v1a3 3 0 11-6 0v-1" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  3
                </span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 animate-slideDown">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                   {/*  <div className="px-4 py-3 hover:bg-gray-50 transition-colors duration-200">
                      <p className="text-sm text-gray-800 font-medium">Order Delivered</p>
                      <p className="text-xs text-gray-500">Your order #12345 has been delivered</p>
                      <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                    </div>
                    <div className="px-4 py-3 hover:bg-gray-50 transition-colors duration-200">
                      <p className="text-sm text-gray-800 font-medium">New Review</p>
                      <p className="text-xs text-gray-500">Someone reviewed your product</p>
                      <p className="text-xs text-gray-400 mt-1">1 day ago</p>
                    </div> */}
                  </div>
                </div>
              )}
            </div>

            {profile && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-3 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 hover:scale-105 group"
                >
                  <img
                    src={profile.PROFILEIMAGE || "/images/placeholder.jpg"}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover border-2 border-white/50 group-hover:border-yellow-300 transition-all duration-300"
                  />
                  <span className="font-medium text-white group-hover:text-yellow-300 transition-colors duration-300">
                    {profile.NAME}
                  </span>
                  <svg
                    className={`w-4 h-4 text-white transition-transform duration-300 ${
                      isProfileDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 animate-slideDown">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <img
                          src={profile.PROFILEIMAGE || "/images/placeholder.jpg"}
                          alt="Profile"
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-semibold text-gray-800">{profile.NAME}</p>
                          <p className="text-sm text-gray-500">{profile.EMAIL}</p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        navigate(`/${userType}/edit-profile`);
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-3"
                    >
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-gray-700">Edit Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        navigate(`/${userType}/settings`);
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-3"
                    >
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-gray-700">Settings</span>
                    </button>

                    <hr className="my-2" />

                    <button
                      onClick={handleLogout}
                      className="logout-btn w-full text-left px-4 py-3 hover:bg-red-50 transition-colors duration-200 flex items-center space-x-3 text-red-600 hover:text-red-700"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V4a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-all duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search for products..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full px-4 py-2 pr-10 bg-white/90 backdrop-blur-sm border-0 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-yellow-500 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 animate-slideDown">
            <div className="space-y-2">
              {navigationItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}

              {profile && (
                <>
                  <button
                    onClick={() => {
                      navigate(`/${userType}/edit-profile`);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Profile</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;