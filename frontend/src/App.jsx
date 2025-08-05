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

// 📦 Productos
import Microcontroladores from "./pages/productos/Microcontroladores";
import Arduino from "./pages/productos/Arduino";
import ESP32 from "./pages/productos/ESP32";
import Raspberry from "./pages/productos/Raspberry";
import Sensores from "./pages/productos/Sensores";
import Componentes from "./pages/productos/Componentes";

// 🏭 Industria
import Mineria from "./pages/industria/Mineria";
import Pesqueria from "./pages/industria/Pesqueria";
import Ganaderia from "./pages/industria/Ganaderia";
import Construccion from "./pages/industria/Construccion";
import Militar from "./pages/industria/Militar";
import Agricultura from "./pages/industria/Agricultura"; // ✅ Nueva página

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

            {/* 📦 Productos */}
            <Route path="/productos/microcontroladores" element={<Microcontroladores />} />
            <Route path="/productos/arduino" element={<Arduino />} />
            <Route path="/productos/esp32" element={<ESP32 />} />
            <Route path="/productos/raspberry" element={<Raspberry />} />
            <Route path="/productos/sensores" element={<Sensores />} />
            <Route path="/productos/componentes" element={<Componentes />} />

            {/* 🏭 Industria */}
            <Route path="/industria/mineria" element={<Mineria />} />
            <Route path="/industria/pesqueria" element={<Pesqueria />} />
            <Route path="/industria/ganaderia" element={<Ganaderia />} />
            <Route path="/industria/construccion" element={<Construccion />} />
            <Route path="/industria/militar" element={<Militar />} />
            <Route path="/industria/agricultura" element={<Agricultura />} /> {/* ✅ Nueva ruta */}

            {/* 🚀 Otras categorías */}
            <Route path="/impresion3d" element={<Impresion3D />} />
            <Route path="/robotica" element={<Robotica />} />
            <Route path="/cursos" element={<Cursos />} />

            {/* 🛒 Carrito y Checkout */}
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />

            {/* 📂 Categoría dinámica y producto */}
            <Route path="/categoria/:name" element={<Category />} />
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
