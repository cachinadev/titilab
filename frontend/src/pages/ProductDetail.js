// src/pages/ProductDetail.js
import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
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
import { getImageUrl } from "../utils/imageUtils";
import { apiGet } from "../utils/api";

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [modalProduct, setModalProduct] = useState(null);
  const { addToCart } = useContext(CartContext);

  // Derivados para deps limpias del useEffect
  const category = product?.category;
  const productId = product?._id ?? product?.id;

  // === Obtener producto por id ===
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const data = await apiGet(`/products/${id}`, { withAuth: false });

        // Toma el primer campo de imagen disponible
        const imgRaw =
          data.image ??
          data.imageUrl ??
          data.image_url ??
          data.image_path ??
          data.file ??
          data.filename ??
          "";

        const normalized = {
          ...data,
          _id: data._id ?? data.id,
          image: getImageUrl(imgRaw),
        };

        if (active) setProduct(normalized);
      } catch (err) {
        console.error("Error al obtener detalles del producto:", err);
        if (active) setProduct(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id]);

  // === Obtener relacionados (misma categoría, distinto id) ===
  useEffect(() => {
    if (!category) return;

    let active = true;
    (async () => {
      try {
        const list = await apiGet(`/products`, { withAuth: false });

        const related = (Array.isArray(list) ? list : [])
          .filter((p) => p?.category === category && (p._id ?? p.id) !== productId)
          .map((p) => {
            const imgRaw =
              p.image ??
              p.imageUrl ??
              p.image_url ??
              p.image_path ??
              p.file ??
              p.filename ??
              "";
            return {
              ...p,
              _id: p._id ?? p.id,
              image: getImageUrl(imgRaw),
            };
          });

        if (active) setRelatedProducts(related);
      } catch (err) {
        console.error("Error al obtener productos relacionados:", err);
        if (active) setRelatedProducts([]);
      }
    })();

    return () => { active = false; };
  }, [category, productId]);

  const handleAddToCart = (prod) => {
    addToCart(prod);
    setSnackbar({
      open: true,
      message: `${prod.name} agregado al carrito 🛒`,
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
        <Button variant="contained" color="primary" component={Link} to="/" sx={{ mt: 2 }}>
          Volver a la tienda
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 6 }}>
      <Paper sx={{ p: 3, borderRadius: 3, mb: 4 }}>
        <Grid container spacing={4}>
          {/* Imagen del producto */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                border: "1px solid #ddd",
                borderRadius: 2,
                overflow: "hidden",
                bgcolor: "#fafafa",
              }}
            >
              <CardMedia
                component="img"
                image={product.image}
                alt={product.name}
                sx={{ width: "100%", height: 400, objectFit: "contain" }}
              />
            </Box>
          </Grid>

          {/* Info del producto */}
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
              S/ {Number(product.price || 0).toFixed(2)}
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
                sx={{ px: 4, py: 1.5, fontSize: "1rem", fontWeight: "bold" }}
              >
                {product.stock > 0 ? "Agregar al carrito" : "Agotado"}
              </Button>
              <Button variant="outlined" size="large" component={Link} to="/">
                Volver a la tienda
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Relacionados */}
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
                    "&:hover": { boxShadow: 6 },
                  }}
                >
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
                      cursor: "pointer",
                    }}
                    onClick={() => setModalProduct(rel)}
                  />
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
                    S/ {Number(rel.price || 0).toFixed(2)}
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
                      bgcolor: "#f5f5f5",
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {modalProduct.description}
                  </Typography>
                  <Typography variant="h5" color="primary" fontWeight="bold" sx={{ mb: 1 }}>
                    S/ {Number(modalProduct.price || 0).toFixed(2)}
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
