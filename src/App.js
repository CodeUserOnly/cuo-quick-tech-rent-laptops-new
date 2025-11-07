import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Homepage from "./pages/Homepage";
import BrowseDevices from "./pages/BrowseDevices";
import ProductPage from "./pages/ProductPage";
import CheckoutPage from "./pages/CheckoutPage";
import UserDashboard from "./pages/UserDashboard";
import AdminPanel from "./pages/AdminPanel";
import SupportPage from "./pages/SupportPage";
import AboutPage from "./pages/AboutPage";
import ShoppingCart from "./pages/ShoppingCart";
import UserLogin from "./pages/UserLogin";
import UserSignup from "./pages/UserSignup";
import AdminLogin from "./pages/AdminLogin";
import AdminSignup from "./pages/AdminSignup";
import {
  devicesService,
  //usersService,
  ordersService,
} from "./services/supabase";
import "./App.css";

function App() {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load devices from Supabase
  useEffect(() => {
    const loadDevices = async () => {
      try {
        setLoading(true);
        console.log("Loading devices from Supabase...");
        const devicesData = await devicesService.getAll();
        console.log("Devices loaded:", devicesData);
        setDevices(devicesData);

        // Also save to localStorage as backup
        localStorage.setItem("devices", JSON.stringify(devicesData));
      } catch (error) {
        console.error("Error loading devices from Supabase:", error);
        setError("Failed to load devices. Using demo data.");

        // Fallback to localStorage
        const savedDevices = localStorage.getItem("devices");
        if (savedDevices) {
          const parsedDevices = JSON.parse(savedDevices);
          console.log("Devices loaded from localStorage:", parsedDevices);
          setDevices(parsedDevices);
        } else {
          // Use hardcoded fallback data
          const fallbackDevices = [
            {
              id: "1",
              name: "Dell XPS 13",
              brand: "Dell",
              price: 45,
              image:
                "https://via.placeholder.com/300x200/007bff/ffffff?text=Dell+XPS+13",
              specs: {
                processor: "Intel Core i7-1165G7",
                ram: "16GB",
                storage: "512GB SSD",
                display: "13.4-inch FHD+",
                graphics: "Intel Iris Xe",
              },
              available: true,
              location: "New York",
              created_at: new Date().toISOString(),
            },
            {
              id: "2",
              name: "MacBook Pro 14",
              brand: "Apple",
              price: 75,
              image:
                "https://via.placeholder.com/300x200/28a745/ffffff?text=MacBook+Pro+14",
              specs: {
                processor: "Apple M1 Pro",
                ram: "16GB",
                storage: "1TB SSD",
                display: "14.2-inch Liquid Retina XDR",
                graphics: "16-core GPU",
              },
              available: true,
              location: "San Francisco",
              created_at: new Date().toISOString(),
            },
          ];
          setDevices(fallbackDevices);
          localStorage.setItem("devices", JSON.stringify(fallbackDevices));
        }
      } finally {
        setLoading(false);
      }
    };

    loadDevices();

    // Load user from localStorage
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Error loading user from localStorage:", e);
        localStorage.removeItem("user");
      }
    }
  }, []);

  // Cart functions - UPDATED: Added unique cartItemId
  const addToCart = (device) => {
    if (device.available) {
      const cartItem = {
        ...device,
        rentalDuration: 7,
        cartItemId: `${device.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` // Unique ID for cart item
      };
      setCart([...cart, cartItem]);
      console.log(`Added ${device.name} to cart. Cart items:`, cart.length + 1);
    }
  };

  const removeFromCart = (deviceId) => {
    setCart(cart.filter((item) => item.id !== deviceId));
  };

  const updateCartItemDuration = (deviceId, duration) => {
    setCart(
      cart.map((item) =>
        item.id === deviceId ? { ...item, rentalDuration: duration } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // User functions
  const loginUser = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logoutUser = () => {
    setUser(null);
    setCart([]);
    localStorage.removeItem("user");
  };

  // Device management functions
  const addDevice = async (newDevice) => {
    try {
      const device = await devicesService.create(newDevice);
      setDevices([...devices, device]);
      return device;
    } catch (error) {
      console.error("Error adding device:", error);
      // Fallback to localStorage
      const deviceWithId = {
        ...newDevice,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
      };
      const updatedDevices = [...devices, deviceWithId];
      setDevices(updatedDevices);
      localStorage.setItem("devices", JSON.stringify(updatedDevices));
      return deviceWithId;
    }
  };

  const updateDevice = async (deviceId, updatedData) => {
    try {
      // First get the current device to merge with updated data
      const currentDevice = devices.find(device => device.id === deviceId);
      if (!currentDevice) {
        throw new Error(`Device with ID ${deviceId} not found`);
      }
      
      const updatedDevice = {
        ...currentDevice,
        ...updatedData,
        id: deviceId // Ensure ID is preserved
      };
      
      console.log('Updating device in database:', deviceId, updatedDevice);
      await devicesService.update(deviceId, updatedDevice);
      
      setDevices(
        devices.map((device) =>
          device.id === deviceId ? updatedDevice : device
        )
      );
      
      console.log('Device updated successfully');
    } catch (error) {
      console.error("Error updating device:", error);
      // Fallback to localStorage
      const currentDevice = devices.find(device => device.id === deviceId);
      const updatedDevice = {
        ...currentDevice,
        ...updatedData,
        id: deviceId
      };
      const updatedDevices = devices.map((device) =>
        device.id === deviceId ? updatedDevice : device
      );
      setDevices(updatedDevices);
      localStorage.setItem("devices", JSON.stringify(updatedDevices));
    }
  };

  const deleteDevice = async (deviceId) => {
    try {
      await devicesService.delete(deviceId);
      setDevices(devices.filter((device) => device.id !== deviceId));
    } catch (error) {
      console.error("Error deleting device:", error);
      // Fallback to localStorage
      const updatedDevices = devices.filter((device) => device.id !== deviceId);
      setDevices(updatedDevices);
      localStorage.setItem("devices", JSON.stringify(updatedDevices));
    }
  };

  // Order functions
  const createOrder = async (orderData) => {
    try {
      const order = await ordersService.create(orderData);
      return order;
    } catch (error) {
      console.error("Error creating order:", error);
      // Fallback to localStorage
      const orders = JSON.parse(localStorage.getItem("orders") || "[]");
      const newOrder = {
        ...orderData,
        id: Date.now().toString(),
        status: "pending",
        created_at: new Date().toISOString(),
      };
      localStorage.setItem("orders", JSON.stringify([...orders, newOrder]));
      return newOrder;
    }
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading Quick Tech Rent...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Header user={user} cartCount={cart.length} logoutUser={logoutUser} />

        <main className="main-content">
          {error && (
            <div className="container mt-4">
              <div className="alert alert-warning">{error}</div>
            </div>
          )}

          <Routes>
            {/* FIXED: Added addToCart prop to Homepage */}
            <Route 
              path="/" 
              element={
                <Homepage 
                  devices={devices} 
                  addToCart={addToCart} 
                />
              } 
            />
            <Route
              path="/browse"
              element={
                <BrowseDevices devices={devices} addToCart={addToCart} />
              }
            />
            <Route
              path="/product/:id"
              element={<ProductPage devices={devices} addToCart={addToCart} />}
            />
            <Route
              path="/checkout"
              element={
                <CheckoutPage
                  cart={cart}
                  user={user}
                  createOrder={createOrder}
                  clearCart={clearCart}
                />
              }
            />
            <Route path="/dashboard" element={<UserDashboard user={user} />} />
            <Route
              path="/admin"
              element={
                <AdminPanel
                  devices={devices}
                  addDevice={addDevice}
                  updateDevice={updateDevice}
                  deleteDevice={deleteDevice}
                  user={user}
                />
              }
            />
            <Route path="/support" element={<SupportPage />} />
            <Route
              path="/about"
              element={<AboutPage user={user} loginUser={loginUser} />}
            />
            <Route
              path="/cart"
              element={
                <ShoppingCart
                  cart={cart}
                  updateCartItemDuration={updateCartItemDuration}
                  removeFromCart={removeFromCart}
                />
              }
            />
            <Route
              path="/login"
              element={<UserLogin loginUser={loginUser} />}
            />
            <Route
              path="/signup"
              element={<UserSignup loginUser={loginUser} />}
            />
            <Route
              path="/admin/login"
              element={<AdminLogin loginUser={loginUser} />}
            />
            <Route
              path="/admin/signup"
              element={<AdminSignup loginUser={loginUser} />}
            />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;