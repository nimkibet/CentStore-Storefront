import React, { useState, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import useEmblaCarousel from 'embla-carousel-react'
import {
  Smartphone,
  Laptop,
  Headphones,
  Watch,
  Cable,
  Globe,
  ShoppingCart,
  Flame,
  Sparkles,
  BadgePercent,
  ChevronLeft,
  ChevronRight,
  Heart,
  Star,
  Check
} from 'lucide-react'
import { categories } from '../data/mockCentstore.js'

// --- REBRANDING CONFIGURATION ---
const THEME = {
  name: "Cent Stores",
  brandText: "CENT STORES",
  tagline: "✨ Premium iPhones, Samsung, Redmi, OnePlus & Elite Electronics",
  accentColor: "bg-blue-600 text-blue-500 hover:bg-blue-700",
  primaryHex: "#0095f6",
  cartBadgeBg: "bg-blue-600",
  domain: "Centstores.co.ke",
  currency: "KSh",
  whatsappNumber: "254101125353",
  whatsappBackup: "254736409703"
}

// Icon mapper for categories
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Smartphone,
  Laptop,
  Headphones,
  Watch,
  Cable,
  Globe,
  ShoppingCart,
  Flame,
  Sparkles,
  BadgePercent
}

const HERO_SLIDES = [
  {
    id: 1,
    title: "Next-Gen Apple iPhone 17 Series",
    subtitle: "Physical SIM & eSIM Only editions now in stock. Experience the future of mobile technology today.",
    tag: "NOW IN STOCK",
    badge: "KSh 112,000 Key Starting",
    imageUrl: "/products/iphone17.jpg",
    buttonText: "Browse iPhones"
  },
  {
    id: 2,
    title: "OnePlus & Redmi Flagships",
    subtitle: "Supercharged performance with OnePlus 15 5G and Redmi Note 15 Pro. Smooth rates at unbeatable value.",
    tag: "REDMI / ONEPLUS SPECIAL",
    badge: "KSh 16,000 Key Starting",
    imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=1200&auto=format&fit=crop&q=80",
    buttonText: "View Price Lists"
  },
  {
    id: 3,
    title: "Samsung Galaxy AI Innovations",
    subtitle: "Galaxy S24 Ultra, Z Fold 6, and Z Flip 6. Reshape your reality with next-level mobile intelligence.",
    tag: "GALAXY SHOWCASE",
    badge: "UP TO 15% OFF",
    imageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=1200&auto=format&fit=crop&q=80",
    buttonText: "Explore Galaxy Devices"
  }
]

export interface Product {
  id: number
  title: string
  price: number
  originalPrice: number
  discountPercentage: number
  rating: number
  imageUrl: string
  brand: string
  category: string
  storage: string
  note: string
  isFlashSale: boolean
}

export interface CartItem {
  id: number
  title: string
  price: number
  quantity: number
  imageUrl: string
  storage?: string
  brand: string
}

// Helper to resolve product and slide images
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

// Renders a sleek fallback if product image fails to load
export function ProductImage({ src, alt, brand, category }: { src: string; alt: string; brand: string; category: string }) {
  const [hasError, setHasError] = useState(false)
  const resolvedSrc = getImageUrl(src)

  if (hasError || !src) {
    let gradient = "from-blue-900/60 to-slate-900"
    if (brand.toLowerCase() === 'apple') gradient = "from-slate-700/60 to-slate-950"
    if (brand.toLowerCase() === 'samsung') gradient = "from-cyan-900/60 to-slate-950"
    if (brand.toLowerCase() === 'oneplus') gradient = "from-red-950/60 to-slate-950"

    return (
      <div className={`w-full h-full bg-gradient-to-br ${gradient} flex flex-col items-center justify-center p-4 text-center select-none relative group`}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(8,102,255,0.15),transparent_70%)]"></div>
        {category.includes('Laptops') ? (
          <Laptop className="w-12 h-12 text-slate-600 mb-2 group-hover:scale-110 transition-transform" />
        ) : category.includes('Wearables') ? (
          <Watch className="w-12 h-12 text-teal-400 mb-2 group-hover:scale-110 transition-transform" />
        ) : category.includes('Accessories') ? (
          <Cable className="w-12 h-12 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
        ) : (
          <Smartphone className="w-12 h-12 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
        )}
        <span className="text-[10px] uppercase tracking-widest font-black text-slate-600">{brand}</span>
        <span className="text-[9px] text-slate-500 font-semibold truncate max-w-full px-2 mt-1">{alt}</span>
      </div>
    )
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      onError={() => setHasError(true)}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
    />
  )
}

export interface HomeCatalogProps {
  products: Product[]
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  searchQuery: string
  likedProducts: number[]
  toggleLike: (id: number, productName: string) => void
  cart: CartItem[]
  addToCart: (product: any) => void
  settings?: {
    usdToKesRate?: number
    overlayOpacity?: number
    sectionHeight?: number
    heroSlides?: Array<{
      id: number
      title: string
      subtitle: string
      imageUrl: string
      tag: string
      buttonText: string
      badge?: string
    }>
  }
  showToast: (message: string) => void
}

export default function HomeCatalog({
  products,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  likedProducts,
  toggleLike,
  cart,
  addToCart,
  settings,
  showToast
}: HomeCatalogProps) {
  // Carousel hooks
  const [heroRef, heroApi] = useEmblaCarousel({ loop: true, duration: 30 })
  const [currentSlide, setCurrentSlide] = useState(0)
  const [flashRef] = useEmblaCarousel({ loop: false, align: 'start', slidesToScroll: 1 })

  // Auto scroll Hero banner logic
  const onSelectHero = useCallback(() => {
    if (!heroApi) return
    setCurrentSlide(heroApi.selectedScrollSnap())
  }, [heroApi])

  useEffect(() => {
    if (!heroApi) return
    onSelectHero()
    heroApi.on('select', onSelectHero)
    return () => {
      heroApi.off('select', onSelectHero)
    }
  }, [heroApi, onSelectHero])

  useEffect(() => {
    if (!heroApi) return
    const intervalId = setInterval(() => {
      heroApi.scrollNext()
    }, 6000)
    return () => clearInterval(intervalId)
  }, [heroApi])

  const scrollHeroPrev = useCallback(() => heroApi && heroApi.scrollPrev(), [heroApi])
  const scrollHeroNext = useCallback(() => heroApi && heroApi.scrollNext(), [heroApi])

  // Filters application
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.brand.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Flash Sale products filter
  const flashSaleProducts = products.filter(p => p.isFlashSale)

  return (
    <>
      {/* SCREEN LAYOUT: HIGH-END CINEMATIC HERO AREA */}
      <section className="grid lg:grid-cols-12 gap-4">
        
        {/* Left Category Selector Menu */}
        <aside className="lg:col-span-3 bg-white/90 border border-slate-200/80 rounded-xl p-2.5 hidden lg:flex flex-col justify-between max-h-[384px] shadow-sm">
          <div className="space-y-0.5 overflow-y-auto">
            <button 
              onClick={() => setSelectedCategory('All')}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-xs rounded-lg transition-all group ${
                selectedCategory === 'All' 
                  ? 'bg-blue-500/10 text-blue-650 font-bold border-l-2 border-blue-500' 
                  : 'hover:bg-slate-50 text-slate-600 hover:text-blue-600'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-blue-500" />
                <span>Show All Inventory</span>
              </div>
            </button>
            {categories.map((category) => {
              const IconComponent = ICON_MAP[category.icon] || Smartphone
              return (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-xs rounded-lg transition-all group ${
                    selectedCategory === category.name 
                      ? 'bg-blue-500/10 text-blue-650 font-bold border-l-2 border-blue-500' 
                      : 'hover:bg-slate-50 text-slate-600 hover:text-blue-600'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <IconComponent className={`w-4 h-4 ${selectedCategory === category.name ? 'text-blue-500' : 'text-slate-500 group-hover:text-blue-600'}`} />
                    <span>{category.name}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              )
            })}
          </div>
        </aside>

        {/* Center Carousel Slider */}
        {(() => {
          const activeSlides = settings?.heroSlides && settings.heroSlides.length > 0 ? settings.heroSlides : HERO_SLIDES;
          const dynamicHeight = settings?.sectionHeight || 368;
          const dynamicOpacity = (settings?.overlayOpacity !== undefined ? settings.overlayOpacity : 40) / 100;
          
          return (
            <div 
              className="lg:col-span-6 bg-white/90 border border-slate-200/80 rounded-xl p-2 overflow-hidden relative group shadow-sm transition-all"
              style={{ height: `${dynamicHeight + 16}px` }}
            >
              <div className="w-full h-full overflow-hidden rounded-lg" ref={heroRef}>
                <div className="flex w-full h-full">
                  {activeSlides.map((slide) => (
                    <div key={slide.id} className="flex-[0_0_100%] min-w-0 h-full relative" style={{ height: `${dynamicHeight}px` }}>
                      <img src={getImageUrl(slide.imageUrl)} alt={slide.title} className="w-full object-cover" style={{ height: `${dynamicHeight}px` }} />
                      <div className="absolute inset-0 bg-slate-950 transition-all" style={{ opacity: dynamicOpacity }}></div>
                      
                      <div className="absolute left-8 sm:left-12 bottom-12 right-12 z-10 max-w-md text-slate-100 space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-300">
                        <span className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md">
                          {slide.tag}
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black leading-tight drop-shadow-md text-white">
                          {slide.title}
                        </h2>
                        <p className="text-xs text-slate-300 drop-shadow-sm font-light leading-relaxed">
                          {slide.subtitle}
                        </p>
                        
                        <div className="pt-2 flex items-center gap-4">
                          <button 
                            onClick={() => setSelectedCategory('All')}
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase rounded-lg shadow-lg shadow-blue-500/20 transition-all"
                          >
                            {slide.buttonText}
                          </button>
                          {slide.badge && <span className="text-xs font-semibold text-blue-400">{slide.badge}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Arrows */}
              <button
                onClick={scrollHeroPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/40 hover:bg-slate-950/65 text-slate-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={scrollHeroNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/40 hover:bg-slate-950/65 text-slate-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>

              {/* Pagination Bullet indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {activeSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => heroApi && heroApi.scrollTo(idx)}
                    className={`h-2.5 rounded-full transition-all ${
                      currentSlide === idx ? 'w-6 bg-blue-500' : 'w-2.5 bg-white/60 hover:bg-white'
                    }`}
                  />
                ))}
              </div>
            </div>
          );
        })()}

        {/* Right Static Trust widgets */}
        <aside className="lg:col-span-3 flex flex-col gap-4 max-h-[384px]">
          <div className="flex-1 bg-white/90 border border-slate-200/80 rounded-xl p-4 flex gap-4 items-center hover:shadow-md transition-shadow relative overflow-hidden group shadow-sm">
            <div className="absolute top-0 right-0 w-24 h-full bg-blue-500/5 -skew-x-12 translate-x-4"></div>
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600">
              <Globe className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Direct Imports</h4>
              <p className="text-[10px] text-slate-500 mt-1 leading-normal">Sealed global stock with valid local custom clearance certificates.</p>
            </div>
          </div>

          <div className="flex-1 bg-white/90 border border-slate-200/80 rounded-xl p-4 flex gap-4 items-center hover:shadow-md transition-shadow relative overflow-hidden group shadow-sm">
            <div className="absolute top-0 right-0 w-24 h-full bg-emerald-500/5 -skew-x-12 translate-x-4"></div>
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600">
              <Heart className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Warranty Cover</h4>
              <p className="text-[10px] text-slate-500 mt-1 leading-normal">Up to 24 months manufacturer guarantees honored directly on-site.</p>
            </div>
          </div>
        </aside>
      </section>

      {/* QUICK LINK CATEGORY TABS */}
      <section className="bg-slate-100/50 border border-slate-200/80 rounded-xl p-3 flex gap-2 overflow-x-auto scrollbar-none shadow-sm">
        <button 
          onClick={() => setSelectedCategory('All')}
          className={`px-4 py-2 text-xs font-bold rounded-lg border whitespace-nowrap transition-all ${selectedCategory === 'All' ? 'bg-blue-600 border-blue-500 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-800'}`}
        >
          All Showcase Items ({products.length})
        </button>
        {categories.map((c) => {
          const count = products.filter(p => p.category === c.name).length
          return (
            <button
              key={c.name}
              onClick={() => setSelectedCategory(c.name)}
              className={`px-4 py-2 text-xs font-bold rounded-lg border whitespace-nowrap transition-all ${selectedCategory === c.name ? 'bg-blue-600 border-blue-500 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-800'}`}
            >
              {c.name} ({count})
            </button>
          )
        })}
      </section>

      {/* EXCLUSIVE FLASH SALES TIMER BLOCK */}
      {flashSaleProducts.length > 0 && (
        <section className="bg-orange-500/5 border border-orange-500/15 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-orange-600 to-amber-600 px-4 py-3 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 animate-pulse text-amber-200" />
              <span className="font-extrabold text-xs uppercase tracking-wider text-white">Active Flash Sales (Sanlam House Promos)</span>
            </div>
            
            <div className="flex items-center gap-1 font-mono text-xs font-extrabold bg-black/30 px-3 py-1 rounded border border-white/10 text-white">
              <span className="text-amber-200">03</span>
              <span>:</span>
              <span>42</span>
              <span>:</span>
              <span className="text-orange-400">19</span>
            </div>
          </div>

          <div className="p-4 overflow-hidden" ref={flashRef}>
            <div className="flex gap-4">
              {flashSaleProducts.map((product) => {
                const isLiked = likedProducts.includes(product.id)
                const isInCart = cart.some(item => item.id === product.id)
                return (
                  <div
                    key={product.id}
                    className="flex-[0_0_190px] sm:flex-[0_0_210px] min-w-0 bg-white border border-slate-200 rounded-xl p-3 hover:border-blue-500/40 hover:bg-slate-50/50 hover:shadow-md transition-all group relative flex flex-col justify-between shadow-sm"
                  >
                    <span className="absolute top-2 left-2 z-10 px-1.5 py-0.5 text-[9px] font-black bg-blue-500/10 border border-blue-500/30 text-blue-600 rounded-md">
                      {product.note || "Save Deal"}
                    </span>

                    <button
                      onClick={() => toggleLike(product.id, product.title)}
                      className={`absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white border border-slate-200 hover:border-slate-300 transition-colors shadow-sm ${
                        isLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-400'
                      }`}
                    >
                      <Heart className="w-3.5 h-3.5 fill-current" style={{ fillOpacity: isLiked ? 1 : 0 }} />
                    </button>

                    <Link to={`/product/${product.id}`} className="w-full h-32 sm:h-36 rounded-md overflow-hidden bg-slate-50 mb-3 flex items-center justify-center relative border border-slate-100/60 cursor-pointer">
                      <ProductImage src={product.imageUrl} alt={product.title} brand={product.brand} category={product.category} />
                    </Link>

                    <div className="space-y-1.5 flex-grow flex flex-col justify-between">
                      <Link to={`/product/${product.id}`} className="cursor-pointer block">
                        <p className="text-[10px] text-blue-600 font-bold uppercase">{product.brand} • {product.storage}</p>
                        <h4 className="text-xs font-semibold text-slate-800 line-clamp-2 leading-relaxed min-h-[32px] group-hover:text-blue-500 transition-colors">{product.title}</h4>
                      </Link>

                      <div>
                        <div className="flex flex-col pt-1">
                          <span className="text-sm font-black text-slate-900">{THEME.currency} {product.price.toLocaleString()}</span>
                          <span className="text-[10px] text-slate-400 line-through">{THEME.currency} {product.originalPrice.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => addToCart(product)}
                      className={`w-full mt-3 py-1.5 font-bold text-xs rounded-lg transition-all uppercase flex items-center justify-center gap-1 ${
                        isInCart 
                          ? 'bg-blue-600/20 text-blue-600 border border-blue-500/20' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                      }`}
                    >
                      {isInCart && <Check className="w-3.5 h-3.5" />}
                      {isInCart ? 'In Cart' : 'Add to Cart'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* GENERAL SHOWROOM LAYOUT */}
      <section className="space-y-4">
        <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-600">
          {selectedCategory === 'All' ? 'Active Showroom Inventory' : `Showroom: ${selectedCategory}`}
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredProducts.map((product) => {
            const isLiked = likedProducts.includes(product.id)
            const isInCart = cart.some(item => item.id === product.id)
            return (
              <div
                key={product.id}
                className="bg-white border border-slate-200 rounded-xl p-3 hover:border-blue-500/40 hover:bg-slate-50/50 hover:shadow-md transition-all group relative flex flex-col justify-between shadow-sm"
              >
                <span className="absolute top-2 left-2 z-10 px-1.5 py-0.5 text-[9px] font-black bg-blue-500/10 border border-blue-500/30 text-blue-600 rounded-md">
                  {product.note || "Available"}
                </span>

                <button
                  onClick={() => toggleLike(product.id, product.title)}
                  className={`absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white border border-slate-200 hover:border-slate-300 transition-colors shadow-sm ${
                    isLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-400'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5 fill-current" style={{ fillOpacity: isLiked ? 1 : 0 }} />
                </button>

                <Link to={`/product/${product.id}`} className="w-full h-32 sm:h-36 rounded-md overflow-hidden bg-slate-50 mb-3 flex items-center justify-center relative border border-slate-100/60 cursor-pointer">
                  <ProductImage src={product.imageUrl} alt={product.title} brand={product.brand} category={product.category} />
                </Link>

                <div className="space-y-1.5 flex-grow flex flex-col justify-between">
                  <Link to={`/product/${product.id}`} className="cursor-pointer block">
                    <p className="text-[10px] text-blue-600 font-bold uppercase">{product.brand} • {product.storage}</p>
                    <h4 className="text-xs font-semibold text-slate-800 line-clamp-2 leading-relaxed min-h-[32px] group-hover:text-blue-500 transition-colors">{product.title}</h4>
                  </Link>

                  <div>
                    <div className="flex flex-col pt-1.5">
                      <span className="text-sm font-black text-slate-900">{THEME.currency} {product.price.toLocaleString()}</span>
                      {product.originalPrice > product.price && (
                        <span className="text-[10px] text-slate-400 line-through">{THEME.currency} {product.originalPrice.toLocaleString()}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-2">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold">{product.rating}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => addToCart(product)}
                  className={`w-full mt-3 py-2 font-bold text-xs rounded-lg transition-all uppercase flex items-center justify-center gap-1 ${
                    isInCart 
                      ? 'bg-blue-600/20 text-blue-600 border border-blue-500/20' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                  }`}
                >
                  {isInCart && <Check className="w-3.5 h-3.5" />}
                  {isInCart ? 'In Cart' : 'Add to Cart'}
                </button>
              </div>
            )
          })}
        </div>
      </section>

      {/* NEWSLETTER SUBSCRIBE SECTION */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6 shadow-lg">
        <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="space-y-2 text-center md:text-left z-10">
          <span className="text-[10px] bg-blue-500/10 border border-blue-500/30 text-blue-400 font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded">
            Weekly Updates
          </span>
          <h2 className="text-lg sm:text-xl font-black text-slate-100 tracking-tight">Subscribe to our Catalog Newsletter</h2>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed">
            Receive instant flash sale notifications, premium price-drop alerts, and restock bulletins directly in your inbox.
          </p>
        </div>

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            showToast('Thank you for subscribing to Cent Stores updates!');
            const emailInput = e.currentTarget.querySelector('input');
            if (emailInput) emailInput.value = '';
          }}
          className="w-full md:w-auto flex flex-col sm:flex-row gap-2 z-10"
        >
          <input 
            type="email" 
            required
            placeholder="Enter your email address" 
            className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500/50 w-full sm:w-64 min-w-[200px]"
          />
          <button 
            type="submit" 
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer text-center whitespace-nowrap"
          >
            Subscribe
          </button>
        </form>
      </section>

      {/* TRUST LOCATION & VERIFICATION FOOTNOTE */}
      <section className="bg-white border border-slate-200/80 rounded-xl p-6 space-y-4 text-xs text-slate-500 leading-relaxed shadow-sm">
        <h2 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">About {THEME.name} Kenya — Sanlam House Nairobi</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <p>
              Cent Stores Kenya is a premier supplier of premium Apple iPhones, Samsung Galaxy, OnePlus, and Redmi smartphones, computing flagships, and active lifestyle wearables in Nairobi.
            </p>
            <p>
              Visit our physical showroom on <strong>Kenyatta Avenue, Sanlam House, 1st Floor Shop 103</strong> to verify item specifications, diagnose devices, and check active warranty covers before finalizing payments.
            </p>
          </div>
          <div className="space-y-2">
            <p>
              Need to order multiple products? Simply add your items to the shopping cart and trigger "Order on WhatsApp" to generate your custom invoice list directly with our dispatch desk. Same-day countrywide delivery applies.
            </p>
            <p>
              Contact our customer hotlines at <strong>0101125353</strong> or <strong>0736409703</strong> for instant specifications reviews.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
