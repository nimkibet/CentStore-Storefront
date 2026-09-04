import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ProductDetail from './views/ProductDetail';
import { useState, useCallback, useEffect } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import {
  Search,
  ShoppingCart,
  Heart,
  ChevronLeft,
  ChevronRight,
  Star,
  Sparkles,
  Flame,
  Smartphone,
  Laptop,
  Headphones,
  BadgePercent,
  Menu,
  X,
  Watch,
  Cable,
  Globe,
  Clock,
  PhoneCall,
  Mail,
  Trash2,
  Plus,
  Minus,
  Check,
  Settings,
  User as UserIcon
} from 'lucide-react'

// Import fallback static data in case backend server is offline
import { categories, products as staticProducts } from './data/mockCentstore.js'
import AdminPanel from './AdminPanel'

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

/*
const QUICK_LINKS = [
  { name: "Premium iPhones", icon: Smartphone, bg: "bg-blue-500/10 text-blue-400" },
  { name: "Samsung Galaxy", icon: Smartphone, bg: "bg-cyan-500/10 text-cyan-400" },
  { name: "OnePlus Devices", icon: Smartphone, bg: "bg-indigo-500/10 text-indigo-400" },
  { name: "Redmi Deals", icon: Smartphone, bg: "bg-red-500/10 text-red-400" },
  { name: "MacBooks", icon: Laptop, bg: "bg-slate-500/10 text-slate-700" },
  { name: "Wearables", icon: Watch, bg: "bg-teal-500/10 text-teal-400" },
  { name: "Audio Pods", icon: Headphones, bg: "bg-emerald-500/10 text-emerald-400" },
  { name: "Fast Chargers", icon: Cable, bg: "bg-amber-500/10 text-amber-400" },
  { name: "Trust Stores", icon: BadgePercent, bg: "bg-pink-500/10 text-pink-400" },
  { name: "Shop Location", icon: Globe, bg: "bg-sky-500/10 text-sky-400" }
]
*/

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

interface Product {
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

interface CartItem {
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
  return url; // Relative to frontend root
};

// --- PREMIUM IMAGE FALLBACK COMPONENT ---
// Renders a high-end glassmorphic gradient placeholder if the product image is missing or fails to load
function ProductImage({ src, alt, brand, category }: { src: string; alt: string; brand: string; category: string }) {
  const [hasError, setHasError] = useState(false)
  const resolvedSrc = getImageUrl(src)

  if (hasError || !src) {
    // Generate custom sleek backgrounds based on category/brand
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

function App() {
  // Carousel hooks
  const [heroRef, heroApi] = useEmblaCarousel({ loop: true, duration: 30 })
  const [currentSlide, setCurrentSlide] = useState(0)
  const [flashRef] = useEmblaCarousel({ loop: false, align: 'start', slidesToScroll: 1 })


  // Routing Views & Authentication State
  const [currentUser, setCurrentUser] = useState<{ email: string; role: 'admin' | 'user'; name: string; password?: string } | null>(() => {
    try {
      const saved = localStorage.getItem('centstore_current_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // Database Products state
  const [dbProducts, setDbProducts] = useState<Product[]>([])
  
  // Shopping Cart & App State
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const savedUser = localStorage.getItem('centstore_current_user')
      const user = savedUser ? JSON.parse(savedUser) : null
      const key = user ? `centstore_cart_${user.email}` : 'centstore_cart'
      const saved = localStorage.getItem(key)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [likedProducts, setLikedProducts] = useState<number[]>(() => {
    try {
      const savedUser = localStorage.getItem('centstore_current_user')
      const user = savedUser ? JSON.parse(savedUser) : null
      const key = user ? `centstore_wishlist_${user.email}` : 'centstore_wishlist'
      const saved = localStorage.getItem(key)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [isWishlistOpen, setIsWishlistOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  // const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [currentView, setCurrentView] = useState<'showroom' | 'login' | 'admin' | 'signup' | 'otp-verify'>('showroom')
  const [users, setUsers] = useState<{ email: string; role: 'admin' | 'user'; name: string; password?: string }[]>([
    { email: 'admin@centstores.co.ke', role: 'admin', name: 'Executive Admin', password: 'admin123' },
    { email: 'user@centstores.co.ke', role: 'user', name: 'Premium Client', password: 'user123' },
    { email: 'agent@centstores.co.ke', role: 'user', name: 'Sales Agent', password: 'agent123' }
  ])
  
  // Login input states
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)

  // Signup and OTP input states
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupOtp, setSignupOtp] = useState('')
  const [otpVerifyEmail, setOtpVerifyEmail] = useState('')
  const [isPromoPopupOpen, setIsPromoPopupOpen] = useState(false)

  // Unused old admin states removed
  const [settings, setSettings] = useState<{
    usdToKesRate: number
    overlayOpacity: number
    sectionHeight: number
    heroSlides: Array<{
      id: number
      title: string
      subtitle: string
      imageUrl: string
      tag: string
      buttonText: string
      badge?: string
    }>
  }>({
    usdToKesRate: 130,
    overlayOpacity: 40,
    sectionHeight: 368,
    heroSlides: []
  })

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      if (res.ok) {
        const data = await res.json()
        setSettings({
          usdToKesRate: Number(data.usdToKesRate) || 130,
          overlayOpacity: data.overlayOpacity !== undefined ? Number(data.overlayOpacity) : 40,
          sectionHeight: Number(data.sectionHeight) || 368,
          heroSlides: data.heroSlides || []
        })
      }
    } catch (err) {
      console.warn("Could not fetch settings from backend. Using static fallbacks.")
    }
  }

  // Fetch products from Express backend API
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      if (res.ok) {
        const data = await res.json()
        setDbProducts(data)
      } else {
        // Fallback to static inventory
        setDbProducts(staticProducts as Product[])
      }
    } catch (err) {
      console.warn("Backend server not running. Using fallback static database.")
      setDbProducts(staticProducts as Product[])
    }
  }

  // Fetch users from Express backend API
  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users')
      if (res.ok) {
        const data = await res.json()
        if (data && data.length > 0) {
          setUsers(data)
        }
      }
    } catch (err) {
      console.warn("Could not fetch users from database.")
    }
  }

  useEffect(() => {
    fetchProducts()
    fetchSettings()
    fetchUsers()
  }, [])

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('centstore_current_user', JSON.stringify(currentUser))
    } else {
      localStorage.removeItem('centstore_current_user')
    }
  }, [currentUser])

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`centstore_cart_${currentUser.email}`, JSON.stringify(cart))
    } else {
      localStorage.setItem('centstore_cart', JSON.stringify(cart))
    }
  }, [cart, currentUser])

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`centstore_wishlist_${currentUser.email}`, JSON.stringify(likedProducts))
    } else {
      localStorage.setItem('centstore_wishlist', JSON.stringify(likedProducts))
    }
  }, [likedProducts, currentUser])

  // Synchronize and merge cart & wishlist when user logs in/out
  useEffect(() => {
    if (currentUser) {
      const userEmail = currentUser.email
      
      // Load guest data
      let guestCart: CartItem[] = []
      let guestWishlist: number[] = []
      try {
        const gc = localStorage.getItem('centstore_cart')
        if (gc) guestCart = JSON.parse(gc)
        const gw = localStorage.getItem('centstore_wishlist')
        if (gw) guestWishlist = JSON.parse(gw)
      } catch (e) {
        console.error(e)
      }

      // Load user-specific data
      let userCart: CartItem[] = []
      let userWishlist: number[] = []
      try {
        const uc = localStorage.getItem(`centstore_cart_${userEmail}`)
        if (uc) userCart = JSON.parse(uc)
        const uw = localStorage.getItem(`centstore_wishlist_${userEmail}`)
        if (uw) userWishlist = JSON.parse(uw)
      } catch (e) {
        console.error(e)
      }

      // Merge Cart
      const mergedCart = [...userCart]
      guestCart.forEach(gItem => {
        const existingIdx = mergedCart.findIndex(uItem => uItem.id === gItem.id)
        if (existingIdx > -1) {
          mergedCart[existingIdx].quantity += gItem.quantity
        } else {
          mergedCart.push(gItem)
        }
      })

      // Merge Wishlist
      const mergedWishlist = Array.from(new Set([...userWishlist, ...guestWishlist]))

      // Save merged to user storage
      localStorage.setItem(`centstore_cart_${userEmail}`, JSON.stringify(mergedCart))
      localStorage.setItem(`centstore_wishlist_${userEmail}`, JSON.stringify(mergedWishlist))

      // Clear guest storage
      localStorage.removeItem('centstore_cart')
      localStorage.removeItem('centstore_wishlist')

      // Update React state
      setCart(mergedCart)
      setLikedProducts(mergedWishlist)
    } else {
      // User logged out
      // Reset React state to load new/empty guest data
      let guestCart: CartItem[] = []
      let guestWishlist: number[] = []
      try {
        const gc = localStorage.getItem('centstore_cart')
        if (gc) guestCart = JSON.parse(gc)
        const gw = localStorage.getItem('centstore_wishlist')
        if (gw) guestWishlist = JSON.parse(gw)
      } catch {}
      setCart(guestCart)
      setLikedProducts(guestWishlist)
    }
  }, [currentUser])

  // Show login promo pop-up once per session
  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem('hasSeenPromoPopup')
    if (!currentUser && !hasSeenPopup) {
      const timer = setTimeout(() => {
        setIsPromoPopupOpen(true)
        sessionStorage.setItem('hasSeenPromoPopup', 'true')
      }, 5000) // Show popup after 5 seconds of browsing
      return () => clearTimeout(timer)
    }
  }, [currentUser])

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

  // Navigation callbacks
  const scrollHeroPrev = useCallback(() => heroApi && heroApi.scrollPrev(), [heroApi])
  const scrollHeroNext = useCallback(() => heroApi && heroApi.scrollNext(), [heroApi])
  // const scrollFlashPrev = useCallback(() => flashApi && flashApi.scrollPrev(), [flashApi])
  // const scrollFlashNext = useCallback(() => flashApi && flashApi.scrollNext(), [flashApi])


  // Cart operations
  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        showToast(`Increased quantity of "${product.title}" in cart!`)
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      }
      showToast(`Added "${product.title}" to cart!`)
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => {
      const updated = prev.map(item => {
        if (item.id === id) {
          return { ...item, quantity: item.quantity + delta }
        }
        return item
      })
      const filtered = updated.filter(item => item.quantity > 0)
      const removedItem = prev.find(item => item.id === id && item.quantity + delta <= 0)
      if (removedItem) {
        showToast(`Removed "${removedItem.title}" from cart.`)
      }
      return filtered
    })
  }

  const removeFromCart = (id: number, title: string) => {
    setCart(prev => prev.filter(item => item.id !== id))
    showToast(`Removed "${title}" from cart.`)
  }

  const toggleLike = (id: number, productName: string) => {
    setLikedProducts(prev => {
      const isLiked = prev.includes(id)
      if (isLiked) {
        showToast(`Removed "${productName}" from wishlist.`)
        return prev.filter(item => item !== id)
      } else {
        showToast(`Saved "${productName}" to wishlist!`)
        return [...prev, id]
      }
    })
  }

  const showToast = (message: string) => {
    setToastMessage(message)
    setTimeout(() => {
      setToastMessage(current => current === message ? null : current)
    }, 3000)
  }

  // WhatsApp checkout formatting
  const handleWhatsAppCheckout = async () => {
    if (cart.length === 0) return
    
    // Save order details to database
    const orderPayload = {
      items: cart.map(item => ({
        productId: item.id,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        storage: item.storage || 'Standard'
      })),
      totalAmount: cartTotal,
      paymentMethod: 'whatsapp',
      guestEmail: currentUser?.email || 'guest@centstores.co.ke',
      shippingAddress: {
        name: currentUser?.name || 'WhatsApp Customer',
        phone: THEME.whatsappNumber
      }
    }

    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      })
    } catch (err) {
      console.warn("Could not log order to database.")
    }
    
    let text = `Hi Cent Stores, I would like to order these devices:\n\n`
    cart.forEach(item => {
      const resolvedUrl = getImageUrl(item.imageUrl)
      const fullImgUrl = resolvedUrl.startsWith('http') ? resolvedUrl : `${window.location.origin}${resolvedUrl}`
      text += `• ${item.quantity}x ${item.title} (${item.storage || 'Standard'}) - KSh ${(item.price * item.quantity).toLocaleString()}\n`
      text += `  Image: ${fullImgUrl}\n\n`
    })
    text += `Total: KSh ${cartTotal.toLocaleString()}\n\n`
    text += `Please let me know if these are in stock at Sanlam House.`
    
    const encodedText = encodeURIComponent(text)
    const whatsappUrl = `https://wa.me/${THEME.whatsappNumber}?text=${encodedText}`
    window.open(whatsappUrl, '_blank')
  }

  // --- BACKEND ADMIN MANAGEMENT API FUNCTIONS ---
  // Toggle Flash Sale status of a product
  const toggleFlashSaleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFlashSale: !currentStatus })
      })
      if (res.ok) {
        showToast("Updated Flash Sale status in database.")
        fetchProducts()
      } else {
        showToast("Error updating product.")
      }
    } catch (err) {
      // Mock update local state
      setDbProducts(prev => prev.map(p => p.id === id ? { ...p, isFlashSale: !currentStatus } : p))
      showToast("Updated locally! (Server offline)")
    }
  }

  // Delete product from database
  const handleDeleteProduct = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        showToast(`Deleted "${title}" from inventory.`)
        fetchProducts()
      } else {
        showToast("Failed to delete product from server.")
      }
    } catch (err) {
      // Mock delete locally
      setDbProducts(prev => prev.filter(p => p.id !== id))
      showToast("Deleted locally! (Server offline)")
    }
  }

  // Totals calculations
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const wishlistItems = dbProducts.filter(p => likedProducts.includes(p.id))

  // Filters application
  const filteredProducts = dbProducts.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.brand.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Flash Sale products filter
  const flashSaleProducts = dbProducts.filter(p => p.isFlashSale)

  return (
    <BrowserRouter>
      <>
        {currentView === 'admin' ? (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-slate-900">
          {toastMessage && (
            <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-800 text-white px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-300">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span className="font-semibold text-xs text-slate-200">{toastMessage}</span>
            </div>
          )}
          <AdminPanel
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          currentView={currentView}
          setCurrentView={setCurrentView}
          dbProducts={dbProducts}
          setDbProducts={setDbProducts}
          users={users}
          setUsers={setUsers}
          toggleFlashSaleStatus={toggleFlashSaleStatus}
          handleDeleteProduct={handleDeleteProduct}
          fetchProducts={fetchProducts}
          fetchUsers={fetchUsers}
          showToast={showToast}
        />
        </div>
      ) : (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border-l-4 border-blue-500 text-white px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-300">
          <Sparkles className="w-5 h-5 text-blue-400" />
          <span className="font-semibold text-sm text-slate-850">{toastMessage}</span>
        </div>
      )}

      {/* login promo pop-up */}
      {isPromoPopupOpen && !currentUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setIsPromoPopupOpen(false)}></div>
          <div className="relative max-w-md w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl z-10 animate-in slide-in-from-bottom-10 fade-in duration-300">
            <button 
              onClick={() => setIsPromoPopupOpen(false)} 
              className="absolute right-4 top-4 p-1.5 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-3.5 pt-2">
              <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight">Unlock Exclusive Member Rates</h3>
                <p className="text-xs text-slate-500 leading-relaxed px-1">
                  Sign in or create an account today to access custom Nairobi wholesale pricing, restock notifications, and seamless checkout logs.
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => {
                  setIsPromoPopupOpen(false);
                  setCurrentView('login');
                }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer flex items-center justify-center gap-2"
              >
                <UserIcon className="w-4 h-4 text-blue-200" />
                Sign In to Account
              </button>
              <button
                onClick={() => {
                  setIsPromoPopupOpen(false);
                  setCurrentView('signup');
                }}
                className="w-full py-3 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
              >
                Register a New Account
              </button>
            </div>

            <p className="text-[10px] text-slate-400 text-center">
              🔒 Safe & Secure. Unsubscribe from offers at any time.
            </p>
          </div>
        </div>
      )}

      {/* CART DRAWER SIDEBAR */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between py-6 px-4 sm:px-6 z-10 border-l border-slate-200 animate-in slide-in-from-right duration-300">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6 text-blue-500" />
                  <span className="text-lg font-black text-slate-900">Shopping Cart</span>
                  <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs font-semibold rounded-full">
                    {cartCount} Items
                  </span>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-1.5 text-slate-600 hover:text-slate-850 rounded-lg hover:bg-slate-100">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Items List */}
              <div className="mt-6 space-y-4 overflow-y-auto max-h-[calc(100vh-280px)] pr-2 scrollbar-thin">
                {cart.length > 0 ? (
                  cart.map((item) => (
                    <div key={item.id} className="flex gap-4 p-3 bg-slate-50 border border-slate-200/60 rounded-xl hover:border-slate-200 transition-all">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-white border border-slate-200/60">
                        <ProductImage src={item.imageUrl} alt={item.title} brand={item.brand} category="" />
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-1">
                            <h4 className="text-xs font-bold text-slate-850 line-clamp-2 leading-relaxed">{item.title}</h4>
                            <button 
                              onClick={() => removeFromCart(item.id, item.title)}
                              className="text-slate-500 hover:text-red-400 p-0.5 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <span className="text-[10px] text-slate-500 font-semibold uppercase">{item.brand} • {item.storage || 'Standard'}</span>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <span className="text-sm font-black text-blue-400">
                            KSh {item.price.toLocaleString()}
                          </span>
                          
                          <div className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-lg px-2 py-1">
                            <button onClick={() => updateQuantity(item.id, -1)} className="text-slate-600 hover:text-slate-850">
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-bold text-slate-850 w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="text-slate-600 hover:text-slate-850">
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 text-slate-500 space-y-4">
                    <ShoppingCart className="w-16 h-16 text-slate-700 mx-auto" />
                    <p className="text-sm font-medium">Your shopping cart is empty.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Subtotal Checkout actions */}
            {cart.length > 0 && (
              <div className="border-t border-slate-200 pt-6 space-y-4 bg-white">
                <div className="flex justify-between items-end">
                  <span className="text-sm text-slate-600 font-medium">Subtotal Amount:</span>
                  <span className="text-2xl font-black text-slate-900">KSh {cartTotal.toLocaleString()}</span>
                </div>
                
                <button
                  onClick={handleWhatsAppCheckout}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95"
                >
                  <Globe className="w-4 h-4" />
                  Order on WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* WISHLIST DRAWER SIDEBAR */}
      {isWishlistOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsWishlistOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between py-6 px-4 sm:px-6 z-10 border-l border-slate-200 animate-in slide-in-from-right duration-300">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Heart className="w-6 h-6 text-pink-500 fill-pink-500/10" />
                  <span className="text-lg font-black text-slate-900">Wishlist</span>
                  <span className="px-2 py-0.5 bg-pink-500/10 text-pink-400 text-xs font-semibold rounded-full">
                    {likedProducts.length} Items
                  </span>
                </div>
                <button onClick={() => setIsWishlistOpen(false)} className="p-1.5 text-slate-600 hover:text-slate-850 rounded-lg hover:bg-slate-100">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Items List */}
              <div className="mt-6 space-y-4 overflow-y-auto max-h-[calc(100vh-280px)] pr-2 scrollbar-thin">
                {wishlistItems.length > 0 ? (
                  wishlistItems.map((item) => (
                    <div key={item.id} className="flex gap-4 p-3 bg-slate-50 border border-slate-200/60 rounded-xl hover:border-slate-200 transition-all">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-white border border-slate-200/60">
                        <ProductImage src={item.imageUrl} alt={item.title} brand={item.brand} category="" />
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-1">
                            <h4 className="text-xs font-bold text-slate-850 line-clamp-2 leading-relaxed">{item.title}</h4>
                            <button 
                              onClick={() => toggleLike(item.id, item.title)}
                              className="text-slate-500 hover:text-red-400 p-0.5 transition-colors"
                              title="Remove from Wishlist"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <span className="text-[10px] text-slate-500 font-semibold uppercase">{item.brand} • {item.storage || 'Standard'}</span>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <span className="text-sm font-black text-blue-400">
                            KSh {item.price.toLocaleString()}
                          </span>
                          
                          <button 
                            onClick={() => {
                              addToCart(item)
                            }}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-lg transition-all"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 text-slate-500 space-y-4">
                    <Heart className="w-16 h-16 text-slate-700 mx-auto" />
                    <p className="text-sm font-medium">Your wishlist is empty.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Subtotal Checkout actions */}
            {wishlistItems.length > 0 && (
              <div className="border-t border-slate-200 pt-6 space-y-4 bg-white">
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setCart(prev => {
                        let newCart = [...prev]
                        wishlistItems.forEach(item => {
                          const existingIndex = newCart.findIndex(c => c.id === item.id)
                          if (existingIndex > -1) {
                            newCart[existingIndex] = {
                              ...newCart[existingIndex],
                              quantity: newCart[existingIndex].quantity + 1
                            }
                          } else {
                            newCart.push({
                              id: item.id,
                              title: item.title,
                              price: item.price,
                              imageUrl: item.imageUrl,
                              brand: item.brand,
                              storage: item.storage || 'Standard',
                              quantity: 1
                            })
                          }
                        })
                        return newCart
                      })
                      showToast(`Added all items from wishlist to cart!`)
                    }}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add All to Cart
                  </button>
                  <button
                    onClick={() => {
                      setLikedProducts([])
                      showToast("Wishlist cleared.")
                    }}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95 border border-slate-200"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <header className="sticky top-0 z-40 bg-slate-50/90 backdrop-blur-md border-b border-slate-200/80 shadow-xl shadow-black/10">
        <div className="max-w-[1184px] mx-auto px-4 h-16 sm:h-20 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="lg:hidden p-1.5 text-slate-600 hover:bg-white rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link to="/" 
              className="flex items-center gap-3"
            >
              <img src="/logo.png" alt="Cent Stores Logo" className="h-9 w-9 sm:h-11 sm:w-11 rounded-full object-cover bg-white p-0.5 border border-slate-200" />
              <span className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-blue-400 to-sky-300 bg-clip-text text-transparent hidden sm:inline-block">
                CENTSTORES
              </span>
            </Link>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-[500px] flex items-center gap-2">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-500" />
              </div>
              <input
                type="text"
                placeholder="Search premium iPhones, Samsung, Redmi, OnePlus..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Right Utility */}
          <div className="flex items-center gap-2 sm:gap-4 text-slate-700">
            {/* Auth Session State Navigation */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 hidden md:inline">
                  Hi, <span className="font-bold text-slate-700">{currentUser.name}</span>
                </span>
                
                {currentUser.role === 'admin' && (
                  <button 
                    onClick={() => setCurrentView('admin')}
                    className="flex items-center gap-1.5 py-2 px-3 rounded-xl font-bold text-xs transition-all border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                  >
                    <Settings className="w-4 h-4 animate-spin-slow" />
                    <span className="hidden sm:inline">Admin Console</span>
                  </button>
                )}

                <button 
                  onClick={() => {
                    setCurrentUser(null);
                    setCurrentView('showroom');
                    setToastMessage("Signed out of portal session");
                    setTimeout(() => setToastMessage(null), 2500);
                  }}
                  className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-650 font-bold text-xs rounded-xl border border-red-200/60 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setCurrentView('login')}
                className={`flex items-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors`}
              >
                <UserIcon className="w-4 h-4 text-slate-500" />
                <span>Login</span>
              </button>
            )}

            {/* Wishlist Trigger */}
            <button 
              onClick={() => setIsWishlistOpen(true)}
              className="flex items-center gap-2 py-2 px-3 bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 hover:text-pink-300 rounded-xl font-bold text-xs border border-pink-500/20 hover:border-pink-500/30 transition-all relative"
            >
              <Heart className="w-4.5 h-4.5 fill-pink-500/10" />
              <span className="hidden sm:inline">Wishlist</span>
              <span className="px-1.5 py-0.5 bg-pink-500 text-white font-black rounded-md text-[9px]">
                {likedProducts.length}
              </span>
            </button>

            {/* Cart Trigger */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 py-2 px-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 rounded-xl font-bold text-xs border border-blue-500/20 hover:border-blue-500/30 transition-all relative"
            >
              <ShoppingCart className="w-4.5 h-4.5" />
              <span className="hidden sm:inline">Cart</span>
              <span className="px-1.5 py-0.5 bg-blue-500 text-slate-950 font-black rounded-md text-[9px]">
                {cartCount}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE COLLAPSED CATALOG MENU */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="relative w-72 max-w-xs bg-white h-full flex flex-col justify-between py-6 px-4 border-r border-slate-200 animate-in slide-in-from-left duration-200">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xl font-black text-blue-400">{THEME.brandText}</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-slate-600 hover:text-slate-850">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 mb-2">Device Catalog</p>
                <button 
                  onClick={() => { setSelectedCategory('All'); setIsMobileMenuOpen(false) }}
                  className={`w-full text-left px-3 py-2.5 text-xs rounded-lg transition-colors ${selectedCategory === 'All' ? 'bg-blue-500/10 text-blue-400 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  All Showcase Items
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => { setSelectedCategory(cat.name); setIsMobileMenuOpen(false) }}
                    className={`w-full text-left px-3 py-2.5 text-xs rounded-lg transition-colors ${selectedCategory === cat.name ? 'bg-blue-500/10 text-blue-400 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="border-t border-slate-200 pt-4 space-y-3">
              <a href="tel:0101125353" className="block text-center py-2 bg-slate-50 text-slate-700 font-bold text-xs rounded-lg border border-slate-200">
                Call Direct: 0101125353
              </a>
              <p className="text-[10px] text-center text-slate-500">📍 Sanlam House, Shop 103</p>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-[1184px] mx-auto px-4 py-4 sm:py-6 space-y-6">
        {currentView === 'login' ? (
          /* --- LOGIN VIEW PORTAL --- */
          <section className="max-w-md mx-auto py-8 sm:py-12 animate-in zoom-in-95 duration-200">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-md space-y-6 text-slate-800">
              <div className="text-center space-y-2">
                <span className="text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-600 font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded">
                  Secure Access Portal
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Cent Stores Login</h1>
                <p className="text-xs text-slate-500">Sign in to manage stock inventory and change user accounts role permissions</p>
              </div>

              {loginError && (
                <div className="bg-red-50 text-red-500 border border-red-200 rounded-lg p-3 text-xs font-semibold">
                  {loginError}
                </div>
              )}

              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const res = await fetch('/api/auth/login', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: loginEmail, password: loginPassword })
                    });
                    const data = await res.json();
                    if (res.ok) {
                      setCurrentUser(data.user);
                      setLoginError(null);
                      showToast(`Welcome back, ${data.user.name}!`);
                      if (data.user.role === 'admin') {
                        setCurrentView('admin');
                      } else {
                        setCurrentView('showroom');
                      }
                    } else {
                      setLoginError(data.error || 'Invalid email or password.');
                    }
                  } catch (err) {
                    setLoginError('Authentication server offline.');
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-655 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. admin@centstores.co.ke"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-655 mb-1">Secret Password</label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase rounded-xl tracking-wider transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                >
                  Authenticate & Sign In
                </button>
              </form>

              <div className="flex justify-between items-center text-xs pt-2">
                <span className="text-slate-550">Don't have an account?</span>
                <button
                  onClick={() => {
                    setLoginError(null);
                    setCurrentView('signup');
                  }}
                  className="text-blue-500 hover:underline font-bold"
                >
                  Sign Up
                </button>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setCurrentView('showroom')}
                  className="text-xs text-slate-500 hover:text-blue-500 font-bold transition-colors underline"
                >
                  Cancel & Return to Showcase
                </button>
              </div>
            </div>
          </section>
        ) : currentView === 'signup' ? (
          /* --- SIGNUP VIEW PORTAL --- */
          <section className="max-w-md mx-auto py-8 sm:py-12 animate-in zoom-in-95 duration-200">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 text-slate-800">
              <div className="text-center space-y-2">
                <span className="text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-600 font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded">
                  Create Customer Account
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Cent Stores Signup</h1>
                <p className="text-xs text-slate-500">Create an account to track orders and save your preferred products</p>
              </div>

              {loginError && (
                <div className="bg-red-50 text-red-550 border border-red-205 rounded-lg p-3 text-xs font-semibold">
                  {loginError}
                </div>
              )}

              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const res = await fetch('/api/auth/register', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ name: signupName, email: signupEmail, password: signupPassword })
                    });
                    const data = await res.json();
                    if (res.ok) {
                      setOtpVerifyEmail(signupEmail);
                      setLoginError(null);
                      setCurrentView('otp-verify');
                      showToast('OTP Verification code dispatched to your email.');
                    } else {
                      setLoginError(data.error || 'Registration failed.');
                    }
                  } catch (err) {
                    setLoginError('Signup server offline.');
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-655 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="e.g. Nimrod Kibet"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-655 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="e.g. nimrod@example.com"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-655 mb-1">Secret Password</label>
                  <input
                    type="password"
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase rounded-xl tracking-wider transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                >
                  Register Account
                </button>
              </form>

              <div className="flex justify-between items-center text-xs pt-2">
                <span className="text-slate-550">Already have an account?</span>
                <button
                  onClick={() => {
                    setLoginError(null);
                    setCurrentView('login');
                  }}
                  className="text-blue-500 hover:underline font-bold"
                >
                  Log In
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={() => setCurrentView('showroom')}
                  className="text-xs text-slate-500 hover:text-blue-500 font-bold transition-colors underline"
                >
                  Cancel & Return to Showcase
                </button>
              </div>
            </div>
          </section>
        ) : currentView === 'otp-verify' ? (
          /* --- OTP VERIFICATION PORTAL --- */
          <section className="max-w-md mx-auto py-8 sm:py-12 animate-in zoom-in-95 duration-200">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 text-slate-800">
              <div className="text-center space-y-2">
                <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded">
                  OTP Code Verification
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Verify Account</h1>
                <p className="text-xs text-slate-505 leading-normal">
                  We sent a 6-digit confirmation code to <span className="font-bold text-slate-850">{otpVerifyEmail}</span>. Please check your inbox (or console if offline).
                </p>
              </div>

              {loginError && (
                <div className="bg-red-50 text-red-550 border border-red-205 rounded-lg p-3 text-xs font-semibold">
                  {loginError}
                </div>
              )}

              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const res = await fetch('/api/auth/verify-otp', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: otpVerifyEmail, code: signupOtp })
                    });
                    const data = await res.json();
                    if (res.ok) {
                      setCurrentUser(data.user);
                      setLoginError(null);
                      showToast(`Account verified! Welcome ${data.user.name}`);
                      if (data.user.role === 'admin') {
                        setCurrentView('admin');
                      } else {
                        setCurrentView('showroom');
                      }
                    } else {
                      setLoginError(data.error || 'Verification failed.');
                    }
                  } catch (err) {
                    setLoginError('Verification server offline.');
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-655 mb-1">6-Digit Verification Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={signupOtp}
                    onChange={(e) => setSignupOtp(e.target.value)}
                    placeholder="e.g. 123456"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 text-xs text-center font-mono tracking-widest focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase rounded-xl tracking-wider transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                >
                  Verify & Log In
                </button>
              </form>

              <div className="text-center pt-2">
                <button
                  onClick={() => setCurrentView('login')}
                  className="text-xs text-slate-500 hover:text-blue-500 font-bold transition-colors underline"
                >
                  Back to Login
                </button>
              </div>
            </div>
          </section>
        ) : (
<Routes>
<Route path="/product/:id" element={<ProductDetail addToCart={addToCart} />} />
<Route path="/" element={<>

          <>
            {/* SCREEN LAYOUT CLEANUP: HIGH-END CINEMATIC HERO AREA */}
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

              {/* Center Carousel Slider (Direct Imports) */}
              {(() => {
                const activeSlides = settings.heroSlides && settings.heroSlides.length > 0 ? settings.heroSlides : HERO_SLIDES;
                const dynamicHeight = settings.sectionHeight || 368;
                const dynamicOpacity = (settings.overlayOpacity !== undefined ? settings.overlayOpacity : 40) / 100;
                
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
                                <span className="text-xs font-semibold text-blue-400">{slide.badge}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Arrows */}
                    <button
                      onClick={scrollHeroPrev}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-955/40 hover:bg-slate-955/65 text-slate-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={scrollHeroNext}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-955/40 hover:bg-slate-955/65 text-slate-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
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

            {/* QUICK LINK CATEGORY TABS (MOBILE FRIENDLY HORIZONTAL SCROLL) */}
            <section className="bg-slate-100/50 border border-slate-200/80 rounded-xl p-3 flex gap-2 overflow-x-auto scrollbar-none shadow-sm">
              <button 
                onClick={() => setSelectedCategory('All')}
                className={`px-4 py-2 text-xs font-bold rounded-lg border whitespace-nowrap transition-all ${selectedCategory === 'All' ? 'bg-blue-600 border-blue-500 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-800'}`}
              >
                All Showcase Items ({dbProducts.length})
              </button>
              {categories.map((c) => {
                const count = dbProducts.filter(p => p.category === c.name).length
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

            {/* EXCLUSIVE FLASH SALES TIMER BLOCK (PERSISTENT HIGH-END COMPONENT) */}
            {flashSaleProducts.length > 0 && (
              <section className="bg-orange-500/5 border border-orange-500/15 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-orange-600 to-amber-600 px-4 py-3 flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 animate-pulse text-amber-250" />
                    <span className="font-extrabold text-xs uppercase tracking-wider text-white">Active Flash Sales (Sanlam House Promos)</span>
                  </div>
                  
                  {/* Digital countdown widgets */}
                  <div className="flex items-center gap-1 font-mono text-xs font-extrabold bg-black/30 px-3 py-1 rounded border border-white/10 text-white">
                    <span className="text-amber-200">03</span>
                    <span>:</span>
                    <span>42</span>
                    <span>:</span>
                    <span className="text-orange-400">19</span>
                  </div>
                </div>

                {/* Flash Sales list */}
                <div className="p-4 overflow-hidden" ref={flashRef}>
                  <div className="flex gap-4">
                    {flashSaleProducts.map((product) => {
                      const isLiked = likedProducts.includes(product.id)
                      const isInCart = cart.some(item => item.id === product.id)
                      return (
                        <div
                          key={product.id}
                          className="flex-[0_0_190px] sm:flex-[0_0_210px] min-w-0 bg-white border border-slate-205 rounded-xl p-3 hover:border-blue-500/40 hover:bg-slate-50/50 hover:shadow-md transition-all group relative flex flex-col justify-between shadow-sm"
                        >
                          <span className="absolute top-2 left-2 z-10 px-1.5 py-0.5 text-[9px] font-black bg-blue-500/10 border border-blue-500/30 text-blue-650 rounded-md">
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

                          <Link to={`/product/${product.id}`} className="w-full h-32 sm:h-36 rounded-md overflow-hidden bg-slate-50 mb-3 flex items-center justify-center relative border border-slate-100/60 cursor-pointer"><ProductImage src={product.imageUrl} alt={product.title} brand={product.brand} category={product.category} /></Link>

                          <div className="space-y-1.5 flex-grow flex flex-col justify-between">
                            <Link to={`/product/${product.id}`} className="cursor-pointer block"><p className="text-[10px] text-blue-600 font-bold uppercase">{product.brand} � {product.storage}</p><h4 className="text-xs font-semibold text-slate-800 line-clamp-2 leading-relaxed min-h-[32px] group-hover:text-blue-500 transition-colors">{product.title}</h4></Link>

                            <div>
                              <div className="flex flex-col pt-1">
                                <span className="text-sm font-black text-slate-900">{THEME.currency} {product.price.toLocaleString()}</span>
                                <span className="text-[10px] text-slate-450 line-through">{THEME.currency} {product.originalPrice.toLocaleString()}</span>
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

            {/* GENERAL SHOWROOM LAYOUT (ALL REMAINING CLUTTER REMOVED) */}
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
                      <span className="absolute top-2 left-2 z-10 px-1.5 py-0.5 text-[9px] font-black bg-blue-500/10 border border-blue-500/30 text-blue-650 rounded-md">
                        {product.note || "Available"}
                      </span>

                      <button
                        onClick={() => toggleLike(product.id, product.title)}
                        className={`absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white border border-slate-205 hover:border-slate-300 transition-colors shadow-sm ${
                          isLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-400'
                        }`}
                      >
                        <Heart className="w-3.5 h-3.5 fill-current" style={{ fillOpacity: isLiked ? 1 : 0 }} />
                      </button>

                      <Link to={`/product/${product.id}`} className="w-full h-32 sm:h-36 rounded-md overflow-hidden bg-slate-50 mb-3 flex items-center justify-center relative border border-slate-100/60 cursor-pointer"><ProductImage src={product.imageUrl} alt={product.title} brand={product.brand} category={product.category} /></Link>

                      <div className="space-y-1.5 flex-grow flex flex-col justify-between">
                        <Link to={`/product/${product.id}`} className="cursor-pointer block"><p className="text-[10px] text-blue-600 font-bold uppercase">{product.brand} � {product.storage}</p><h4 className="text-xs font-semibold text-slate-800 line-clamp-2 leading-relaxed min-h-[32px] group-hover:text-blue-500 transition-colors">{product.title}</h4></Link>

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
                            ? 'bg-blue-600/20 text-blue-650 border border-blue-500/20' 
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

            {/* --- NEWSLETTER SUBSCRIBE SECTION --- */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6 shadow-lg">
              {/* Decorative radial gradient */}
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
                  className="px-5 py-2.5 bg-blue-650 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer text-center whitespace-nowrap"
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
                    Visit our physical showroom on **Kenyatta Avenue, Sanlam House, 1st Floor Shop 103** to verify item specifications, diagnose devices, and check active warranty covers before finalizing payments.
                  </p>
                </div>
                <div className="space-y-2">
                  <p>
                    Need to order multiple products? Simply add your items to the shopping cart and trigger "Order on WhatsApp" to generate your custom invoice list directly with our dispatch desk. Same-day countrywide delivery applies.
                  </p>
                  <p>
                    Contact our customer hotlines at **0101125353** or **0736409703** for instant specifications reviews.
                  </p>
                </div>
              </div>
            </section>
          </>
          </>
} />
</Routes>
        )}
</main>

      {/* CLEAN LUXURY FOOTER (NO CENTSTORE CORPORATE ACCORDIONS) */}
      <footer className="bg-slate-900 text-slate-400 mt-12 border-t border-slate-850">
        <div className="max-w-[1184px] mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-xs">
          <div className="space-y-3">
            <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">Boutique Directory</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Apple iPhones</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Samsung Galaxy</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">OnePlus & Redmi</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">MacBooks & Wearables</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">Purchase Guidelines</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-400 transition-colors">WhatsApp Order Steps</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Same-Day Dispatch</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Device diagnostics policy</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Warranty Registry</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">Showroom coordinates</h4>
            <p className="leading-relaxed">
              📍 Kenyatta Avenue,<br />
              Sanlam House, 1st Floor,<br />
              Shop 103, Nairobi, Kenya
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">Hotline Support</h4>
            <ul className="space-y-2 font-semibold">
              <li><a href="tel:0101125353" className="hover:text-blue-400 transition-colors">📞 0101125353</a></li>
              <li><a href="tel:0736409703" className="hover:text-blue-400 transition-colors">📞 0736409703</a></li>
              <li><a href="https://instagram.com/centstores_ke" target="_blank" className="hover:text-blue-400 transition-colors">Instagram: @centstores_ke</a></li>
            </ul>
          </div>
        </div>

        {/* Corporate footer bottom bar */}
        <div className="bg-black/30 py-6 text-slate-400 text-xs border-t border-slate-200/80/60">
          <div className="max-w-[1184px] mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Cent Stores Logo" className="h-6.5 w-6.5 rounded-full object-cover bg-white p-0.5" />
              <span>© {new Date().getFullYear()} {THEME.domain}. Licensed Importer.</span>
            </div>
            <div className="flex gap-4 text-slate-500">
              <PhoneCall className="w-4.5 h-4.5 hover:text-blue-400 cursor-pointer" />
              <Mail className="w-4.5 h-4.5 hover:text-blue-400 cursor-pointer" />
              <Clock className="w-4.5 h-4.5 hover:text-blue-450 cursor-pointer" />
            </div>
          </div>
        </div>
      </footer>

    </div>
      )}
      </>
    </BrowserRouter>
  )
}

export default App
