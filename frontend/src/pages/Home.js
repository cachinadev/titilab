// src/pages/Home.js
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Container, Typography, Grid, Card, CardMedia, CardContent, CardActions,
  Button, CircularProgress, Snackbar, Alert, Box, List, ListItem,
  ListItemText, Paper, TextField, Badge
} from "@mui/material";
import { CartContext } from "../context/CartContext";
import { getImageUrl } from "../utils/imageUtils";

const CATEGORIES = [
  {
    name: "Productos",
    subcategories: [
      "Microcontroladores", "Arduino", "ESP32", "Raspberry",
      "Sensores", "Componentes", "Impresión 3D"
    ]
  },
  {
    name: "Industria",
    subcategories: [
      "Minería", "Pesquería", "Ganadería", "Construcción",
      "Militar", "Agricultura"
    ]
  },
  { name: "Robótica", subcategories: [] },
  { name: "Cursos", subcategories: [] }
];

const CARD_STYLES = {
  root: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    "&:hover": { transform: "scale(1.03)", boxShadow: 6 }
  },
  media: {
    objectFit: "contain",
    bgcolor: "#f5f5f5",
    borderBottom: "1px solid #ddd",
    height: 200,
    p: 2
  },
  content: { flexGrow: 1, display: "flex", flexDirection: "column" },
  description: {
    mb: 1,
    minHeight: 40,
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical"
  }
};

const CATEGORY_ITEM_STYLES = (isSelected) => ({
  width: "auto",
  mr: 2,
  mb: 1,
  "&:hover": { bgcolor: "grey.200" },
  bgcolor: isSelected ? "primary.main" : "transparent",
  color: isSelected ? "white" : "inherit",
  borderRadius: 1
});

function Home() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const { addToCart } = useContext(CartContext);

  // Fetch products & normalize image URLs
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:4000/api"}/products`
        );
        const normalized = res.data.map((p) => ({
          ...p,
          image: getImageUrl(p.image)
        }));
        setProducts(normalized);
        setFilteredProducts(normalized);
      } catch (err) {
        console.error("Error al obtener productos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter products
  useEffect(() => {
    let tempProducts = [...products];
    if (selectedCategory !== "Todos") {
      tempProducts = tempProducts.filter(
        (p) => p.category && p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    if (search.trim() !== "") {
      tempProducts = tempProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFilteredProducts(tempProducts);
  }, [search, selectedCategory, products]);

  const getCategoryCount = (category) => {
    if (category === "Todos") return products.length;
    return products.filter(
      (p) => p.category && p.category.toLowerCase() === category.toLowerCase()
    ).length;
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    setSnackbar({
      open: true,
      message: `${product.name} agregado al carrito 🛒`
    });
  };

  if (loading) {
    return (
      <Container sx={{ textAlign: "center", mt: 10 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Cargando productos...</Typography>
      </Container>
    );
  }

  return (
    <>
      {/* Hero */}
      <Box
        sx={{
          width: "100%",
          height: { xs: 80, md: 140 },
          backgroundImage: "url('https://via.placeholder.com/1600x400?text=Titilab+Store')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          textAlign: "center",
          mb: 4
        }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{
            bgcolor: "rgba(0,0,0,0.5)",
            p: 2,
            borderRadius: 2,
            maxWidth: "90%"
          }}
        >
          Bienvenido a Titilab Store – Componentes y Soluciones IoT
        </Typography>
      </Box>

      <Container maxWidth="xl">
        {/* Search & Categories */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Categorías
            </Typography>
            <List sx={{ display: "flex", flexWrap: "wrap" }}>
              <ListItem
                button
                selected={selectedCategory === "Todos"}
                onClick={() => setSelectedCategory("Todos")}
                sx={CATEGORY_ITEM_STYLES(selectedCategory === "Todos")}
              >
                <ListItemText primary="Todos" />
                <Badge
                  badgeContent={getCategoryCount("Todos")}
                  color={selectedCategory === "Todos" ? "secondary" : "primary"}
                  sx={{ ml: 1 }}
                />
              </ListItem>
              {CATEGORIES.map((group, idx) => (
                <Box key={idx} sx={{ display: "flex", flexWrap: "wrap" }}>
                  {group.subcategories.length > 0
                    ? group.subcategories.map((sub, i) => (
                        <ListItem
                          button
                          key={i}
                          selected={selectedCategory === sub}
                          onClick={() => setSelectedCategory(sub)}
                          sx={CATEGORY_ITEM_STYLES(selectedCategory === sub)}
                        >
                          <ListItemText primary={sub} />
                          <Badge
                            badgeContent={getCategoryCount(sub)}
                            color={selectedCategory === sub ? "secondary" : "primary"}
                            sx={{ ml: 1 }}
                          />
                        </ListItem>
                      ))
                    : (
                        <ListItem
                          button
                          selected={selectedCategory === group.name}
                          onClick={() => setSelectedCategory(group.name)}
                          sx={CATEGORY_ITEM_STYLES(selectedCategory === group.name)}
                        >
                          <ListItemText primary={group.name} />
                          <Badge
                            badgeContent={getCategoryCount(group.name)}
                            color={selectedCategory === group.name ? "secondary" : "primary"}
                            sx={{ ml: 1 }}
                          />
                        </ListItem>
                      )}
                </Box>
              ))}
            </List>
          </Paper>
        </Box>

        {/* Products */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            {selectedCategory === "Todos" ? "Todos los Productos" : selectedCategory}
          </Typography>
          <Grid container spacing={3}>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                  <Card sx={CARD_STYLES.root}>
                    <Link
                      to={`/producto/${product._id}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <CardMedia
                        component="img"
                        image={getImageUrl(product.image)}
                        alt={product.name}
                        sx={CARD_STYLES.media}
                      />
                    </Link>
                    <CardContent sx={CARD_STYLES.content}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        noWrap
                        component={Link}
                        to={`/producto/${product._id}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        {product.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={CARD_STYLES.description}
                      >
                        {product.description}
                      </Typography>
                      <Typography variant="h6" color="primary" sx={{ mt: "auto" }}>
                        S/ {Number(product.price).toFixed(2)}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        variant="contained"
                        size="small"
                        fullWidth
                        onClick={() => handleAddToCart(product)}
                      >
                        Agregar al carrito
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography variant="body1" color="text.secondary">
                  No se encontraron productos para esta búsqueda.
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={2000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert severity="success" sx={{ width: "100%" }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
}

export default Home;
