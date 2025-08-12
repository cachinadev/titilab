// src/components/CartIcon.js
import React, { useContext, useEffect, useState } from "react";
import { CartContext } from "../context/CartContext";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Badge, IconButton } from "@mui/material";
import { Link } from "react-router-dom";

function CartIcon() {
  const { getTotalItems } = useContext(CartContext);
  const totalItems = getTotalItems();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (totalItems > 0) {
      setAnimate(true);
      const t = setTimeout(() => setAnimate(false), 450);
      return () => clearTimeout(t);
    }
  }, [totalItems]);

  return (
    <>
      <IconButton
        component={Link}
        to="/cart"
        color="inherit"
        aria-label={`Carrito (${totalItems})`}
        sx={{
          position: "relative",
          animation: animate ? "bounce 0.45s ease" : "none",
        }}
      >
        <Badge
          badgeContent={totalItems}
          color="secondary"
          overlap="circular"
          invisible={totalItems === 0}
          sx={{
            "& .MuiBadge-badge": {
              fontSize: "0.75rem",
              height: 18,
              minWidth: 18,
            },
          }}
        >
          <ShoppingCartIcon fontSize="large" />
        </Badge>
      </IconButton>

      {/* Animación */}
      <style>
        {`
          @keyframes bounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.25); }
          }
        `}
      </style>
    </>
  );
}

export default CartIcon;
