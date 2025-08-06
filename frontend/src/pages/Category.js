// src/pages/Category.js
import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Snackbar,
  Alert
} from "@mui/material";
import { CartContext } from "../context/CartContext";
import { getImageUrl } from "../utils/imageUtils"; // ✅ Shared image util

function Category() {
  const { categoryName = "" } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const { addToCart } = useContext(CartContext);

  const backendUrl =
    process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:4000/api";

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${backendUrl}/products`)
      .then((res) => {
        const filtered = res.data
          .filter(
            (p) =>
              p.category &&
              p.category.toLowerCase().trim() === categoryName.toLowerCase().trim()
          )
          .map((p) => ({
            ...p,
            image: getImageUrl(p.image) // ✅ Normalize image
          }));
        setProducts(filtered);
      })
      .catch((err) => {
        console.error("Error al obtener productos:", err);
      })
      .finally(() => setLoading(false));
  }, [categoryName, backendUrl]);

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
        <Typography variant="h6" sx={{ mt: 2 }}>
          Cargando productos de{" "}
          {categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}...
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        {categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Bienvenido a la sección de{" "}
        {categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}. Aquí
        encontrarás los mejores productos para tus proyectos.
      </Typography>

      <Grid container spacing={3}>
        {products.length > 0 ? (
          products.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
              <Card
                sx={{
                  height: 400,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  "&:hover": { transform: "scale(1.03)", boxShadow: 6 }
                }}
              >
                <Link
                  to={`/producto/${product._id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={product.image}
                    alt={product.name}
                    sx={{
                      objectFit: "contain",
                      bgcolor: "#f5f5f5",
                      borderBottom: "1px solid #ddd"
                    }}
                  />
                </Link>

                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                  }}
                >
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
                    sx={{
                      mb: 1,
                      minHeight: 40,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical"
                    }}
                  >
                    {product.description}
                  </Typography>

                  <Typography variant="h6" color="primary">
                    S/ {Number(product.price).toFixed(2)}
                  </Typography>
                </CardContent>

                <CardActions sx={{ mt: "auto" }}>
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
              No hay productos disponibles en la categoría {categoryName}.
            </Typography>
          </Grid>
        )}
      </Grid>

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
  );
}

export default Category;
