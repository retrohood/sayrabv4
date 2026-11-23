import { useState, useEffect } from 'react';

export const getCartKey = (userOrId) => {
  if (userOrId === 'guest') {
    return 'sayrab_cart_guest';
  }
  if (typeof userOrId === 'string' && userOrId.trim()) {
    return `sayrab_cart_${userOrId.trim()}`;
  }
  if (userOrId && typeof userOrId === 'object' && userOrId._id) {
    return `sayrab_cart_${userOrId._id}`;
  }
  const currentUserId = typeof localStorage !== 'undefined' ? localStorage.getItem('sayrab_current_user_id') : null;
  if (currentUserId) {
    return `sayrab_cart_${currentUserId}`;
  }
  return 'sayrab_cart_guest';
};

export const notifyCartUpdated = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sayrab:cart-updated'));
  }
};

export const readCart = (userOrId) => {
  try {
    const key = getCartKey(userOrId);
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
};

export const writeCart = (cart, userOrId) => {
  const key = getCartKey(userOrId);
  localStorage.setItem(key, JSON.stringify(cart || []));
  notifyCartUpdated();
};

export const addCartItem = (product, quantity = 1, userOrId) => {
  const cart = readCart(userOrId);
  const existing = cart.find(
    (item) =>
      item._id === product._id &&
      item.selectedSize === product.selectedSize &&
      item.selectedColor === product.selectedColor
  );
  const next = existing
    ? cart.map((item) =>
        item._id === product._id &&
        item.selectedSize === product.selectedSize &&
        item.selectedColor === product.selectedColor
          ? { ...item, qty: item.qty + quantity }
          : item
      )
    : [
        ...cart,
        {
          _id: product._id,
          name: product.name,
          price: product.price,
          image: product.image || product.images?.[0],
          campaignId: product.campaignId || product.campaign,
          qty: quantity,
          selectedSize: product.selectedSize,
          selectedColor: product.selectedColor,
        },
      ];

  writeCart(next, userOrId);
  return next;
};

export const clearCart = (userOrId) => {
  const key = getCartKey(userOrId);
  localStorage.removeItem(key);
  notifyCartUpdated();
};

export const cartTotal = (cart) =>
  (cart || []).reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1), 0);

export const getCartCount = (userOrId) => {
  const cart = readCart(userOrId);
  return (cart || []).reduce((sum, item) => sum + Number(item.qty || 1), 0);
};

export const mergeGuestCart = (userOrId) => {
  if (!userOrId) return;
  const guestCart = readCart('guest');
  if (!guestCart || guestCart.length === 0) return;

  const userCart = readCart(userOrId);
  let merged = [...userCart];

  guestCart.forEach((guestItem) => {
    const existingIndex = merged.findIndex(
      (item) =>
        item._id === guestItem._id &&
        item.selectedSize === guestItem.selectedSize &&
        item.selectedColor === guestItem.selectedColor
    );
    if (existingIndex > -1) {
      merged[existingIndex] = {
        ...merged[existingIndex],
        qty: (merged[existingIndex].qty || 1) + (guestItem.qty || 1),
      };
    } else {
      merged.push({ ...guestItem });
    }
  });

  writeCart(merged, userOrId);
  clearCart('guest');
  notifyCartUpdated();
  return merged;
};

export const useCartCount = (userOrId) => {
  const [count, setCount] = useState(() => getCartCount(userOrId));

  useEffect(() => {
    const updateCount = () => {
      setCount(getCartCount(userOrId));
    };

    updateCount();
    window.addEventListener('sayrab:cart-updated', updateCount);
    window.addEventListener('storage', updateCount);

    return () => {
      window.removeEventListener('sayrab:cart-updated', updateCount);
      window.removeEventListener('storage', updateCount);
    };
  }, [userOrId]);

  return count;
};
