// src/components/CartIcon.js
import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Badge, IconButton } from "@mui/material";
import { Link } from "react-router-dom";

function CartIcon() {
  const { getTotalItems } = useContext(CartContext);
  const totalItems = getTotalItems();

  return (
    <IconButton
      component={Link}
      to="/cart"
      color="inherit"
      sx={{ position: "relative" }}
    >
      <Badge
        badgeContent={totalItems}
        color="primary"
        overlap="circular"
        sx={{
          "& .MuiBadge-badge": {
            fontSize: "0.75rem",
            height: "18px",
            minWidth: "18px",
          },
        }}
      >
        <ShoppingCartIcon fontSize="large" />
      </Badge>
    </IconButton>
  );
}

export default CartIcon;
