export const getCartKey = (userOrId) => {
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
};

export const cartTotal = (cart) =>
  (cart || []).reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1), 0);
