// src/components/Navbar.js
import React, { useState, useEffect, useContext, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem, Badge, Grow, Grid, useMediaQuery
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import MemoryIcon from "@mui/icons-material/Memory";
import SensorsIcon from "@mui/icons-material/Sensors";
import DeveloperBoardIcon from "@mui/icons-material/DeveloperBoard";
import DeviceHubIcon from "@mui/icons-material/DeviceHub";
import WidgetsIcon from "@mui/icons-material/Widgets";
import RouterIcon from "@mui/icons-material/Router";
import ConstructionIcon from "@mui/icons-material/Construction";
import AgricultureIcon from "@mui/icons-material/Agriculture";
import SailingIcon from "@mui/icons-material/Sailing";
import FactoryIcon from "@mui/icons-material/Factory";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import { CartContext } from "../context/CartContext";

function Navbar() {
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width:900px)");

  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorProductos, setAnchorProductos] = useState(null);
  const [anchorIndustria, setAnchorIndustria] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [animateCart, setAnimateCart] = useState(false);

  const { getTotalItems } = useContext(CartContext);
  const cartCount = getTotalItems();

  const closeTimeout = useRef(null);

  useEffect(() => {
    if (cartCount > 0) {
      setAnimateCart(true);
      const timer = setTimeout(() => setAnimateCart(false), 500);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.role === "admin") setIsAdmin(true);
      } catch {
        setIsAdmin(false);
      }
    }
  }, []);

  const linkStyle = (path) => ({
    color: "#fff",
    marginRight: "15px",
    textDecoration: location.pathname === path ? "underline" : "none"
  });

  const dropdownStyle = {
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    borderRadius: "8px",
    padding: "12px",
    minWidth: "400px"
  };

  const itemStyle = {
    padding: "10px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    textDecoration: "none",
    color: "black",
    transition: "background-color 0.2s ease",
    "&:hover": { backgroundColor: "#f0f0f0" }
  };

  const handleMenuOpen = (setter, event) => {
    clearTimeout(closeTimeout.current);
    setter(event.currentTarget);
  };

  const handleMenuClose = (setter) => {
    closeTimeout.current = setTimeout(() => {
      setter(null);
    }, 250); // ⏳ delay de cierre
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: "#1e1e1e" }}>
      <Toolbar>
        {/* Logo */}
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            flexGrow: 1,
            color: "#fff",
            textDecoration: "none",
            fontWeight: "bold",
            fontSize: "1.3rem"
          }}
        >
          🛒 Titilab
        </Typography>

        {/* Menú móvil */}
        <IconButton
          edge="start"
          color="inherit"
          sx={{ display: { xs: "flex", md: "none" } }}
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          <MenuIcon />
        </IconButton>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          {/* Productos */}
          <MenuItem component={Link} to="/productos/microcontroladores">Microcontroladores</MenuItem>
          <MenuItem component={Link} to="/productos/arduino">Arduino</MenuItem>
          <MenuItem component={Link} to="/productos/esp32">ESP32</MenuItem>
          <MenuItem component={Link} to="/productos/raspberry">Raspberry</MenuItem>
          <MenuItem component={Link} to="/productos/sensores">Sensores</MenuItem>
          <MenuItem component={Link} to="/productos/componentes">Componentes</MenuItem>
          {/* Industria */}
          <MenuItem component={Link} to="/industria/mineria">Minería</MenuItem>
          <MenuItem component={Link} to="/industria/pesqueria">Pesquería</MenuItem>
          <MenuItem component={Link} to="/industria/ganaderia">Ganadería</MenuItem>
          <MenuItem component={Link} to="/industria/construccion">Construcción</MenuItem>
          <MenuItem component={Link} to="/industria/militar">Militar</MenuItem>
          {/* Otras secciones */}
          <MenuItem component={Link} to="/impresion3d">Impresión 3D</MenuItem>
          <MenuItem component={Link} to="/robotica">Robótica</MenuItem>
          <MenuItem component={Link} to="/cursos">Cursos</MenuItem>
          <MenuItem component={Link} to="/cart">
            Carrito
            {cartCount > 0 && (
              <Badge badgeContent={cartCount} color="secondary" sx={{ ml: 1 }} />
            )}
          </MenuItem>
          {isAdmin && <MenuItem component={Link} to="/admin">Admin</MenuItem>}
        </Menu>

        {/* Menú escritorio */}
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* Productos */}
          <div
            onMouseEnter={(e) => !isMobile && handleMenuOpen(setAnchorProductos, e)}
            onMouseLeave={() => !isMobile && handleMenuClose(setAnchorProductos)}
          >
            <Button
              sx={{ ...linkStyle("/productos"), display: { xs: "none", md: "inline-flex" } }}
              endIcon={<ArrowDropDownIcon />}
              onClick={(e) =>
                isMobile
                  ? setAnchorProductos(e.currentTarget)
                  : handleMenuOpen(setAnchorProductos, e)
              }
            >
              Productos
            </Button>
            <Menu
              anchorEl={anchorProductos}
              open={Boolean(anchorProductos)}
              onClose={() => setAnchorProductos(null)}
              TransitionComponent={Grow}
              PaperProps={{ sx: dropdownStyle }}
              MenuListProps={{
                onMouseEnter: () => clearTimeout(closeTimeout.current),
                onMouseLeave: () => handleMenuClose(setAnchorProductos)
              }}
            >
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <MenuItem sx={itemStyle} component={Link} to="/productos/microcontroladores">
                    <MemoryIcon sx={{ mr: 1 }} /> Microcontroladores
                  </MenuItem>
                  <MenuItem sx={itemStyle} component={Link} to="/productos/arduino">
                    <DeveloperBoardIcon sx={{ mr: 1 }} /> Arduino
                  </MenuItem>
                  <MenuItem sx={itemStyle} component={Link} to="/productos/esp32">
                    <RouterIcon sx={{ mr: 1 }} /> ESP32
                  </MenuItem>
                </Grid>
                <Grid item xs={6}>
                  <MenuItem sx={itemStyle} component={Link} to="/productos/raspberry">
                    <DeviceHubIcon sx={{ mr: 1 }} /> Raspberry
                  </MenuItem>
                  <MenuItem sx={itemStyle} component={Link} to="/productos/sensores">
                    <SensorsIcon sx={{ mr: 1 }} /> Sensores
                  </MenuItem>
                  <MenuItem sx={itemStyle} component={Link} to="/productos/componentes">
                    <WidgetsIcon sx={{ mr: 1 }} /> Componentes
                  </MenuItem>
                </Grid>
              </Grid>
            </Menu>
          </div>

          {/* Industria */}
          <div
            onMouseEnter={(e) => !isMobile && handleMenuOpen(setAnchorIndustria, e)}
            onMouseLeave={() => !isMobile && handleMenuClose(setAnchorIndustria)}
          >
            <Button
              sx={{ ...linkStyle("/industria"), display: { xs: "none", md: "inline-flex" } }}
              endIcon={<ArrowDropDownIcon />}
              onClick={(e) =>
                isMobile
                  ? setAnchorIndustria(e.currentTarget)
                  : handleMenuOpen(setAnchorIndustria, e)
              }
            >
              Industria
            </Button>
            <Menu
              anchorEl={anchorIndustria}
              open={Boolean(anchorIndustria)}
              onClose={() => setAnchorIndustria(null)}
              TransitionComponent={Grow}
              PaperProps={{ sx: dropdownStyle }}
              MenuListProps={{
                onMouseEnter: () => clearTimeout(closeTimeout.current),
                onMouseLeave: () => handleMenuClose(setAnchorIndustria)
              }}
            >
              <MenuItem sx={itemStyle} component={Link} to="/industria/mineria">
                <FactoryIcon sx={{ mr: 1 }} /> Minería
              </MenuItem>
              <MenuItem sx={itemStyle} component={Link} to="/industria/pesqueria">
                <SailingIcon sx={{ mr: 1 }} /> Pesquería
              </MenuItem>
              <MenuItem sx={itemStyle} component={Link} to="/industria/ganaderia">
                <AgricultureIcon sx={{ mr: 1 }} /> Ganadería
              </MenuItem>
              <MenuItem sx={itemStyle} component={Link} to="/industria/construccion">
                <ConstructionIcon sx={{ mr: 1 }} /> Construcción
              </MenuItem>
              <MenuItem sx={itemStyle} component={Link} to="/industria/militar">
                <MilitaryTechIcon sx={{ mr: 1 }} /> Militar
              </MenuItem>
            </Menu>
          </div>

          {/* Otras categorías */}
          <Button component={Link} to="/impresion3d" sx={{ ...linkStyle("/impresion3d"), display: { xs: "none", md: "inline-flex" } }}>
            Impresión 3D
          </Button>
          <Button component={Link} to="/robotica" sx={{ ...linkStyle("/robotica"), display: { xs: "none", md: "inline-flex" } }}>
            Robótica
          </Button>
          <Button component={Link} to="/cursos" sx={{ ...linkStyle("/cursos"), display: { xs: "none", md: "inline-flex" } }}>
            Cursos
          </Button>

          {/* Carrito */}
          <IconButton
            component={Link}
            to="/cart"
            sx={{
              color: "white",
              display: { xs: "none", md: "inline-flex" },
              animation: animateCart ? "bounce 0.5s ease" : "none"
            }}
          >
            {cartCount > 0 ? (
              <Badge badgeContent={cartCount} color="secondary">
                <ShoppingCartIcon />
              </Badge>
            ) : (
              <ShoppingCartIcon />
            )}
          </IconButton>

          {/* Admin */}
          {isAdmin && (
            <Button
              component={Link}
              to="/admin"
              sx={{ ...linkStyle("/admin"), display: { xs: "none", md: "inline-flex" } }}
              startIcon={<AdminPanelSettingsIcon />}
            >
              Admin
            </Button>
          )}
        </div>
      </Toolbar>

      {/* Animación carrito */}
      <style>
        {`
          @keyframes bounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.3); }
          }
        `}
      </style>
    </AppBar>
  );
}

export default Navbar;
