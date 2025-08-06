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
  CardMedia
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

// ✅ Correct backend env variable
const backendUrl =
  process.env.REACT_APP_BACKEND_URL || "http://192.168.18.31:4000";
const apiBase = `${backendUrl}/api`;

// ✅ Normalize image URL
const getImageUrl = (path) => {
  if (!path) return "/placeholder.png";
  if (path.startsWith("http")) return path;
  return path.startsWith("/") ? path : `/${path}`;
};

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
    image: null
  });

  const categoryOptions = [
    "Robótica",
    "Impresión 3D",
    "Minería",
    "Pesquería",
    "Ganadería",
    "Construcción",
    "Militar",
    "Microcontroladores",
    "Arduino",
    "ESP32",
    "Raspberry",
    "Sensores",
    "Componentes",
    "Cursos"
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
    const token = localStorage.getItem("token");
    const res = await fetch(`${apiBase}/products`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setProducts(
        data.map((p) => ({
          ...p,
          image: getImageUrl(p.image)
        }))
      );
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${apiBase}/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) setOrders(await res.json());
  }, []);

  useEffect(() => {
    if (validateToken()) {
      fetchProducts();
      fetchOrders();
    }
  }, [validateToken, fetchProducts, fetchOrders]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files.length > 0) {
      const file = files[0];
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    Object.keys(formData).forEach((key) => {
      form.append(key, formData[key]);
    });

    const token = localStorage.getItem("token");
    const res = await fetch(`${apiBase}/products`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form
    });

    if (res.ok) {
      alert("✅ Producto agregado");
      setFormData({
        name: "",
        description: "",
        category: "",
        price: "",
        stock: "",
        image: null
      });
      setImagePreview(null);
      fetchProducts();
    } else {
      alert("❌ Error al agregar producto");
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("¿Eliminar producto?")) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`${apiBase}/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      alert("🗑️ Producto eliminado");
      setProducts(products.filter((p) => p._id !== id));
    }
  };

  const updateOrderStatus = async (id, status) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${apiBase}/orders/${id}/status`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status })
    });

    if (res.ok) {
      if (status === "completado") {
        const order = orders.find((o) => o.id === id);
        if (order) {
          for (const item of order.cart) {
            await fetch(`${apiBase}/products/${item._id}/stock`, {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ quantity: item.quantity })
            });
          }
          alert("📉 Stock actualizado según el pedido completado");
        }
      }
      fetchOrders();
      fetchProducts();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/admin-login";
  };

  const filterOrders = (estado) =>
    orders.filter((o) => (o.status || "pendiente") === estado);

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
          <ListItem key={product._id}>
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
              <IconButton edge="end" color="error" onClick={() => deleteProduct(product._id)}>
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 4 }} />

      {/* === LISTA PEDIDOS === */}
      {["pendiente", "enviado", "completado"].map((estado) => (
        <div key={estado}>
          <Typography variant="h5" sx={{ mt: 3 }}>
            {estado === "pendiente" && "📌 Pendientes"}
            {estado === "enviado" && "📦 Enviados"}
            {estado === "completado" && "✅ Completados"}
          </Typography>
          <List>
            {filterOrders(estado).map((order) => (
              <ListItem key={order.id} alignItems="flex-start">
                <ListItemText
                  primary={`Pedido #${order.id} - ${order.nombre} (${order.email})`}
                  secondary={
                    <>
                      Dirección: {order.direccion} - Tel: {order.telefono}
                      <br />
                      Total: S/. {order.total}
                      <br />
                      Productos:{" "}
                      {order.cart
                        .map((item) => `${item.name} (x${item.quantity})`)
                        .join(", ")}
                    </>
                  }
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={order.status || "pendiente"}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                  >
                    <MenuItem value="pendiente">Pendiente</MenuItem>
                    <MenuItem value="enviado">Enviado</MenuItem>
                    <MenuItem value="completado">Completado</MenuItem>
                  </Select>
                </FormControl>
              </ListItem>
            ))}
          </List>
        </div>
      ))}
    </Container>
  );
}

export default Admin;
