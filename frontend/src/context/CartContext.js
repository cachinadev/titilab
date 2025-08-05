import React, { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const storedCart = localStorage.getItem("cart");
    return storedCart ? JSON.parse(storedCart) : [];
  });

  // Guardar en localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // ✅ Añadir producto como entrada única con cartId
  const addToCart = (product) => {
    setCart((prevCart) => [
      ...prevCart,
      { ...product, quantity: 1, cartId: Date.now() + Math.random() }
    ]);
  };

  // ✅ Eliminar usando cartId
  const removeFromCart = (cartId) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartId !== cartId));
  };

  // ✅ Actualizar cantidad usando cartId
  const updateQuantity = (cartId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(cartId);
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.cartId === cartId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  // Vaciar carrito
  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
