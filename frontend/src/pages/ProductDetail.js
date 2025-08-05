// src/pages/ProductDetail.js
import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom"; // ✅ Added back
import axios from "axios";
import {
  Container,
  Grid,
  Typography,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  CardMedia,
  Box,
  Paper,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { CartContext } from "../context/CartContext";


function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [modalProduct, setModalProduct] = useState(null); // For popup quick view
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost:4000/api/products/${id}`)
      .then((res) => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al obtener detalles del producto:", err);
        setLoading(false);
      });
  }, [id]);

  // Fetch related products from same category
  useEffect(() => {
    if (product?.category) {
      axios
        .get(`http://localhost:4000/api/products`)
        .then((res) => {
          const related = res.data.filter(
            (p) => p.category === product.category && p._id !== product._id
          );
          setRelatedProducts(related);
        })
        .catch((err) => {
          console.error("Error al obtener productos relacionados:", err);
        });
    }
  }, [product]);

  const handleAddToCart = (prod) => {
    addToCart(prod);
    setSnackbar({
      open: true,
      message: `${prod.name} agregado al carrito 🛒`
    });
  };

  if (loading) {
    return (
      <Container sx={{ textAlign: "center", mt: 10 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Cargando detalles del producto...
        </Typography>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="h5" color="error" gutterBottom>
          Producto no encontrado.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/"
          sx={{ mt: 2 }}
        >
          Volver a la tienda
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 6 }}>
      <Paper sx={{ p: 3, borderRadius: 3, mb: 4 }}>
        <Grid container spacing={4}>
          {/* Product Image */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                border: "1px solid #ddd",
                borderRadius: 2,
                overflow: "hidden",
                bgcolor: "#fafafa"
              }}
            >
              <CardMedia
                component="img"
                image={product.image || "https://via.placeholder.com/500x400?text=Sin+Imagen"}
                alt={product.name}
                sx={{
                  width: "100%",
                  height: 400,
                  objectFit: "contain"
                }}
              />
            </Box>
          </Grid>

          {/* Product Info */}
          <Grid item xs={12} md={6}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {product.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Categoría: {product.category}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {product.description?.trim() || "Sin descripción"}
            </Typography>
            <Typography variant="h5" color="primary" fontWeight="bold" sx={{ mb: 1 }}>
              S/ {Number(product.price).toFixed(2)}
            </Typography>
            <Typography
              variant="body2"
              sx={{ mb: 2, color: product.stock > 0 ? "success.main" : "error.main" }}
            >
              Stock disponible: {product.stock}
            </Typography>

            <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => handleAddToCart(product)}
                disabled={product.stock <= 0}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: "bold"
                }}
              >
                {product.stock > 0 ? "Agregar al carrito" : "Agotado"}
              </Button>
              <Button
                variant="outlined"
                size="large"
                component={Link}
                to="/"
              >
                Volver a la tienda
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Productos Relacionados
          </Typography>
          <Grid container spacing={3}>
            {relatedProducts.map((rel) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={rel._id}>
                <Paper
                  sx={{
                    p: 2,
                    textAlign: "center",
                    transition: "0.3s",
                    "&:hover": { boxShadow: 6 }
                  }}
                >
                  {/* Image -> Quick view modal */}
                  <CardMedia
                    component="img"
                    image={rel.image}
                    alt={rel.name}
                    height="160"
                    sx={{
                      objectFit: "contain",
                      bgcolor: "#f5f5f5",
                      borderRadius: 1,
                      mb: 1,
                      cursor: "pointer"
                    }}
                    onClick={() => setModalProduct(rel)}
                  />

                  {/* Name -> Link to detail page */}
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    noWrap
                    component={Link}
                    to={`/producto/${rel._id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    {rel.name}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" noWrap>
                    {rel.description}
                  </Typography>

                  <Typography variant="h6" color="primary">
                    S/ {Number(rel.price).toFixed(2)}
                  </Typography>

                  <Button
                    variant="contained"
                    size="small"
                    fullWidth
                    sx={{ mt: 1 }}
                    onClick={() => handleAddToCart(rel)}
                  >
                    Agregar al carrito
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}


      {/* Quick View Modal */}
      <Dialog open={!!modalProduct} onClose={() => setModalProduct(null)} maxWidth="md" fullWidth>
        {modalProduct && (
          <>
            <DialogTitle>
              {modalProduct.name}
              <IconButton
                onClick={() => setModalProduct(null)}
                sx={{ position: "absolute", right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <CardMedia
                    component="img"
                    image={modalProduct.image}
                    alt={modalProduct.name}
                    sx={{
                      width: "100%",
                      height: 300,
                      objectFit: "contain",
                      bgcolor: "#f5f5f5"
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {modalProduct.description}
                  </Typography>
                  <Typography variant="h5" color="primary" fontWeight="bold" sx={{ mb: 1 }}>
                    S/ {Number(modalProduct.price).toFixed(2)}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ mb: 2, color: modalProduct.stock > 0 ? "success.main" : "error.main" }}
                  >
                    Stock disponible: {modalProduct.stock}
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={() => handleAddToCart(modalProduct)}
                    disabled={modalProduct.stock <= 0}
                  >
                    {modalProduct.stock > 0 ? "Agregar al carrito" : "Agotado"}
                  </Button>
                </Grid>
              </Grid>
            </DialogContent>
          </>
        )}
      </Dialog>

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

export default ProductDetail;
