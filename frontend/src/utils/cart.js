const CART_KEY = 'sayrab_cart';

export const readCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
};

export const writeCart = (cart) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

export const addCartItem = (product, quantity = 1) => {
  const cart = readCart();
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

  writeCart(next);
  return next;
};

export const cartTotal = (cart) =>
  cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1), 0);
