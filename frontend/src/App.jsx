import React from "react";
import { CartProvider } from "./context/CartContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// 📄 Páginas principales
import Home from "./pages/Home";
import Category from "./pages/Category";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Admin from "./pages/Admin";
import Dashboards from "./pages/Dashboards";
import AdminLogin from "./pages/AdminLogin";
import ProtectedRoute from "./components/ProtectedRoute";

// 🚀 Otras secciones
import Impresion3D from "./pages/Impresion3D";
import Robotica from "./pages/Robotica";
import Cursos from "./pages/Cursos";

function App() {
  return (
    <CartProvider>
      <Router>
        <Navbar />
        <main style={{ padding: "20px" }}>
          <Routes>
            {/* 🏠 Inicio */}
            <Route path="/" element={<Home />} />

            {/* 📦 Categorías dinámicas */}
            <Route path="/productos/:categoryName" element={<Category />} />
            <Route path="/industria/:categoryName" element={<Category />} />

            {/* 🚀 Otras categorías fijas */}
            <Route path="/impresion3d" element={<Impresion3D />} />
            <Route path="/robotica" element={<Robotica />} />
            <Route path="/cursos" element={<Cursos />} />

            {/* 🛒 Carrito y Checkout */}
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />

            {/* 📦 Detalle de producto */}
            <Route path="/producto/:id" element={<ProductDetail />} />

            {/* 🔐 Admin protegido */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />

            {/* 🔓 Login de admin */}
            <Route path="/admin-login" element={<AdminLogin />} />

            {/* 📊 Dashboards IoT */}
            <Route path="/dashboards" element={<Dashboards />} />
          </Routes>
        </main>
        <Footer />
      </Router>
    </CartProvider>
  );
}

export default App;
