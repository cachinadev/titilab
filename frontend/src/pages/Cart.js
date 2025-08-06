// src/pages/Cart.js
import React, { useContext, useMemo } from "react";
import {
  Container,
  Typography,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Button,
  Box,
  Divider
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";

function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useContext(CartContext);

  const currencyFormat = (value) =>
    new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 2
    }).format(value);

  // 📌 Calcular total automáticamente con useMemo
  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  // 📌 Cambiar cantidad (positivo o negativo)
  const changeQuantity = (product, delta) => {
    const newQty = product.quantity + delta;
    if (newQty <= 0) {
      removeFromCart(product.cartId);
    } else {
      updateQuantity(product.cartId, newQty);
    }
  };

  return (
    <Container sx={{ mt: 4, mb: 6 }}>
      {/* Título */}
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontWeight: "bold",
          color: "#333",
          display: "flex",
          alignItems: "center"
        }}
      >
        <ShoppingCartIcon sx={{ mr: 1, fontSize: 32, color: "#1976d2" }} />
        Carrito de Compras
      </Typography>

      {/* Carrito vacío */}
      {cart.length === 0 ? (
        <Typography variant="h6" sx={{ color: "#777", mt: 3 }}>
          🛒 Tu carrito está vacío.{" "}
          <Link to="/" style={{ textDecoration: "none", color: "#1976d2", fontWeight: "bold" }}>
            Ir a la tienda
          </Link>
        </Typography>
      ) : (
        <>
          {/* Lista de productos */}
          {cart.map((item) => (
            <Card
              key={item.cartId}
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 2,
                boxShadow: 3,
                borderRadius: 2,
                transition: "0.2s",
                "&:hover": { boxShadow: 6 }
              }}
            >
              {/* Imagen */}
              <CardMedia
                component="img"
                sx={{
                  width: 140,
                  height: 140,
                  objectFit: "contain",
                  backgroundColor: "#f9f9f9",
                  borderRight: "1px solid #eee"
                }}
                image={item.image}
                alt={item.name}
              />

              {/* Detalles */}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  {item.name}
                </Typography>

                <Typography
                  variant="body1"
                  sx={{ color: "#1976d2", fontWeight: "bold", mt: 0.5 }}
                >
                  {currencyFormat(item.price)}
                </Typography>

                {/* Controles de cantidad */}
                <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                  <Typography variant="body2" sx={{ mr: 1, fontWeight: "bold" }}>
                    Cantidad:
                  </Typography>
                  <IconButton
                    onClick={() => changeQuantity(item, -1)}
                    size="small"
                    sx={{
                      backgroundColor: "#eee",
                      "&:hover": { backgroundColor: "#ddd" }
                    }}
                  >
                    <RemoveIcon />
                  </IconButton>
                  <Typography
                    variant="body1"
                    sx={{
                      mx: 1,
                      minWidth: "24px",
                      textAlign: "center"
                    }}
                  >
                    {item.quantity}
                  </Typography>
                  <IconButton
                    onClick={() => changeQuantity(item, 1)}
                    size="small"
                    sx={{
                      backgroundColor: "#eee",
                      "&:hover": { backgroundColor: "#ddd" }
                    }}
                  >
                    <AddIcon />
                  </IconButton>

                  {/* Botón eliminar */}
                  <IconButton
                    onClick={() => removeFromCart(item.cartId)}
                    color="error"
                    sx={{ ml: 2 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}

          <Divider sx={{ my: 3 }} />

          {/* Total y acciones */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
              alignItems: "center",
              backgroundColor: "#f5f5f5",
              padding: "16px",
              borderRadius: 2,
              boxShadow: 2
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Total: {currencyFormat(total)}
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="outlined"
                color="error"
                onClick={clearCart}
                sx={{
                  padding: "10px 20px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  borderRadius: "8px"
                }}
              >
                Vaciar carrito
              </Button>
              <Button
                variant="contained"
                color="primary"
                size="large"
                component={Link}
                to="/checkout"
                sx={{
                  padding: "10px 20px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  borderRadius: "8px"
                }}
              >
                Proceder al pago
              </Button>
            </Box>
          </Box>
        </>
      )}
    </Container>
  );
}

export default Cart;
