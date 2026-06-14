import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import api from '../api/client';
import { formatCurrency } from '../utils/format';
import { addCartItem } from '../utils/cart';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    api.get(`/products/item/${id}`).then((res) => setProduct(res.data));
  }, [id]);

  if (!product) {
    return <div className="py-20 text-center text-slate-500">Loading product...</div>;
  }

  const image = product.image || product.images?.[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid gap-8 lg:grid-cols-2">
        <img src={image} alt={product.name} className="w-full rounded-lg border border-slate-200 object-cover aspect-square" />
        <div>
          <p className="text-sm font-semibold text-primary-600">{product.category}</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{product.name}</h1>
          <p className="mt-4 text-slate-600 leading-relaxed">{product.description}</p>
          <p className="mt-6 text-3xl font-bold text-primary-700">{formatCurrency(product.price)}</p>

          {product.sizes?.length > 0 && (
            <p className="mt-4 text-sm text-slate-500">Sizes: {product.sizes.join(', ')}</p>
          )}
          {product.colors?.length > 0 && (
            <p className="mt-2 text-sm text-slate-500">Colors: {product.colors.join(', ')}</p>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                addCartItem(product);
                setAdded(true);
              }}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 text-sm font-semibold text-white hover:bg-primary-700"
            >
              <ShoppingCart className="h-4 w-4" />
              {added ? 'Added to Cart' : 'Add to Cart'}
            </button>
            <Link
              to="/cart"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              View Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
