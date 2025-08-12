// src/pages/Category.js
import React, { useEffect, useState, useContext, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Container, Typography, Grid, Card, CardMedia, CardContent, CardActions,
  Button, CircularProgress, Snackbar, Alert
} from "@mui/material";
import { CartContext } from "../context/CartContext";
import { getImageUrl } from "../utils/imageUtils";
import { apiFetch } from "../utils/api";

function Category() {
  const { categoryName = "" } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const { addToCart } = useContext(CartContext);

  // normaliza y mapea aliases (domotica → Domótica, iot → IoT)
  const normalized = useMemo(
    () => categoryName.toLowerCase().trim(),
    [categoryName]
  );

  const targetCategories = useMemo(() => {
    const map = {
      domotica: ["Domótica"],
      iot: ["IoT"],
    };
    // por defecto, busca coincidencia exacta con la categoría original
    return map[normalized] || [categoryName];
  }, [normalized, categoryName]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const res = await apiFetch("/products");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const filtered = (Array.isArray(data) ? data : [])
          .filter((p) => {
            const cat = p?.category?.toLowerCase().trim();
            return cat && targetCategories.some(
              (t) => t.toLowerCase().trim() === cat
            );
          })
          .map((p) => ({
            ...p,
            _id: p._id ?? p.id,
            image: getImageUrl(p.image),
          }));

        if (active) setProducts(filtered);
      } catch (err) {
        console.error("Error al obtener productos:", err);
        if (active) setProducts([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [targetCategories]); // ✅ incluimos la dependencia

  const handleAddToCart = (product) => {
    addToCart(product);
    setSnackbar({ open: true, message: `${product.name} agregado al carrito 🛒` });
  };

  if (loading) {
    return (
      <Container sx={{ textAlign: "center", mt: 10 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Cargando productos de {categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}...
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
        Bienvenido a la sección de {categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}.
      </Typography>

      <Grid container spacing={3}>
        {products.length > 0 ? (
          products.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
              <Card sx={{ height: 400, display: "flex", flexDirection: "column", justifyContent: "space-between",
                          transition: "transform 0.2s ease, box-shadow 0.2s ease",
                          "&:hover": { transform: "scale(1.03)", boxShadow: 6 }}}>
                <Link to={`/producto/${product._id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <CardMedia component="img" height="200" image={product.image} alt={product.name}
                             sx={{ objectFit: "contain", bgcolor: "#f5f5f5", borderBottom: "1px solid #ddd" }}/>
                </Link>
                <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <Typography variant="subtitle1" fontWeight="bold" noWrap
                              component={Link} to={`/producto/${product._id}`} style={{ textDecoration: "none", color: "inherit" }}>
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{
                    mb: 1, minHeight: 40, overflow: "hidden", textOverflow: "ellipsis",
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical"
                  }}>
                    {product.description}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    S/ {Number(product.price || 0).toFixed(2)}
                  </Typography>
                </CardContent>
                <CardActions sx={{ mt: "auto" }}>
                  <Button variant="contained" size="small" fullWidth onClick={() => handleAddToCart(product)}>
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
