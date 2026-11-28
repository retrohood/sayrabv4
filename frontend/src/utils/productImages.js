// Category-accurate high-resolution product imagery mapper for Sayrab Merchandise
// Maps categories and product names to clean, premium fashion-commerce photography

const PRODUCT_IMAGE_SETS = {
  hoodie: [
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=800&q=80',
  ],
  tee: [
    'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=800&q=80',
  ],
  polo: [
    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=800&q=80',
  ],
  mug: [
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=800&q=80',
  ],
  bottle: [
    'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=800&q=80',
  ],
  bag: [
    'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1597484662317-9bd7bdda2907?auto=format&fit=crop&w=800&q=80',
  ],
  stationery: [
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=800&q=80',
  ],
  cap: [
    'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&w=800&q=80',
  ],
  default: [
    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80',
  ],
};

export const getProductImageCategoryKey = (product) => {
  if (!product) return 'default';
  const name = (product.name || '').toLowerCase();
  const category = (product.category || '').toLowerCase();

  // 1. Specific product name matches first
  if (name.includes('cap') || name.includes('hat') || category.includes('headwear')) {
    return 'cap';
  }
  if (name.includes('hoodie') || name.includes('fleece') || name.includes('sweatshirt')) {
    return 'hoodie';
  }
  if (name.includes('tee') || name.includes('t-shirt') || name.includes('tshirt') || name.includes('shirt')) {
    return 'tee';
  }
  if (name.includes('polo') || name.includes('sweater') || name.includes('varsity') || name.includes('knit')) {
    return 'polo';
  }
  if (name.includes('mug') || name.includes('cup') || (category.includes('drinkware') && !name.includes('bottle'))) {
    return 'mug';
  }
  if (name.includes('bottle') || name.includes('flask') || category.includes('bottle')) {
    return 'bottle';
  }
  if (name.includes('bag') || name.includes('tote') || category.includes('bag') || category.includes('backpack')) {
    return 'bag';
  }
  if (name.includes('notebook') || name.includes('diary') || category.includes('stationery') || name.includes('journal')) {
    return 'stationery';
  }

  // 2. Category fallbacks
  if (category.includes('drinkware')) return 'mug';
  if (category.includes('stationery')) return 'stationery';
  if (category.includes('accessories')) return 'cap';

  if (category.includes('apparel') || category.includes('merchandise')) {
    // Variety distribution across apparel items for diverse showcase
    const hash = (product._id || product.name || 'apparel')
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const variants = ['tee', 'hoodie', 'polo', 'cap'];
    return variants[hash % variants.length];
  }

  return 'default';
};

export const getAccurateProductImage = (product) => {
  if (!product) return PRODUCT_IMAGE_SETS.default[0];
  const rawImg = product.image || product.images?.[0] || '';

  // Use raw image only if it's an uploaded asset and not a random picsum seed or generic placeholder
  if (rawImg && !rawImg.includes('picsum.photos') && !rawImg.includes('placeholder')) {
    return rawImg;
  }

  const key = getProductImageCategoryKey(product);
  return PRODUCT_IMAGE_SETS[key][0];
};

export const getAccurateProductImages = (product) => {
  if (!product) return PRODUCT_IMAGE_SETS.default;
  const rawImages = [
    product.image,
    ...(Array.isArray(product.images) ? product.images : []),
  ].filter((img) => Boolean(img) && !img.includes('picsum.photos') && !img.includes('placeholder'));

  if (rawImages.length > 0) {
    return Array.from(new Set(rawImages));
  }

  const key = getProductImageCategoryKey(product);
  return PRODUCT_IMAGE_SETS[key];
};
