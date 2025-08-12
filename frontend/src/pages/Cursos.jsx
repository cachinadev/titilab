// src/pages/Cursos.jsx
import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
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

// ✅ Image normalization (same logic as Cart.js)
const getImageUrl = (path) => {
  if (!path) return "/placeholder.png";
  if (path.startsWith("http")) return path;
  return path.startsWith("/") ? path : `/${path}`;
};

function Cursos() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const { addToCart } = useContext(CartContext);

  const backendUrl =
    process.env.REACT_APP_BACKEND_URL || "http://192.168.18.30:4000/api";

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${backendUrl}/products`)
      .then((res) => {
        const filtered = res.data
          .filter(
            (p) => p.category && p.category.toLowerCase().trim() === "cursos"
          )
          .map((p) => ({
            ...p,
            image: getImageUrl(p.image)
          }));
        setProducts(filtered);
      })
      .catch((err) => console.error("Error al obtener productos de Cursos:", err))
      .finally(() => setLoading(false));
  }, [backendUrl]);

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
          Cargando cursos...
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Cursos
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Explora nuestros cursos especializados en electrónica, IoT y más.
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
                  "&:hover": {
                    transform: "scale(1.03)",
                    boxShadow: 6
                  }
                }}
              >
                {/* Imagen clickeable */}
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

                {/* Botón agregar */}
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
              No hay cursos disponibles en este momento.
            </Typography>
          </Grid>
        )}
      </Grid>

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
  );
}

export default Cursos;
