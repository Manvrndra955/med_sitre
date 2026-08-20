import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('medstore_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('medstore_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (medicine, quantity = 1) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.medicineId === medicine._id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        // Cap quantity at available stock
        updated[existingIndex].quantity = Math.min(newQty, medicine.stock);
        return updated;
      } else {
        return [...prev, {
          medicineId: medicine._id,
          title: medicine.title,
          price: medicine.price,
          image: medicine.image,
          stock: medicine.stock,
          quantity: Math.min(quantity, medicine.stock)
        }];
      }
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (medicineId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(medicineId);
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.medicineId === medicineId) {
        return { ...item, quantity: Math.min(quantity, item.stock) };
      }
      return item;
    }));
  };

  const removeFromCart = (medicineId) => {
    setCart(prev => prev.filter(item => item.medicineId !== medicineId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      totalAmount,
      totalItemsCount,
      isCartOpen,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
