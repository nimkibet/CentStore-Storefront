import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Star, ShoppingCart, ShieldCheck, Truck } from 'lucide-react';

interface Product {
  id: number;
  _id?: string;
  title: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  rating: number;
  imageUrl: string;
  brand: string;
  category: string;
  storage: string;
  note: string;
}

export default function ProductDetail({ addToCart }: { addToCart: (p: any) => void }) {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        let res = await fetch(`/api/erp/products/${id}`);
        if (!res.ok) {
           res = await fetch(`/api/products/${id}`);
        }
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        } else {
          setProduct({
            id: Number(id),
            _id: id,
            title: "Premium Flagship Device",
            price: 120000,
            originalPrice: 140000,
            discountPercentage: 14,
            rating: 4.8,
            imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=1200&auto=format&fit=crop&q=80",
            brand: "Premium Brand",
            category: "Smartphones",
            storage: "256GB",
            note: "In Stock"
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/uploads/')) {
      const apiBase = import.meta.env.VITE_API_URL || '';
      const cleanBase = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
      return `${cleanBase}${url}`;
    }
    return url;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Product not found.</div>;

  const resolvedImage = getImageUrl(product.imageUrl);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link to="/" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Catalog
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          
          <div className="w-full lg:w-1/2 space-y-6">
            <div className="aspect-square bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 flex items-center justify-center p-8 relative group">
              <img 
                src={resolvedImage} 
                alt={product.title} 
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
              />
              {product.discountPercentage > 0 && (
                <div className="absolute top-6 left-6 bg-red-600 text-white px-3 py-1 text-xs font-black tracking-wider uppercase rounded-full">
                  -{product.discountPercentage}% OFF
                </div>
              )}
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {[resolvedImage, resolvedImage, resolvedImage].map((src, idx) => (
                <button key={idx} className={`w-20 h-20 rounded-xl border-2 overflow-hidden flex-shrink-0 ${idx === 0 ? 'border-blue-600' : 'border-slate-200 hover:border-blue-300'}`}>
                  <img src={src} alt="Thumbnail" className="w-full h-full object-cover bg-slate-50" />
                </button>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-1/2 flex flex-col justify-center">
            <div className="mb-2">
              <span className="text-xs font-black tracking-widest text-blue-600 uppercase">{product.brand}</span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight mb-4">
              {product.title}
            </h1>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating || 5) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />
                ))}
              </div>
              <span className="text-sm font-medium text-slate-500">
                {product.rating} (128 reviews)
              </span>
            </div>

            <div className="flex items-end gap-4 mb-8 pb-8 border-b border-slate-100">
              <span className="text-4xl lg:text-5xl font-black text-slate-900">
                KSh {product.price.toLocaleString()}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-xl font-semibold text-slate-400 line-through mb-1">
                  KSh {product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            <p className="text-slate-600 leading-relaxed mb-8 text-lg">
              {product.note || "Experience unparalleled performance and premium design. Engineered for excellence with industry-leading features."}
            </p>

            <div className="space-y-6 mb-10">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Storage Capacity</h3>
                <div className="flex flex-wrap gap-3">
                  {['128GB', '256GB', '512GB'].map(size => (
                    <button 
                      key={size}
                      className={`px-6 py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                        (product.storage || '256GB') === size 
                          ? 'border-blue-600 bg-blue-50 text-blue-700' 
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button 
              onClick={() => addToCart(product)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white h-16 rounded-2xl font-black text-lg tracking-wider flex items-center justify-center gap-3 transition-all hover:scale-[1.02] shadow-xl shadow-slate-900/20 active:scale-[0.98]"
            >
              <ShoppingCart className="w-6 h-6" />
              ADD TO CART
            </button>

            <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-slate-100">
              <div className="flex items-center gap-3 text-slate-600">
                <ShieldCheck className="w-6 h-6 text-emerald-500" />
                <span className="text-sm font-semibold">1 Year Warranty</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Truck className="w-6 h-6 text-blue-500" />
                <span className="text-sm font-semibold">Fast Delivery</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
