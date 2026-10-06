export const getActiveUserId = () => {
  try {
    return localStorage.getItem('sayrab_user_id') || 'guest';
  } catch {
    return 'guest';
  }
};

export const getCartKey = (userId) => {
  const id = userId || getActiveUserId();
  return `sayrab_cart_${id}`;
};

export const readCart = (userId) => {
  try {
    const key = getCartKey(userId);
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
};

export const writeCart = (cart, userId) => {
  try {
    const key = getCartKey(userId);
    localStorage.setItem(key, JSON.stringify(cart));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('sayrab_cart_updated', {
          detail: { userId: userId || getActiveUserId(), cart },
        })
      );
    }
  } catch (err) {
    console.error('Failed to write cart:', err);
  }
};

export const clearCart = (userId) => {
  writeCart([], userId);
};

export const addCartItem = (product, quantity = 1, userId) => {
  const cart = readCart(userId);
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

  writeCart(next, userId);
  return next;
};

export const cartTotal = (cart) =>
  (cart || []).reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1), 0);

