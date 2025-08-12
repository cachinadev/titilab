// src/pages/Admin.js
import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Card,
  CardMedia,
  CardHeader,
  Chip,
  Box
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

import { apiGet, apiPost, apiPut, apiDelete } from "../utils/api";
import { getImageUrl } from "../utils/imageUtils";

function Admin() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    stock: "",
    image: null,
  });

  // ✅ Categorías alineadas con el sitio (incluye Domótica, IoT y Agricultura)
  const categoryOptions = [
    // Productos
    "Microcontroladores",
    "Arduino",
    "ESP32",
    "Raspberry",
    "Sensores",
    "Componentes",
    "Impresión 3D",
    "Robótica",
    "Cursos",
    "Domótica",
    "IoT",
    // Industria
    "Minería",
    "Pesquería",
    "Ganadería",
    "Construcción",
    "Militar",
    "Agricultura",
  ];

  const validateToken = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/admin-login";
      return false;
    }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        window.location.href = "/admin-login";
        return false;
      }
    } catch {
      localStorage.removeItem("token");
      window.location.href = "/admin-login";
      return false;
    }
    return true;
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const data = await apiGet("/products");
      const normalized = (Array.isArray(data) ? data : []).map((p) => {
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
      setProducts(normalized);
    } catch (err) {
      console.error("Error al obtener productos:", err);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await apiGet("/orders");
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al obtener pedidos:", err);
    }
  }, []);

  useEffect(() => {
    if (validateToken()) {
      fetchProducts();
      fetchOrders();
    }
  }, [validateToken, fetchProducts, fetchOrders]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files?.length > 0) {
      const file = files[0];
      setFormData((s) => ({ ...s, image: file }));
      setImagePreview(URL.createObjectURL(file));
    } else {
      setFormData((s) => ({ ...s, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.category || !formData.price || !formData.stock) {
      alert("Completa nombre, categoría, precio y stock.");
      return;
    }

    const form = new FormData();
    Object.entries(formData).forEach(([k, v]) => {
      if (v !== null && v !== undefined) form.append(k, v);
    });

    try {
      await apiPost("/products", form); // auto token + sin forzar Content-Type
      alert("✅ Producto agregado");
      setFormData({
        name: "",
        description: "",
        category: "",
        price: "",
        stock: "",
        image: null,
      });
      setImagePreview(null);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("❌ Error al agregar producto");
    }
  };

  const deleteProduct = async (id) => {
    const realId = id ?? (typeof id === "object" ? id._id ?? id.id : id);
    if (!realId) return alert("ID de producto inválido");
    if (!window.confirm("¿Eliminar producto?")) return;

    try {
      await apiDelete(`/products/${realId}`);
      alert("🗑️ Producto eliminado");
      setProducts((prev) => prev.filter((p) => (p._id ?? p.id) !== realId));
    } catch (err) {
      console.error(err);
      alert("❌ Error al eliminar producto");
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await apiPut(`/orders/${id}/status`, { status });

      if (status === "completado") {
        alert("✅ Pedido completado. El stock se actualizó automáticamente.");
      }

      fetchOrders();
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("❌ No se pudo actualizar el estado del pedido");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/admin-login";
  };

  const filterOrders = (estado) =>
    orders.filter((o) => (o.status || "pendiente") === estado);

  // ---------- UI helpers ----------
  const statusMeta = {
    pendiente: { label: "📌 Pendientes", color: "warning" },
    enviado: { label: "📦 Enviados", color: "info" },
    completado: { label: "✅ Completados", color: "success" },
  };

  const OrderColumn = ({ estado }) => {
    const list = filterOrders(estado);
    const meta = statusMeta[estado];

    return (
      <Card sx={{ borderRadius: 3, boxShadow: 3, height: "100%" }}>
        <CardHeader
          title={meta.label}
          action={<Chip label={list.length} color={meta.color} />}
          sx={{
            "& .MuiCardHeader-title": { fontWeight: "bold" },
            borderBottom: "1px solid",
            borderColor: "divider",
            pb: 1.5,
          }}
        />
        <Box sx={{ p: 0, height: 440, overflowY: "auto" }}>
          {list.length === 0 ? (
            <Box sx={{ p: 2, color: "text.secondary", textAlign: "center" }}>
              No hay pedidos {estado}.
            </Box>
          ) : (
            <List disablePadding>
              {list.map((order, idx) => (
                <React.Fragment key={order.id}>
                  <ListItem alignItems="flex-start" sx={{ px: 2, py: 1.5 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            Pedido #{order.id}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {order.fecha ? new Date(order.fecha).toLocaleString() : ""}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            {order.nombre} — {order.email}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Dirección: {order.direccion} {order.distrito ? `— ${order.distrito}` : ""}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Tel: {order.telefono} · Total: <b>S/ {Number(order.total || 0).toFixed(2)}</b>
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5 }} noWrap title={(order.cart || []).map(i => `${i.name} x${i.quantity}`).join(", ")}>
                            Productos: {(order.cart || []).map((i) => `${i.name} (x${i.quantity})`).join(", ")}
                          </Typography>
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <FormControl size="small" sx={{ minWidth: 140 }}>
                        <Select
                          value={order.status || "pendiente"}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        >
                          <MenuItem value="pendiente">Pendiente</MenuItem>
                          <MenuItem value="enviado">Enviado</MenuItem>
                          <MenuItem value="completado">Completado</MenuItem>
                        </Select>
                      </FormControl>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {idx !== list.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </Card>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        📦 Panel de Administración
      </Typography>
      <Button variant="outlined" color="secondary" onClick={handleLogout} sx={{ mb: 2 }}>
        Cerrar Sesión
      </Button>

      {/* === FORMULARIO PRODUCTOS === */}
      <Card sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          ➕ Agregar Producto
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Form Fields */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Nombre del producto"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                select
                fullWidth
                label="Categoría"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                {categoryOptions.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                fullWidth
                label="Precio (S/.)"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                fullWidth
                label="Stock"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                name="description"
                multiline
                rows={3}
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>
            {/* Image Upload */}
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoCameraIcon />}
                fullWidth
              >
                Subir Imagen
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  hidden
                  onChange={handleChange}
                />
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              {imagePreview && (
                <CardMedia
                  component="img"
                  height="150"
                  image={imagePreview}
                  alt="Vista previa"
                  sx={{ borderRadius: 2 }}
                />
              )}
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<AddIcon />}
                fullWidth
                sx={{ py: 1.5, fontWeight: "bold" }}
              >
                Agregar Producto
              </Button>
            </Grid>
          </Grid>
        </form>
      </Card>

      <Divider sx={{ my: 3 }} />

      {/* === LISTA PRODUCTOS === */}
      <Typography variant="h5" gutterBottom>
        🛒 Lista de Productos
      </Typography>
      <List>
        {products.map((product) => (
          <ListItem key={product._id ?? product.id}>
            <CardMedia
              component="img"
              image={product.image}
              alt={product.name}
              sx={{ width: 60, height: 60, objectFit: "contain", mr: 2, bgcolor: "#f5f5f5" }}
            />
            <ListItemText
              primary={`${product.name} (${product.category})`}
              secondary={`Precio: S/. ${product.price} | Stock: ${product.stock}`}
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                color="error"
                onClick={() => deleteProduct(product._id ?? product.id)}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 4 }} />

      {/* === LISTA PEDIDOS (3 columnas) === */}
      <Typography variant="h5" gutterBottom>
        🧾 Pedidos
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <OrderColumn estado="pendiente" />
        </Grid>
        <Grid item xs={12} md={4}>
          <OrderColumn estado="enviado" />
        </Grid>
        <Grid item xs={12} md={4}>
          <OrderColumn estado="completado" />
        </Grid>
      </Grid>
    </Container>
  );
}

export default Admin;
