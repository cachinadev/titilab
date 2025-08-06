// src/context/CartContext.js
import React, { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const storedCart = localStorage.getItem("cart");
      return storedCart ? JSON.parse(storedCart) : [];
    } catch {
      return [];
    }
  });

  // 📌 Guardar carrito en localStorage cada vez que cambie
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // 📌 Añadir producto — si existe, sumar cantidad
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item._id === product._id);

      if (existingItem) {
        // Si existe, sumar cantidad
        return prevCart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      // Si no existe, agregar con cartId único
      return [
        ...prevCart,
        { ...product, quantity: 1, cartId: Date.now() + Math.random() }
      ];
    });
  };

  // 📌 Eliminar producto usando cartId
  const removeFromCart = (cartId) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartId !== cartId));
  };

  // 📌 Actualizar cantidad usando cartId
  const updateQuantity = (cartId, newQuantity) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.cartId === cartId
          ? { ...item, quantity: Math.max(1, newQuantity) }
          : item
      )
    );
  };

  // 📌 Vaciar carrito
  const clearCart = () => {
    setCart([]);
  };

  // 📌 Obtener cantidad total de productos (para el icono del carrito)
  const getTotalItems = () => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems // ✅ para mostrar el número de items en el icono
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
