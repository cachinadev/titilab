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

  // 📌 Normalizar imagen → siempre devolver /uploads/... si existe
  const normalizeImagePath = (image) => {
    if (!image) return "";
    const match = image.match(/(\/uploads\/.*)$/);
    return match ? match[1] : image;
  };

  // 📌 Añadir producto — si existe, aumentar cantidad
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item._id === product._id);

      if (existingItem) {
        return prevCart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...prevCart,
        {
          ...product,
          image: normalizeImagePath(product.image),
          quantity: 1,
          cartId: Date.now() + Math.random()
        }
      ];
    });
  };

  // 📌 Eliminar producto por cartId
  const removeFromCart = (cartId) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartId !== cartId));
  };

  // 📌 Actualizar cantidad
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

  // 📌 Obtener total de items
  const getTotalItems = () =>
    cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
