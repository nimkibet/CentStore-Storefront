import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  Search,
  ShoppingCart,
  Heart,
  Sparkles,
  Menu,
  X,
  Globe,
  Clock,
  PhoneCall,
  Mail,
  Trash2,
  Plus,
  Minus,
  Settings,
  User as UserIcon
} from 'lucide-react'

// Import fallback static data in case backend server is offline
import { categories, products as staticProducts } from './data/mockCentstore.js'
import AdminPanel from './AdminPanel'
import HomeCatalog, { ProductImage, type Product, type CartItem } from './views/HomeCatalog'
import ProductDetail from './views/ProductDetail'
import LoginPage from './views/LoginPage'
import SignupPage from './views/SignupPage'
import OtpVerifyPage from './views/OtpVerifyPage'

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

export function AppContent() {
  const navigate = useNavigate()
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  // Authentication State
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
  const [isPromoPopupOpen, setIsPromoPopupOpen] = useState(false)

  const [users, setUsers] = useState<{ email: string; role: 'admin' | 'user'; name: string; password?: string }[]>([
    { email: 'admin@centstores.co.ke', role: 'admin', name: 'Executive Admin', password: 'admin123' },
    { email: 'user@centstores.co.ke', role: 'user', name: 'Premium Client', password: 'user123' },
    { email: 'agent@centstores.co.ke', role: 'user', name: 'Sales Agent', password: 'agent123' }
  ])

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
    } catch {
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
        setDbProducts(staticProducts as Product[])
      }
    } catch {
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
    } catch {
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

      const mergedCart = [...userCart]
      guestCart.forEach(gItem => {
        const existingIdx = mergedCart.findIndex(uItem => uItem.id === gItem.id)
        if (existingIdx > -1) {
          mergedCart[existingIdx].quantity += gItem.quantity
        } else {
          mergedCart.push(gItem)
        }
      })

      const mergedWishlist = Array.from(new Set([...userWishlist, ...guestWishlist]))

      localStorage.setItem(`centstore_cart_${userEmail}`, JSON.stringify(mergedCart))
      localStorage.setItem(`centstore_wishlist_${userEmail}`, JSON.stringify(mergedWishlist))

      localStorage.removeItem('centstore_cart')
      localStorage.removeItem('centstore_wishlist')

      setCart(mergedCart)
      setLikedProducts(mergedWishlist)
    } else {
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
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [currentUser])

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
    } catch {
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

  // Backend Admin Management API functions
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
    } catch {
      setDbProducts(prev => prev.map(p => p.id === id ? { ...p, isFlashSale: !currentStatus } : p))
      showToast("Updated locally! (Server offline)")
    }
  }

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
    } catch {
      setDbProducts(prev => prev.filter(p => p.id !== id))
      showToast("Deleted locally! (Server offline)")
    }
  }

  // Totals calculations
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const wishlistItems = dbProducts.filter(p => likedProducts.includes(p.id))

  return (
    <div className={isAdmin ? "min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-slate-900" : "min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white"}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-300 ${isAdmin ? 'bg-slate-900 border border-slate-800 text-white' : 'bg-white border-l-4 border-blue-500 text-slate-900'}`}>
          <Sparkles className={`w-5 h-5 ${isAdmin ? 'text-emerald-400' : 'text-blue-500'}`} />
          <span className="font-semibold text-xs sm:text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Common Storefront Layout (Shown when not in Admin Panel) */}
      {!isAdmin && (
        <>
          {/* TOP ANNOUNCEMENT BANNER */}
          <div className="bg-slate-900 text-slate-300 text-[11px] py-1.5 px-4 text-center border-b border-slate-800 flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>{THEME.tagline} • Sanlam House Nairobi Shop 103</span>
          </div>

          {/* Login promo pop-up */}
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
                      navigate('/login');
                    }}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <UserIcon className="w-4 h-4 text-blue-200" />
                    Sign In to Account
                  </button>
                  <button
                    onClick={() => {
                      setIsPromoPopupOpen(false);
                      navigate('/signup');
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
                      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 text-xs font-semibold rounded-full">
                        {cartCount} Items
                      </span>
                    </div>
                    <button onClick={() => setIsCartOpen(false)} className="p-1.5 text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100">
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Items List */}
                  <div className="mt-6 space-y-4 overflow-y-auto max-h-[calc(100vh-280px)] pr-2 scrollbar-thin">
                    {cart.length > 0 ? (
                      cart.map((item) => (
                        <div key={item.id} className="flex gap-4 p-3 bg-slate-50 border border-slate-200/60 rounded-xl hover:border-slate-200 transition-all">
                          <Link 
                            to={`/product/${item.id}`} 
                            onClick={() => setIsCartOpen(false)}
                            className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-white border border-slate-200/60 cursor-pointer block"
                          >
                            <ProductImage src={item.imageUrl} alt={item.title} brand={item.brand} category="" />
                          </Link>
                          
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start gap-1">
                                <Link 
                                  to={`/product/${item.id}`} 
                                  onClick={() => setIsCartOpen(false)}
                                  className="text-xs font-bold text-slate-800 line-clamp-2 leading-relaxed hover:text-blue-600 transition-colors"
                                >
                                  {item.title}
                                </Link>
                                <button 
                                  onClick={() => removeFromCart(item.id, item.title)}
                                  className="text-slate-500 hover:text-red-500 p-0.5 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <span className="text-[10px] text-slate-500 font-semibold uppercase">{item.brand} • {item.storage || 'Standard'}</span>
                            </div>

                            <div className="flex justify-between items-center pt-2">
                              <span className="text-sm font-black text-blue-600">
                                KSh {item.price.toLocaleString()}
                              </span>
                              
                              <div className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-lg px-2 py-1">
                                <button onClick={() => updateQuantity(item.id, -1)} className="text-slate-600 hover:text-slate-800">
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-xs font-bold text-slate-800 w-4 text-center">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, 1)} className="text-slate-600 hover:text-slate-800">
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-16 text-slate-500 space-y-4">
                        <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto" />
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
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 cursor-pointer"
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
                      <span className="px-2 py-0.5 bg-pink-500/10 text-pink-500 text-xs font-semibold rounded-full">
                        {likedProducts.length} Items
                      </span>
                    </div>
                    <button onClick={() => setIsWishlistOpen(false)} className="p-1.5 text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100">
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Items List */}
                  <div className="mt-6 space-y-4 overflow-y-auto max-h-[calc(100vh-280px)] pr-2 scrollbar-thin">
                    {wishlistItems.length > 0 ? (
                      wishlistItems.map((item) => (
                        <div key={item.id} className="flex gap-4 p-3 bg-slate-50 border border-slate-200/60 rounded-xl hover:border-slate-200 transition-all">
                          <Link 
                            to={`/product/${item.id}`} 
                            onClick={() => setIsWishlistOpen(false)}
                            className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-white border border-slate-200/60 cursor-pointer block"
                          >
                            <ProductImage src={item.imageUrl} alt={item.title} brand={item.brand} category="" />
                          </Link>
                          
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start gap-1">
                                <Link 
                                  to={`/product/${item.id}`} 
                                  onClick={() => setIsWishlistOpen(false)}
                                  className="text-xs font-bold text-slate-800 line-clamp-2 leading-relaxed hover:text-blue-600 transition-colors"
                                >
                                  {item.title}
                                </Link>
                                <button 
                                  onClick={() => toggleLike(item.id, item.title)}
                                  className="text-slate-500 hover:text-red-500 p-0.5 transition-colors"
                                  title="Remove from Wishlist"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <span className="text-[10px] text-slate-500 font-semibold uppercase">{item.brand} • {item.storage || 'Standard'}</span>
                            </div>

                            <div className="flex justify-between items-center pt-2">
                              <span className="text-sm font-black text-blue-600">
                                KSh {item.price.toLocaleString()}
                              </span>
                              
                              <button 
                                onClick={() => addToCart(item)}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-lg transition-all cursor-pointer"
                              >
                                Add to Cart
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-16 text-slate-500 space-y-4">
                        <Heart className="w-16 h-16 text-slate-300 mx-auto" />
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
                            const newCart = [...prev]
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
                        className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 cursor-pointer"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Add All to Cart
                      </button>
                      <button
                        onClick={() => {
                          setLikedProducts([])
                          showToast("Wishlist cleared.")
                        }}
                        className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95 border border-slate-200 cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* HEADER / NAVBAR */}
          <header className="sticky top-0 z-40 bg-slate-50/90 backdrop-blur-md border-b border-slate-200/80 shadow-xl shadow-black/10">
            <div className="max-w-[1184px] mx-auto px-4 h-16 sm:h-20 flex items-center justify-between gap-4">
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                  className="lg:hidden p-1.5 text-slate-600 hover:bg-white rounded-lg transition-colors"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <Link to="/" className="flex items-center gap-3">
                  <img src="/logo.png" alt="Cent Stores Logo" className="h-9 w-9 sm:h-11 sm:w-11 rounded-full object-cover bg-white p-0.5 border border-slate-200" />
                  <span className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent hidden sm:inline-block">
                    CENTSTORES
                  </span>
                </Link>
              </div>

              {/* Search */}
              <div className="flex-1 max-w-[500px] flex items-center gap-2">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search premium iPhones, Samsung, Redmi, OnePlus..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      if (location.pathname !== '/') {
                        navigate('/')
                      }
                    }}
                    className="block w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                      <Link 
                        to="/admin"
                        className="flex items-center gap-1.5 py-2 px-3 rounded-xl font-bold text-xs transition-all border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                      >
                        <Settings className="w-4 h-4" />
                        <span className="hidden sm:inline">Admin Console</span>
                      </Link>
                    )}

                    <button 
                      onClick={() => {
                        setCurrentUser(null);
                        navigate('/');
                        setToastMessage("Signed out of portal session");
                        setTimeout(() => setToastMessage(null), 2500);
                      }}
                      className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl border border-red-200/60 transition-colors cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link 
                    to="/login"
                    className="flex items-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-slate-500" />
                    <span>Login</span>
                  </Link>
                )}

                {/* Wishlist Trigger */}
                <button 
                  onClick={() => setIsWishlistOpen(true)}
                  className="flex items-center gap-2 py-2 px-3 bg-pink-500/10 hover:bg-pink-500/20 text-pink-500 hover:text-pink-600 rounded-xl font-bold text-xs border border-pink-500/20 hover:border-pink-500/30 transition-all relative cursor-pointer"
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
                  className="flex items-center gap-2 py-2 px-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 hover:text-blue-700 rounded-xl font-bold text-xs border border-blue-500/20 hover:border-blue-500/30 transition-all relative cursor-pointer"
                >
                  <ShoppingCart className="w-4.5 h-4.5" />
                  <span className="hidden sm:inline">Cart</span>
                  <span className="px-1.5 py-0.5 bg-blue-600 text-white font-black rounded-md text-[9px]">
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
                    <span className="text-xl font-black text-blue-600">{THEME.brandText}</span>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-slate-600 hover:text-slate-800">
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 mb-2">Device Catalog</p>
                    <button 
                      onClick={() => {
                        setSelectedCategory('All');
                        setIsMobileMenuOpen(false);
                        navigate('/');
                      }}
                      className={`w-full text-left px-3 py-2.5 text-xs rounded-lg transition-colors ${selectedCategory === 'All' ? 'bg-blue-500/10 text-blue-600 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      All Showcase Items
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.name}
                        onClick={() => {
                          setSelectedCategory(cat.name);
                          setIsMobileMenuOpen(false);
                          navigate('/');
                        }}
                        className={`w-full text-left px-3 py-2.5 text-xs rounded-lg transition-colors ${selectedCategory === cat.name ? 'bg-blue-500/10 text-blue-600 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
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
        </>
      )}

      {/* MAIN CONTENT AREA WITH DECLARATIVE ROUTES */}
      <main className={isAdmin ? "w-full" : "max-w-[1184px] mx-auto px-4 py-4 sm:py-6 space-y-6"}>
        <Routes>
          <Route
            path="/"
            element={
              <HomeCatalog
                products={dbProducts}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                searchQuery={searchQuery}
                likedProducts={likedProducts}
                toggleLike={toggleLike}
                cart={cart}
                addToCart={addToCart}
                settings={settings}
                showToast={showToast}
              />
            }
          />
          <Route path="/product/:id" element={<ProductDetail addToCart={addToCart} />} />
          <Route
            path="/login"
            element={
              <LoginPage
                onLoginSuccess={(user) => {
                  setCurrentUser(user)
                }}
                showToast={showToast}
              />
            }
          />
          <Route
            path="/signup"
            element={
              <SignupPage
                showToast={showToast}
              />
            }
          />
          <Route
            path="/otp-verify"
            element={
              <OtpVerifyPage
                onVerifySuccess={(user) => {
                  setCurrentUser(user)
                }}
                showToast={showToast}
              />
            }
          />
          <Route
            path="/admin"
            element={
              <AdminPanel
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
                currentView="admin"
                setCurrentView={(view) => {
                  if (view === 'showroom') navigate('/')
                  else if (view === 'login') navigate('/login')
                  else if (view === 'admin') navigate('/admin')
                }}
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
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* FOOTER */}
      {!isAdmin && (
        <footer className="bg-slate-900 text-slate-400 mt-12 border-t border-slate-800">
          <div className="max-w-[1184px] mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-xs">
            <div className="space-y-3">
              <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">Boutique Directory</h4>
              <ul className="space-y-2">
                <li><Link to="/" onClick={() => setSelectedCategory('Apple iPhones')} className="hover:text-blue-400 transition-colors">Apple iPhones</Link></li>
                <li><Link to="/" onClick={() => setSelectedCategory('Samsung Galaxy')} className="hover:text-blue-400 transition-colors">Samsung Galaxy</Link></li>
                <li><Link to="/" onClick={() => setSelectedCategory('Redmi & OnePlus')} className="hover:text-blue-400 transition-colors">OnePlus & Redmi</Link></li>
                <li><Link to="/" onClick={() => setSelectedCategory('Laptops & MacBooks')} className="hover:text-blue-400 transition-colors">MacBooks & Wearables</Link></li>
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
                <li><a href="https://instagram.com/centstores_ke" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">Instagram: @centstores_ke</a></li>
              </ul>
            </div>
          </div>

          {/* Corporate footer bottom bar */}
          <div className="bg-black/30 py-6 text-slate-400 text-xs border-t border-slate-800">
            <div className="max-w-[1184px] mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Cent Stores Logo" className="h-6.5 w-6.5 rounded-full object-cover bg-white p-0.5" />
                <span>© {new Date().getFullYear()} {THEME.domain}. Licensed Importer.</span>
              </div>
              <div className="flex gap-4 text-slate-500">
                <PhoneCall className="w-4.5 h-4.5 hover:text-blue-400 cursor-pointer" />
                <Mail className="w-4.5 h-4.5 hover:text-blue-400 cursor-pointer" />
                <Clock className="w-4.5 h-4.5 hover:text-blue-400 cursor-pointer" />
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
