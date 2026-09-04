import React, { useState, useEffect, useRef } from 'react'
import {
  LayoutDashboard,
  Eye,
  Package,
  PlusCircle,
  Zap,
  Sliders,
  Database,
  ShoppingCart,
  ClipboardList,
  Users as UsersIcon,
  LogOut,
  Search,
  Bell,
  ChevronDown,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  Plus,
  Trash2,
  Sparkles,
  Upload,
  Calendar,
  X,
  Smartphone,
  Laptop,
  Watch,
  Cable,
  Edit
} from 'lucide-react'

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

function AdminProductImage({ src, alt, brand, category }: { src: string; alt: string; brand: string; category: string }) {
  const [hasError, setHasError] = useState(false)
  const resolvedSrc = getImageUrl(src)

  if (hasError || !src) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-slate-950">
        {category && category.includes('Laptops') ? (
          <Laptop className="w-10 h-10 text-slate-700 mb-1" />
        ) : category && category.includes('Wearables') ? (
          <Watch className="w-10 h-10 text-slate-700 mb-1" />
        ) : category && category.includes('Accessories') ? (
          <Cable className="w-10 h-10 text-slate-700 mb-1" />
        ) : (
          <Smartphone className="w-10 h-10 text-slate-700 mb-1" />
        )}
        <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">{brand}</span>
      </div>
    )
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      onError={() => setHasError(true)}
      className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-300"
    />
  )
}

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
  description?: string
}

interface User {
  email: string
  role: 'admin' | 'user'
  name: string
  phone?: string
  status?: string
  joinedDate?: string
  password?: string
}

interface Order {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  itemsCount: number
  itemsList: string[]
  total: number
  status: 'Fulfilled' | 'Pending'
  date: string
}

interface AdminPanelProps {
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
  currentView: 'showroom' | 'login' | 'admin'
  setCurrentView: (view: 'showroom' | 'login' | 'admin') => void
  dbProducts: Product[]
  setDbProducts: React.Dispatch<React.SetStateAction<Product[]>>
  users: User[]
  setUsers: React.Dispatch<React.SetStateAction<User[]>>
  toggleFlashSaleStatus: (id: number, currentStatus: boolean) => Promise<void> | void
  handleDeleteProduct: (id: number, title: string) => Promise<void> | void
  fetchProducts: () => Promise<void> | void
  fetchUsers?: () => Promise<void> | void
  showToast: (message: string) => void
}

export default function AdminPanel({
  currentUser,
  setCurrentUser,
  setCurrentView,
  dbProducts,
  setDbProducts,
  users,
  setUsers: _setUsers,
  toggleFlashSaleStatus,
  handleDeleteProduct,
  fetchProducts,
  fetchUsers,
  showToast
}: AdminPanelProps) {
  // Page routing state
  const [activePage, setActivePage] = useState<'dashboard' | 'products' | 'add-product' | 'flash-sale' | 'settings' | 'inventory' | 'orders' | 'users'>('dashboard')

  // Search and filter states
  const [productsSearch, setProductsSearch] = useState('')
  const [productsCategory, setProductsCategory] = useState('All')
  const [productsBrand, setProductsBrand] = useState('All')
  const [productsSort, setProductsSort] = useState<'price-asc' | 'price-desc' | 'title-asc'>('title-asc')

  // Add/Edit Product Form states
  const [editingProductId, setEditingProductId] = useState<number | null>(null)
  const [formName, setFormName] = useState('')
  const [formPrice, setFormPrice] = useState('')
  const [formOriginalPrice, setFormOriginalPrice] = useState('')
  const [formBrand, setFormBrand] = useState('Apple')
  const [formCategory, setFormCategory] = useState('Apple iPhones')
  const [formSubcategory, setFormSubcategory] = useState('Flagship')
  const [formStorage, setFormStorage] = useState('256GB')
  const [formNote, setFormNote] = useState('Available')
  const [formDescription, setFormDescription] = useState('')
  const [formImageUrl, setFormImageUrl] = useState('/products/iphone17.jpg')
  const [formIsFlashSale, setFormIsFlashSale] = useState(false)
  const [uploadedImagesCount, setUploadedImagesCount] = useState(0)

  // File upload state
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isUploadingSlide, setIsUploadingSlide] = useState<number | null>(null)

  // Flash Sale settings states
  const [flashSaleStatus, setFlashSaleStatus] = useState(true)
  const [flashSaleEndTime, setFlashSaleEndTime] = useState('2026-07-05T23:59')

  // Website settings states
  const [usdToKesRate, setUsdToKesRate] = useState(130)
  const [overlayOpacity, setOverlayOpacity] = useState(40) // slider: 0 to 100
  const [sectionHeight, setSectionHeight] = useState(320) // slider: 200 to 500 px
  const [savingRate, setSavingRate] = useState(false)

  // Homepage Hero Banners state
  const [adminHeroSlides, setAdminHeroSlides] = useState<Array<{
    id: number
    title: string
    subtitle: string
    tag: string
    badge: string
    imageUrl: string
    buttonText: string
  }>>([
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
  ])

  // Orders states
  const [ordersSearch, setOrdersSearch] = useState('')
  const [ordersStatusFilter, setOrdersStatusFilter] = useState<'All' | 'Fulfilled' | 'Pending'>('All')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orders, setOrders] = useState<Order[]>([])

  // User management states
  const [usersSearch, setUsersSearch] = useState('')
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
  const [newUserName, setNewUserName] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserPhone, setNewUserPhone] = useState('')
  const [newUserRole, setNewUserRole] = useState<'admin' | 'user'>('user')

  // Notification states
  const [notifications, setNotifications] = useState<any[]>([])
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  // Chart loading / refreshing states
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch orders from Express backend API
  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders')
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
        
        // Generate notifications based on real orders
        const pendingOrders = data.filter((o: any) => o.status === 'Pending')
        const newNotifications = pendingOrders.map((o: any, index: number) => ({
          id: index + 1,
          title: 'Pending order validation',
          desc: `Order ${o.id} totals KSh ${o.total.toLocaleString()}`,
          time: 'Just now',
          read: false
        }))
        setNotifications(newNotifications)
      }
    } catch (err) {
      console.warn("Could not fetch orders from server database.")
    }
  }

  useEffect(() => {
    fetchOrders()
    fetchSettings()
    if (fetchProducts) fetchProducts()
    if (fetchUsers) fetchUsers()
  }, [])

  // Load website settings from backend
  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      if (res.ok) {
        const data = await res.json()
        if (data.usdToKesRate) setUsdToKesRate(Number(data.usdToKesRate))
        if (data.overlayOpacity !== undefined) setOverlayOpacity(Number(data.overlayOpacity))
        if (data.sectionHeight) setSectionHeight(Number(data.sectionHeight))
        if (data.heroSlides) setAdminHeroSlides(data.heroSlides)
      }
    } catch (err) {
      console.warn('Failed to load settings from server.')
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  // Function to refresh admin data
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      if (fetchProducts) await fetchProducts()
      if (fetchUsers) await fetchUsers()
      await fetchOrders()
      await fetchSettings()
      showToast('Admin database records refreshed!')
    } catch (e) {
      showToast('Refresh failed.')
    } finally {
      setIsRefreshing(false)
    }
  }

  // Auto-Generate Product Description using Groq AI with a local fallback
  const handleAutoGenerateDescription = async () => {
    if (!formName) {
      showToast('Please enter a Product Name first to auto-generate!')
      return
    }
    showToast('Generating AI copy via Groq...')
    try {
      const res = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formName,
          brand: formBrand,
          category: formCategory,
          storage: formStorage
        })
      })
      if (res.ok) {
        const data = await res.json()
        setFormDescription(data.description)
        showToast(data.note || '✨ Premium description auto-generated!')
      } else {
        showToast('AI Generation failed on backend.')
      }
    } catch (err) {
      showToast('AI Generation offline.')
    }
  }

  // Handle Real Cloudinary / local server File Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    showToast('Uploading image to Cloudinary/server...')
    
    const formData = new FormData()
    formData.append('image', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      if (res.ok) {
        const data = await res.json()
        setFormImageUrl(data.imageUrl)
        setUploadedImagesCount(1)
        showToast('Image uploaded successfully!')
      } else {
        showToast('Upload failed on backend.')
      }
    } catch (err) {
      showToast('Upload failed. Server offline.')
    } finally {
      setIsUploading(false)
    }
  }

  // Handle uploading slide image from storage directly
  const handleSlideImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, slideIndex: number) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingSlide(slideIndex)
    showToast('Uploading slide image to Cloudinary...')

    const formData = new FormData()
    formData.append('image', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      if (res.ok) {
        const data = await res.json()
        const newSlides = [...adminHeroSlides]
        newSlides[slideIndex].imageUrl = data.imageUrl
        setAdminHeroSlides(newSlides)
        showToast(`Slide #${slideIndex + 1} image uploaded successfully!`)
      } else {
        showToast('Upload failed on server.')
      }
    } catch (err) {
      showToast('Upload failed. Server offline.')
    } finally {
      setIsUploadingSlide(null)
    }
  }

  const resetForm = () => {
    setEditingProductId(null)
    setFormName('')
    setFormPrice('')
    setFormOriginalPrice('')
    setFormBrand('Apple')
    setFormCategory('Apple iPhones')
    setFormSubcategory('Flagship')
    setFormStorage('256GB')
    setFormNote('Available')
    setFormDescription('')
    setFormImageUrl('/products/iphone17.jpg')
    setFormIsFlashSale(false)
    setUploadedImagesCount(0)
  }

  const handleStartEditProduct = (product: Product) => {
    setEditingProductId(product.id)
    setFormName(product.title)
    setFormPrice(String(product.price))
    setFormOriginalPrice(String(product.originalPrice || product.price))
    setFormBrand(product.brand)
    setFormCategory(product.category)
    setFormStorage(product.storage)
    setFormNote(product.note)
    setFormDescription(product.description || '')
    setFormImageUrl(product.imageUrl)
    setFormIsFlashSale(product.isFlashSale)
    setUploadedImagesCount(product.imageUrl ? 1 : 0)
    
    setActivePage('add-product')
  }

  // Handle Add/Edit Product Submit (MongoDB synced)
  const onAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName || !formPrice) {
      showToast('Product Name and Price are required!')
      return
    }

    const payload = {
      title: formName,
      brand: formBrand,
      category: formCategory,
      price: Number(formPrice),
      originalPrice: Number(formOriginalPrice) || Number(formPrice),
      storage: formStorage,
      note: formNote,
      imageUrl: formImageUrl,
      isFlashSale: formIsFlashSale,
      description: formDescription
    }

    if (editingProductId !== null) {
      // Edit mode
      try {
        const res = await fetch(`/api/products/${editingProductId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        if (res.ok) {
          showToast(`Successfully updated "${formName}"!`)
          if (fetchProducts) await fetchProducts()
        } else {
          showToast('Failed to update product on server.')
        }
      } catch (err) {
        // Fallback local modification
        setDbProducts(prev => prev.map(p => p.id === editingProductId ? { ...p, ...payload, id: editingProductId, discountPercentage: payload.originalPrice ? Math.round(((payload.originalPrice - payload.price) / payload.originalPrice) * 100) : 0 } : p))
        showToast('Updated locally! (Server offline)')
      }
    } else {
      // Add mode
      try {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        if (res.ok) {
          showToast(`Successfully added "${formName}" to inventory!`)
          if (fetchProducts) await fetchProducts()
        } else {
          showToast('Failed to save product to server.')
        }
      } catch (err) {
        // Fallback local mock addition
        const mockProduct: Product = {
          ...payload,
          id: Date.now(),
          discountPercentage: payload.originalPrice ? Math.round(((payload.originalPrice - payload.price) / payload.originalPrice) * 100) : 0,
          rating: 5.0
        }
        setDbProducts(prev => [mockProduct, ...prev])
        showToast('Added locally! (Server offline)')
      }
    }

    resetForm()
    setActivePage('inventory')
  }

  // Handle Add User Submit
  const onAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUserName || !newUserEmail) {
      showToast('Name and Email are required!')
      return
    }

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          role: newUserRole,
          password: 'user123'
        })
      })
      if (res.ok) {
        showToast(`Registered user "${newUserName}" successfully!`)
        if (fetchUsers) await fetchUsers()
      } else {
        const errData = await res.json()
        showToast(errData.error || 'Failed to create user.')
      }
    } catch (err) {
      showToast('Could not register user. Network offline.')
    }

    // Reset form & close modal
    setNewUserName('')
    setNewUserEmail('')
    setNewUserPhone('')
    setNewUserRole('user')
    setIsAddUserModalOpen(false)
  }

  // Handle Delete User
  const onDeleteUser = async (email: string, name: string) => {
    if (currentUser && currentUser.email === email) {
      showToast('You cannot delete your own logged-in account!')
      return
    }
    if (!confirm(`Are you sure you want to delete user "${name}"?`)) return
    try {
      const res = await fetch(`/api/users/${email}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        showToast(`User "${name}" deleted.`)
        if (fetchUsers) await fetchUsers()
      } else {
        showToast('Failed to delete user.')
      }
    } catch (err) {
      showToast('Delete failed. Server offline.')
    }
  }

  // Handle Clear Abandoned orders (clears pending orders)
  const handleClearAbandoned = () => {
    const pendingCount = orders.filter(o => o.status === 'Pending').length
    if (pendingCount === 0) {
      showToast('No pending orders to clear!')
      return
    }
    if (!confirm(`Are you sure you want to clear all ${pendingCount} pending/abandoned orders?`)) return
    setOrders(prev => prev.filter(o => o.status !== 'Pending'))
    showToast(`Successfully cleared all pending orders.`)
  }



  // Calculated numbers
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status === 'Fulfilled' ? o.total : 0), 0)
  const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length
  const totalProductsValue = dbProducts.reduce((sum, p) => sum + p.price, 0)

  // Filtered Products for Products page
  const filteredProducts = dbProducts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(productsSearch.toLowerCase()) || p.brand.toLowerCase().includes(productsSearch.toLowerCase())
    const matchesCategory = productsCategory === 'All' || p.category === productsCategory
    const matchesBrand = productsBrand === 'All' || p.brand === productsBrand
    return matchesSearch && matchesCategory && matchesBrand
  }).sort((a, b) => {
    if (productsSort === 'price-asc') return a.price - b.price
    if (productsSort === 'price-desc') return b.price - a.price
    return a.title.localeCompare(b.title)
  })

  // Filtered Orders
  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.customerName.toLowerCase().includes(ordersSearch.toLowerCase()) || o.customerEmail.toLowerCase().includes(ordersSearch.toLowerCase()) || o.id.toLowerCase().includes(ordersSearch.toLowerCase())
    const matchesStatus = ordersStatusFilter === 'All' || o.status === ordersStatusFilter
    return matchesSearch && matchesStatus
  })

  // Filtered Users
  const filteredUsers = users.filter(u => {
    return u.name.toLowerCase().includes(usersSearch.toLowerCase()) || u.email.toLowerCase().includes(usersSearch.toLowerCase()) || (u.phone && u.phone.includes(usersSearch))
  })

  // Category list derived from products
  const uniqueCategories = Array.from(new Set(dbProducts.map(p => p.category)))

  return (
    <div className="flex w-full min-h-screen relative overflow-hidden bg-slate-950 text-slate-100 font-sans">
      
      {/* 1. LEFT SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between hidden lg:flex">
        
        {/* Sidebar Top: Logo & Navigation */}
        <div className="flex flex-col gap-6 p-6">
          {/* Logo Placeholder */}
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-lg">
              CS
            </div>
            <div>
              <h2 className="text-md font-black tracking-wider text-slate-100">Cent Store</h2>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Admin Panel</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            <button
              onClick={() => setActivePage('dashboard')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activePage === 'dashboard'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>

            <button
              onClick={() => setCurrentView('showroom')}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all duration-200 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              Shop View
            </button>

            <button
              onClick={() => setActivePage('products')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activePage === 'products'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Package className="w-4 h-4" />
              Products
            </button>

            <button
              onClick={() => setActivePage('add-product')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activePage === 'add-product'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              {editingProductId !== null ? 'Edit Product' : 'Add Product'}
            </button>

            <button
              onClick={() => setActivePage('flash-sale')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activePage === 'flash-sale'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Zap className="w-4 h-4" />
              Flash Sale
            </button>

            <button
              onClick={() => setActivePage('settings')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activePage === 'settings'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Sliders className="w-4 h-4" />
              Website Settings
            </button>

            <button
              onClick={() => setActivePage('inventory')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activePage === 'inventory'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Database className="w-4 h-4" />
              Inventory
            </button>

            <button
              onClick={() => { setActivePage('orders'); setOrdersStatusFilter('Pending'); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activePage === 'orders' && ordersStatusFilter === 'Pending'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              Carts
            </button>

            <button
              onClick={() => { setActivePage('orders'); setOrdersStatusFilter('All'); }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activePage === 'orders' && ordersStatusFilter !== 'Pending'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              Orders
            </button>

            <button
              onClick={() => setActivePage('users')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activePage === 'users'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <UsersIcon className="w-4 h-4" />
              Users
            </button>
          </nav>
        </div>

        {/* Sidebar Bottom: Profile & Logout */}
        <div className="p-4 border-t border-slate-800 flex flex-col gap-4">
          <div className="flex items-center gap-3 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/50">
            <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-slate-950">
              {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('') : 'AD'}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-200 truncate">{currentUser?.name || 'Administrator'}</h4>
              <p className="text-[10px] text-slate-500 truncate">{currentUser?.email || 'admin@centstore.co.ke'}</p>
            </div>
          </div>

          <button
            onClick={() => {
              setCurrentUser(null)
              setCurrentView('showroom')
              showToast('Logged out of Admin Console successfully.')
            }}
            className="w-full py-2 bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-900/30 hover:border-red-900/50 font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* MOBILE BAR (sticky top on small screens only) */}
      <div className="lg:hidden fixed top-0 inset-x-0 h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-black text-sm">
            CS
          </div>
          <span className="font-black text-sm tracking-widest text-slate-100">CENT STORE</span>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={activePage}
            onChange={(e) => setActivePage(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2 py-1.5 focus:outline-none"
          >
            <option value="dashboard">Dashboard</option>
            <option value="products">Products</option>
            <option value="add-product">Add Product</option>
            <option value="flash-sale">Flash Sale</option>
            <option value="settings">Website Settings</option>
            <option value="inventory">Inventory</option>
            <option value="orders">Orders</option>
            <option value="users">Users</option>
          </select>

          <button
            onClick={() => setCurrentView('showroom')}
            className="p-1.5 text-slate-400 hover:text-slate-100 bg-slate-800 rounded-lg"
            title="Return to Shop"
          >
            <Eye className="w-4.5 h-4.5" />
          </button>

          <button
            onClick={() => {
              setCurrentUser(null)
              setCurrentView('showroom')
              showToast('Logged out of Admin Console')
            }}
            className="p-1.5 text-red-400 bg-red-950/20 border border-red-900/30 rounded-lg"
            title="Logout"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* 2. MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-h-screen lg:pl-64 pt-16 lg:pt-0">
        
        {/* Top Header */}
        <header className="sticky top-0 z-20 h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 shadow-md shadow-slate-950/10">
          
          {/* Header Search (Center layout) */}
          <div className="flex-1 max-w-md relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search administration data..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
              value={
                activePage === 'products' ? productsSearch :
                activePage === 'orders' ? ordersSearch :
                activePage === 'users' ? usersSearch : ''
              }
              onChange={(e) => {
                const val = e.target.value
                if (activePage === 'products') setProductsSearch(val)
                else if (activePage === 'orders') setOrdersSearch(val)
                else if (activePage === 'users') setUsersSearch(val)
              }}
            />
          </div>
          <div className="md:hidden flex-1"></div>

          {/* Header Utilities (Right side) */}
          <div className="flex items-center gap-4">
            
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationsMenu(!showNotificationsMenu)}
                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-xl transition-all cursor-pointer relative"
              >
                <Bell className="w-4.5 h-4.5" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-slate-900"></span>
                )}
              </button>

              {showNotificationsMenu && (
                <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-2">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300">Notifications</h4>
                    <button
                      onClick={() => {
                        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
                        showToast('All notifications marked read.')
                      }}
                      className="text-[10px] text-emerald-400 hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="flex flex-col gap-2 max-h-60 overflow-y-auto scrollbar-thin">
                    {notifications.map(n => (
                      <div
                        key={n.id}
                        className={`p-2.5 rounded-xl border transition-all text-left ${
                          n.read ? 'bg-slate-900/30 border-transparent' : 'bg-slate-800/40 border-slate-800'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <h5 className={`text-xs font-bold ${n.read ? 'text-slate-400' : 'text-slate-200'}`}>{n.title}</h5>
                          <span className="text-[9px] text-slate-500 whitespace-nowrap">{n.time}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 leading-normal">{n.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1 px-2.5 hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
              >
                <div className="w-7.5 h-7.5 rounded-lg bg-emerald-500 flex items-center justify-center font-extrabold text-slate-950 text-xs">
                  {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('') : 'AD'}
                </div>
                <span className="text-xs font-bold text-slate-300 hidden sm:inline-block">Admin Console</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-56 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl z-50 text-xs space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="pb-2.5 border-b border-slate-800">
                    <h5 className="font-bold text-slate-200">{currentUser?.name || 'Administrator'}</h5>
                    <p className="text-[10px] text-slate-500 mt-0.5">{currentUser?.email || 'admin@centstore.co.ke'}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => { setActivePage('settings'); setShowProfileMenu(false); }}
                      className="w-full text-left py-2 px-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      Website Settings
                    </button>
                    <button
                      onClick={() => { setCurrentView('showroom'); setShowProfileMenu(false); }}
                      className="w-full text-left py-2 px-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      Return to Showcase
                    </button>
                    <button
                      onClick={() => {
                        setCurrentUser(null)
                        setCurrentView('showroom')
                        showToast('Logged out of Admin Console')
                      }}
                      className="w-full text-left py-2 px-2 hover:bg-red-950/20 text-red-400 hover:text-red-300 rounded-lg transition-colors border-t border-slate-800/60 mt-1"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          
          {/* ==================== PAGE 1: DASHBOARD OVERVIEW ==================== */}
          {activePage === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
                <div className="space-y-1">
                  <h1 className="text-2xl font-black text-slate-100 tracking-tight">Dashboard Overview</h1>
                  <p className="text-xs text-slate-400">Welcome back, <span className="font-bold text-emerald-400">{currentUser?.name || 'Executive Admin'}</span>. Here is the Store Analytics summary today.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActivePage('add-product')}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-500/10 cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Add Product
                  </button>
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="px-4 py-2 border border-slate-800 hover:bg-slate-900 hover:border-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh
                  </button>
                </div>
              </div>

              {/* AI Smart Insights */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-2 flex items-start sm:items-center flex-col sm:flex-row gap-4 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-full bg-blue-500/5 -skew-x-12 translate-x-4"></div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="flex-1 space-y-1 z-10">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-100">Inventory Insights</h3>
                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-blue-600 text-white">✨ AI Agent</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Stock anomaly detected: <span className="text-slate-300 font-semibold">OnePlus 15 5G</span> is trending 40% higher than average this week. Consider restocking before the weekend.
                  </p>
                </div>
                <button className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs rounded-xl transition-all z-10 min-h-[44px]">
                  Review Forecast
                </button>
              </div>

              {/* Metric Cards Grid (6 cards) */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                
                {/* 1. Total Revenue */}
                <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-2xl flex flex-col justify-between hover:border-slate-700/60 transition-colors shadow-sm">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Total Revenue</span>
                    <h3 className="text-lg font-black text-slate-100 mt-1.5 truncate">KSh {totalRevenue.toLocaleString()}</h3>
                  </div>
                  <div className="flex items-center gap-1 mt-3 text-emerald-400 font-bold text-[10px]">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+12%</span>
                    <span className="text-slate-500 font-normal">vs last month</span>
                  </div>
                </div>

                {/* 2. Total Users */}
                <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-2xl flex flex-col justify-between hover:border-slate-700/60 transition-colors shadow-sm">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Total Users</span>
                    <h3 className="text-lg font-black text-slate-100 mt-1.5 truncate">{users.length}</h3>
                  </div>
                  <div className="flex items-center gap-1 mt-3 text-emerald-400 font-bold text-[10px]">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+8%</span>
                    <span className="text-slate-500 font-normal">vs last month</span>
                  </div>
                </div>

                {/* 3. Total Products */}
                <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-2xl flex flex-col justify-between hover:border-slate-700/60 transition-colors shadow-sm">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Total Products</span>
                    <h3 className="text-lg font-black text-slate-100 mt-1.5 truncate">{dbProducts.length}</h3>
                  </div>
                  <div className="flex items-center gap-1 mt-3 text-emerald-400 font-bold text-[10px]">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+4%</span>
                    <span className="text-slate-500 font-normal">vs last month</span>
                  </div>
                </div>

                {/* 4. Total Orders */}
                <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-2xl flex flex-col justify-between hover:border-slate-700/60 transition-colors shadow-sm">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Total Orders</span>
                    <h3 className="text-lg font-black text-slate-100 mt-1.5 truncate">{orders.length}</h3>
                  </div>
                  <div className="flex items-center gap-1 mt-3 text-emerald-400 font-bold text-[10px]">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+18%</span>
                    <span className="text-slate-500 font-normal">vs last month</span>
                  </div>
                </div>

                {/* 5. Pending Orders */}
                <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-2xl flex flex-col justify-between hover:border-slate-700/60 transition-colors shadow-sm">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Pending Orders</span>
                    <h3 className="text-lg font-black text-slate-100 mt-1.5 truncate">{pendingOrdersCount}</h3>
                  </div>
                  <div className="flex items-center gap-1 mt-3 text-emerald-400 font-bold text-[10px]">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+0%</span>
                    <span className="text-slate-500 font-normal">vs last month</span>
                  </div>
                </div>

                {/* 6. New Users Today */}
                <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-2xl flex flex-col justify-between hover:border-slate-700/60 transition-colors shadow-sm">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">New Users Today</span>
                    <h3 className="text-lg font-black text-slate-100 mt-1.5 truncate">8</h3>
                  </div>
                  <div className="flex items-center gap-1 mt-3 text-emerald-400 font-bold text-[10px]">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+5%</span>
                    <span className="text-slate-500 font-normal">vs last month</span>
                  </div>
                </div>

              </div>

              {/* Charts Section */}
              <div className="grid lg:grid-cols-12 gap-6">
                
                {/* 1. Earning Reports (Weekly, 2 cols / span 8) */}
                <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <div>
                      <h3 className="text-sm font-black uppercase text-slate-350 tracking-wider">Earning Reports</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">Weekly revenue trends across categories</p>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-lg flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" /> +12.5% Growth
                    </span>
                  </div>

                  {/* Interactive mock weekly bar chart */}
                  <div className="h-60 flex items-end justify-between pt-6 px-4">
                    {[
                      { day: 'Mon', value: 120000, height: 'h-[40%]' },
                      { day: 'Tue', value: 165000, height: 'h-[55%]' },
                      { day: 'Wed', value: 95000, height: 'h-[32%]' },
                      { day: 'Thu', value: 210000, height: 'h-[70%]' },
                      { day: 'Fri', value: 285000, height: 'h-[95%]' },
                      { day: 'Sat', value: 180000, height: 'h-[60%]' },
                      { day: 'Sun', value: 240000, height: 'h-[80%]' }
                    ].map((bar, i) => (
                      <div key={i} className="flex flex-col items-center gap-2.5 w-10 group cursor-pointer">
                        {/* Tooltip on hover */}
                        <div className="opacity-0 group-hover:opacity-100 absolute mb-28 bg-slate-950 border border-slate-800 text-[9px] font-mono text-emerald-400 px-2 py-1 rounded transition-opacity duration-200 pointer-events-none">
                          KSh {bar.value.toLocaleString()}
                        </div>
                        {/* Bar */}
                        <div className="w-7.5 bg-slate-850 hover:bg-emerald-500 rounded-lg flex items-end overflow-hidden transition-all duration-300 h-48">
                          <div className={`w-full bg-emerald-500/85 hover:bg-emerald-450 ${bar.height} rounded-t-lg transition-all duration-300`}></div>
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase">{bar.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Sales by Category (span 4) */}
                <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="pb-2 border-b border-slate-800">
                    <h3 className="text-sm font-black uppercase text-slate-350 tracking-wider">Sales by Category</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Demographics distribution of hardware orders</p>
                  </div>

                  {/* SVG Pie Chart Mock */}
                  <div className="flex justify-center items-center py-2">
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        {/* iPhones - 55% */}
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="12" strokeDasharray="172.7 251.2" />
                        {/* Samsung - 25% */}
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3b82f6" strokeWidth="12" strokeDasharray="78.5 251.2" strokeDashoffset="-172.7" />
                        {/* Wearables - 12% */}
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#eab308" strokeWidth="12" strokeDasharray="37.7 251.2" strokeDashoffset="-251.2" />
                        {/* Others - 8% */}
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ec4899" strokeWidth="12" strokeDasharray="25.1 251.2" strokeDashoffset="-288.9" />
                      </svg>
                      {/* Center circle */}
                      <div className="absolute w-24 h-24 bg-slate-900 rounded-full flex flex-col items-center justify-center border border-slate-800">
                        <span className="text-[10px] uppercase font-bold text-slate-500">Showcase</span>
                        <span className="text-sm font-black text-slate-200">55% Apple</span>
                      </div>
                    </div>
                  </div>

                  {/* Legend list */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] pt-2 border-t border-slate-800/50">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></span>
                      <span className="text-slate-400 font-medium truncate">iPhones (55%)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></span>
                      <span className="text-slate-400 font-medium truncate">Samsung (25%)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-yellow-500 rounded-sm"></span>
                      <span className="text-slate-400 font-medium truncate">Wearables (12%)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-pink-500 rounded-sm"></span>
                      <span className="text-slate-400 font-medium truncate">Others (8%)</span>
                    </div>
                  </div>
                </div>

                {/* 3. Monthly Sales (span 12) */}
                <div className="lg:col-span-12 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <div>
                      <h3 className="text-sm font-black uppercase text-slate-350 tracking-wider">Monthly Sales</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">Jan - Jun consolidated store operations</p>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>This Year</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-700"></span>
                        <span>Last Year</span>
                      </div>
                    </div>
                  </div>

                  {/* SVG line graph mock */}
                  <div className="h-44 relative w-full pt-4">
                    <svg className="w-full h-full" viewBox="0 0 600 120" preserveAspectRatio="none">
                      {/* Grid lines */}
                      <line x1="0" y1="20" x2="600" y2="20" stroke="#1e293b" strokeWidth="0.5" />
                      <line x1="0" y1="60" x2="600" y2="60" stroke="#1e293b" strokeWidth="0.5" />
                      <line x1="0" y1="100" x2="600" y2="100" stroke="#1e293b" strokeWidth="0.5" />

                      {/* Area under curve */}
                      <path
                        d="M0,120 L0,90 L100,75 L200,95 L300,50 L400,35 L500,45 L600,15 L600,120 Z"
                        fill="url(#emerald-gradient)"
                        opacity="0.1"
                      />

                      {/* Last year line */}
                      <path
                        d="M0,105 L100,90 L200,85 L300,95 L400,65 L500,60 L600,50"
                        fill="transparent"
                        stroke="#475569"
                        strokeWidth="1.5"
                        strokeDasharray="4 2"
                      />

                      {/* This year line */}
                      <path
                        d="M0,90 L100,75 L200,95 L300,50 L400,35 L500,45 L600,15"
                        fill="transparent"
                        stroke="#10b981"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Defs for gradient */}
                      <defs>
                        <linearGradient id="emerald-gradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Month labels */}
                    <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase mt-2.5 px-1">
                      <span>Jan</span>
                      <span>Feb</span>
                      <span>Mar</span>
                      <span>Apr</span>
                      <span>May</span>
                      <span>Jun</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ==================== PAGE 2: PRODUCTS PAGE ==================== */}
          {activePage === 'products' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
                <div className="space-y-1">
                  <h1 className="text-2xl font-black text-slate-100 tracking-tight">Products Management</h1>
                  <p className="text-xs text-slate-400">Manage catalog displays, prices, discounts, and flash sales states.</p>
                </div>
                <button
                  onClick={() => setActivePage('add-product')}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-500/10 cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Product
                </button>
              </div>

              {/* KPI Summary (5 cards) */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Total Products</span>
                  <div className="flex items-center justify-between mt-1">
                    <h4 className="text-md font-black text-slate-100">{dbProducts.length}</h4>
                    <span className="text-[9px] text-emerald-400 font-bold flex items-center"><TrendingUp className="w-3 h-3 mr-0.5" /> Active</span>
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-slate-500">In Stock</span>
                  <div className="flex items-center justify-between mt-1">
                    <h4 className="text-md font-black text-slate-100">{dbProducts.length - 2}</h4>
                    <span className="text-[9px] text-emerald-400 font-bold">Stable</span>
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Low Stock</span>
                  <div className="flex items-center justify-between mt-1">
                    <h4 className="text-md font-black text-slate-100">2</h4>
                    <span className="text-[9px] text-yellow-500 font-bold">Refill</span>
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Out of Stock</span>
                  <div className="flex items-center justify-between mt-1">
                    <h4 className="text-md font-black text-slate-100">0</h4>
                    <span className="text-[9px] text-red-500 font-bold">Alert</span>
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Total Value</span>
                  <div className="flex items-center justify-between mt-1">
                    <h4 className="text-md font-black text-slate-100">KSh {totalProductsValue >= 1000000 ? `${(totalProductsValue / 1000000).toFixed(1)}M` : totalProductsValue.toLocaleString()}</h4>
                    <span className="text-[9px] text-emerald-400 font-bold flex items-center"><ArrowUpRight className="w-3 h-3" /> Equity</span>
                  </div>
                </div>
              </div>

              {/* Controls bar */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
                
                {/* Search Bar */}
                <div className="w-full md:w-80 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search name, brand, spec..."
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
                    value={productsSearch}
                    onChange={(e) => setProductsSearch(e.target.value)}
                  />
                </div>

                {/* Dropdowns */}
                <div className="flex flex-wrap w-full md:w-auto items-center gap-3">
                  <select
                    className="bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
                    value={productsCategory}
                    onChange={(e) => setProductsCategory(e.target.value)}
                  >
                    <option value="All">All Categories</option>
                    {uniqueCategories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                  <select
                    className="bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
                    value={productsBrand}
                    onChange={(e) => setProductsBrand(e.target.value)}
                  >
                    <option value="All">All Brands</option>
                    <option value="Apple">Apple</option>
                    <option value="Samsung">Samsung</option>
                    <option value="OnePlus">OnePlus</option>
                    <option value="Redmi">Redmi</option>
                    <option value="Anker">Anker</option>
                  </select>

                  <select
                    className="bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
                    value={productsSort}
                    onChange={(e) => setProductsSort(e.target.value as any)}
                  >
                    <option value="title-asc">Sort: A-Z</option>
                    <option value="price-asc">Sort: Price Low-High</option>
                    <option value="price-desc">Sort: Price High-Low</option>
                  </select>
                </div>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map((p) => {
                  return (
                    <div
                      key={p.id}
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-300 relative group overflow-hidden"
                    >
                      {/* Note Tag */}
                      <span className="absolute top-2 left-2 z-10 px-2 py-0.5 text-[9px] font-black bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-md">
                        {p.note || "Active"}
                      </span>

                      {/* Flash Sale Badge */}
                      {p.isFlashSale && (
                        <span className="absolute top-2 right-2 z-10 p-1 bg-orange-500 rounded-md text-slate-950" title="Flash Sale Item">
                          <Zap className="w-3.5 h-3.5 fill-current" />
                        </span>
                      )}

                      {/* Product Image fallback container */}
                      <div className="w-full h-36 bg-slate-950 rounded-xl mb-4 overflow-hidden flex items-center justify-center border border-slate-800 relative">
                        <AdminProductImage src={p.imageUrl} alt={p.title} brand={p.brand} category={p.category} />
                      </div>

                      {/* Card Content */}
                      <div className="space-y-2 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-[9px] text-emerald-400 font-bold uppercase">{p.brand} • {p.storage || 'Standard'}</p>
                          <h4 className="text-xs font-bold text-slate-200 mt-1 line-clamp-2 leading-relaxed min-h-[36px]">
                            {p.title}
                          </h4>
                          <span className="inline-block mt-1.5 px-2 py-0.5 bg-slate-850 text-slate-400 text-[9px] rounded font-bold uppercase">
                            {p.category}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-slate-850/60">
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm font-black text-slate-100">KSh {p.price.toLocaleString()}</span>
                            {p.originalPrice > p.price && (
                              <span className="text-[10px] text-slate-500 line-through">KSh {p.originalPrice.toLocaleString()}</span>
                            )}
                          </div>

                          {/* Color variant swatches (Premium design) */}
                          <div className="flex gap-1.5 mt-3">
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 border border-slate-900 cursor-pointer" title="Silver"></span>
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-700 border border-slate-900 cursor-pointer" title="Space Gray"></span>
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 border border-slate-900 cursor-pointer" title="Emerald Green"></span>
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 border border-slate-900 cursor-pointer" title="Gold"></span>
                          </div>

                          {/* Action Overlay buttons */}
                          <div className="flex gap-2 mt-4 pt-1.5 border-t border-slate-850/30">
                            <button
                              type="button"
                              onClick={() => toggleFlashSaleStatus(p.id, p.isFlashSale)}
                              className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                                p.isFlashSale
                                  ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                  : 'bg-slate-800 border-transparent text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              <Zap className="w-3 h-3" />
                              {p.isFlashSale ? 'Active Sale' : 'Add Flash'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStartEditProduct(p)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-750 text-emerald-400 border border-slate-700/60 rounded-lg transition-all cursor-pointer"
                              title="Edit Product"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(p.id, p.title)}
                              className="p-1.5 bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-900/30 hover:border-red-900/50 rounded-lg transition-all cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>
                  )
                })}
              </div>

            </div>
          )}          {/* ==================== PAGE 3: ADD PRODUCT FORM ==================== */}
          {activePage === 'add-product' && (
            <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
              
              {/* Header */}
              <div className="pb-4 border-b border-slate-800">
                <h1 className="text-2xl font-black text-slate-100 tracking-tight">
                  {editingProductId !== null ? 'Edit Product' : 'Add New Product'}
                </h1>
                <p className="text-xs text-slate-400">
                  {editingProductId !== null 
                    ? `Modify specifications and deployment variables for Product ID: ${editingProductId}`
                    : 'Insert new electronic goods or smartphone flagships into Cent Store inventory.'}
                </p>
              </div>

              <form onSubmit={onAddProductSubmit} className="grid md:grid-cols-12 gap-6">
                
                {/* Left side: Media upload (span 5) */}
                <div className="md:col-span-5 space-y-6">
                  
                  {/* Media Upload Container */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-450">Product Images</h3>
                    
                    <div className="flex flex-col gap-3">
                      {/* Hidden File Input */}
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                      />

                      {/* Upload Box */}
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-44 bg-slate-950 border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-xl flex flex-col items-center justify-center p-4 cursor-pointer transition-all text-slate-400 hover:text-slate-200"
                      >
                        {isUploading ? (
                          <RefreshCw className="w-8 h-8 mb-2.5 text-emerald-400 animate-spin" />
                        ) : (
                          <Upload className="w-8 h-8 mb-2.5 text-slate-500" />
                        )}
                        <span className="text-xs font-bold uppercase tracking-wide">
                          {isUploading ? 'Uploading to Server...' : 'Upload Photo'}
                        </span>
                        <span className="text-[10px] text-slate-600 mt-1">Accepts PNG, JPG, WebP up to 5MB</span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-550 uppercase">
                        <span>Selected images: <span className="text-emerald-400 font-black">{uploadedImagesCount}</span></span>
                        {uploadedImagesCount > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setUploadedImagesCount(0)
                              setFormImageUrl('')
                            }}
                            className="text-red-400 hover:underline cursor-pointer"
                          >
                            Clear images
                          </button>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* Settings / Promotion Card */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-450">Promotion Options</h3>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-850/60">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-orange-500" />
                        <div>
                          <span className="text-xs font-bold text-slate-350">Add to Flash Sale</span>
                          <p className="text-[9px] text-slate-550">Promote to the high-traffic countdown slider</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setFormIsFlashSale(!formIsFlashSale)}
                        className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          formIsFlashSale ? 'bg-orange-500' : 'bg-slate-800'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            formIsFlashSale ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                </div>

                {/* Right side: Form Information (span 7) */}
                <div className="md:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-450 pb-2.5 border-b border-slate-800/80">Basic Information</h3>
                  
                  <div className="space-y-4">
                    
                    {/* Product Name */}
                    <div>
                      <label className="block text-slate-450 font-bold mb-1.5 text-[10px] uppercase tracking-wider">Product Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Apple iPhone 17 Pro Max"
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-3 focus:outline-none focus:border-emerald-500/50 text-xs"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                      />
                    </div>

                    {/* Price fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-450 font-bold mb-1.5 text-[10px] uppercase tracking-wider">Price (KES)</label>
                        <input
                          type="number"
                          required
                          placeholder="e.g. 177000"
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-3 focus:outline-none focus:border-emerald-500/50 text-xs"
                          value={formPrice}
                          onChange={(e) => setFormPrice(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-slate-450 font-bold mb-1.5 text-[10px] uppercase tracking-wider">Original Price (KES)</label>
                        <input
                          type="number"
                          placeholder="e.g. 185000"
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-3 focus:outline-none focus:border-emerald-500/50 text-xs"
                          value={formOriginalPrice}
                          onChange={(e) => setFormOriginalPrice(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Dropdowns row 1 */}
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-450 font-bold mb-1.5 text-[10px] uppercase tracking-wider">Category</label>
                        <select
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-3 focus:outline-none text-xs cursor-pointer"
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value)}
                        >
                          <option value="Apple iPhones">Apple iPhones</option>
                          <option value="Samsung Galaxy">Samsung Galaxy</option>
                          <option value="OnePlus & Redmi">OnePlus & Redmi</option>
                          <option value="MacBooks & Laptops">MacBooks & Laptops</option>
                          <option value="Smartwatches & Wearables">Smartwatches & Wearables</option>
                          <option value="Premium Accessories">Premium Accessories</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-450 font-bold mb-1.5 text-[10px] uppercase tracking-wider">Brand</label>
                        <select
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-3 focus:outline-none text-xs cursor-pointer"
                          value={formBrand}
                          onChange={(e) => setFormBrand(e.target.value)}
                        >
                          <option value="Apple">Apple</option>
                          <option value="Samsung">Samsung</option>
                          <option value="OnePlus">OnePlus</option>
                          <option value="Redmi">Redmi</option>
                          <option value="Anker">Anker</option>
                          <option value="Generic">Generic</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-450 font-bold mb-1.5 text-[10px] uppercase tracking-wider">Subcategory</label>
                        <select
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-3 focus:outline-none text-xs cursor-pointer"
                          value={formSubcategory}
                          onChange={(e) => setFormSubcategory(e.target.value)}
                        >
                          <option value="Flagship">Flagship</option>
                          <option value="Mid-range">Mid-range</option>
                          <option value="Budget">Budget</option>
                          <option value="Accessories">Accessories</option>
                        </select>
                      </div>
                    </div>

                    {/* Spec fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-450 font-bold mb-1.5 text-[10px] uppercase tracking-wider">Storage Capacity</label>
                        <input
                          type="text"
                          placeholder="e.g. 256GB / 16GB RAM"
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-3 focus:outline-none focus:border-emerald-500/50 text-xs"
                          value={formStorage}
                          onChange={(e) => setFormStorage(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-slate-450 font-bold mb-1.5 text-[10px] uppercase tracking-wider">Note tag label</label>
                        <input
                          type="text"
                          placeholder="e.g. Physical SIM - New"
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-3 focus:outline-none focus:border-emerald-500/50 text-xs"
                          value={formNote}
                          onChange={(e) => setFormNote(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Description with auto generate button inside */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-slate-450 font-bold text-[10px] uppercase tracking-wider">Product Description</label>
                        <button
                          type="button"
                          onClick={handleAutoGenerateDescription}
                          className="text-[10px] text-emerald-400 hover:text-emerald-350 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md cursor-pointer flex items-center gap-1 font-bold"
                        >
                          <Sparkles className="w-3 h-3 text-emerald-400" /> ✨ Auto-Generate via Groq AI
                        </button>
                      </div>
                      <textarea
                        rows={5}
                        placeholder="Write dynamic sales copy or click the helper auto-generate button above..."
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-3 focus:outline-none focus:border-emerald-500/50 text-xs leading-relaxed"
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                      />
                    </div>

                    {/* Image URL */}
                    <div>
                      <label className="block text-slate-450 font-bold mb-1.5 text-[10px] uppercase tracking-wider">Fallback Image URL</label>
                      <input
                        type="text"
                        placeholder="e.g. /products/iphone17.jpg"
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-3 focus:outline-none focus:border-emerald-500/50 text-xs"
                        value={formImageUrl}
                        onChange={(e) => setFormImageUrl(e.target.value)}
                      />
                    </div>

                    {/* Submit button */}
                    <div className="pt-4 flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          resetForm();
                          setActivePage('inventory');
                        }}
                        className="flex-1 py-3 border border-slate-800 hover:bg-slate-950 hover:border-slate-700 text-slate-400 hover:text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                      >
                        {editingProductId !== null ? 'Save Product Changes' : 'Save & Deploy to Live Catalog'}
                      </button>
                    </div>

                  </div>
                </div>

              </form>

            </div>
          )}

          {/* ==================== PAGE 4: FLASH SALE MANAGEMENT ==================== */}
          {activePage === 'flash-sale' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Header Gradient Card */}
              <div className="bg-gradient-to-r from-orange-600 to-red-650 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                {/* Decorative glow */}
                <div className="absolute right-0 top-0 w-80 h-full bg-white/5 skew-x-12 translate-x-20"></div>
                
                <div className="space-y-1.5 z-10">
                  <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                    <Zap className="w-6 h-6 fill-current text-amber-300 animate-pulse" />
                    Flash Sale Management
                  </h1>
                  <p className="text-xs text-orange-100">Toggle active campaigns, control end clocks, and monitor promotional discount volumes.</p>
                </div>

                <div className="bg-black/25 px-4.5 py-3 rounded-xl border border-white/10 text-xs font-mono font-bold flex gap-4 z-10">
                  <div className="text-center">
                    <span className="block text-[10px] text-orange-250 uppercase font-black tracking-wider">Global Status</span>
                    <span className={flashSaleStatus ? 'text-emerald-400' : 'text-red-400'}>{flashSaleStatus ? 'Campaign Active' : 'Suspended'}</span>
                  </div>
                  <div className="w-px bg-white/10"></div>
                  <div className="text-center">
                    <span className="block text-[10px] text-orange-250 uppercase font-black tracking-wider">Total Items</span>
                    <span>{dbProducts.filter(p => p.isFlashSale).length} Products</span>
                  </div>
                </div>
              </div>

              {/* Global Settings & Metrics Grid */}
              <div className="grid lg:grid-cols-12 gap-6">
                
                {/* Left: Global Settings Card */}
                <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-350 pb-2 border-b border-slate-800">Global Settings</h3>
                  
                  <div className="space-y-4">
                    {/* Status toggle */}
                    <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-850">
                      <div>
                        <span className="text-xs font-bold text-slate-300">Flash Sale Status</span>
                        <p className="text-[9px] text-slate-500">Enable/disable storefront banner clock</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setFlashSaleStatus(!flashSaleStatus)}
                        className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          flashSaleStatus ? 'bg-orange-500' : 'bg-slate-800'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            flashSaleStatus ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* End time picker */}
                    <div>
                      <label className="block text-slate-450 font-bold mb-1.5 text-[10px] uppercase tracking-wider">Flash Sale End Time</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-550" />
                        <input
                          type="datetime-local"
                          className="w-full bg-slate-950 border border-slate-850 text-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none"
                          value={flashSaleEndTime}
                          onChange={(e) => setFlashSaleEndTime(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Action buttons */}
                    <button
                      type="button"
                      onClick={() => showToast('Flash campaign configurations updated!')}
                      className="w-full py-2.5 bg-orange-500 hover:bg-orange-650 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-orange-500/10 cursor-pointer"
                    >
                      Save Campaign Changes
                    </button>
                  </div>
                </div>

                {/* Right: Metrics Grid (3 cards) */}
                <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-4 h-fit">
                  
                  {/* Card 1 */}
                  <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Active Flash Sales</span>
                    <h3 className="text-xl font-black text-slate-200 mt-2">{flashSaleStatus ? '1 Active Campaign' : '0 Campaigns'}</h3>
                    <span className="text-[9px] text-slate-500 mt-2">Nairobi Showroom Land</span>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Products on Sale</span>
                    <h3 className="text-xl font-black text-slate-200 mt-2">{dbProducts.filter(p => p.isFlashSale).length} Products</h3>
                    <span className="text-[9px] text-slate-500 mt-2">Discount flags active</span>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Total Discounts (%)</span>
                    <h3 className="text-xl font-black text-slate-200 mt-2">12.8% Average</h3>
                    <span className="text-[9px] text-emerald-400 mt-2">High conversion factor</span>
                  </div>

                </div>

              </div>

              {/* Products on Sale inventory table list */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-350 pb-2 border-b border-slate-800">Products Currently in Campaign</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500 font-bold bg-slate-950/40">
                        <th className="p-3">Product Name</th>
                        <th className="p-3">Category</th>
                        <th className="p-3 text-right">Price</th>
                        <th className="p-3 text-right">Original</th>
                        <th className="p-3 text-center">Discount</th>
                        <th className="p-3 text-right">Remove</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {dbProducts.filter(p => p.isFlashSale).map((p) => {
                        return (
                          <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="p-3 font-semibold text-slate-200">{p.title}</td>
                            <td className="p-3 text-slate-400">{p.category}</td>
                            <td className="p-3 text-right font-bold text-slate-250">KSh {p.price.toLocaleString()}</td>
                            <td className="p-3 text-right text-slate-500">KSh {p.originalPrice.toLocaleString()}</td>
                            <td className="p-3 text-center">
                              <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 border border-orange-500/20 font-bold text-[9px] rounded">
                                -{p.discountPercentage}%
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                type="button"
                                onClick={() => toggleFlashSaleStatus(p.id, p.isFlashSale)}
                                className="text-slate-500 hover:text-red-400 transition-colors cursor-pointer p-1 rounded hover:bg-slate-800"
                                title="Remove from Flash Sale"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                      {dbProducts.filter(p => p.isFlashSale).length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-500 font-bold">No products currently promoted to flash sales.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
          {/* ==================== PAGE 5: WEBSITE SETTINGS ==================== */}
          {activePage === 'settings' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Header */}
              <div className="pb-4 border-b border-slate-800">
                <h1 className="text-2xl font-black text-slate-100 tracking-tight">Website Settings</h1>
                <p className="text-xs text-slate-400">Configure global currency indices, storefront banners presentation, and homepage slideshow assets.</p>
              </div>

              <div className="grid lg:grid-cols-12 gap-6">
                
                {/* Left side: Controls */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* Currency settings card */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-350 border-b border-slate-800 pb-2">Currency Exchange Indices</h3>
                    
                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-slate-450 font-bold mb-1.5 text-[10px] uppercase tracking-wider">USD to KES Exchange Rate</label>
                        <div className="relative">
                          <input
                            type="number"
                            className="w-full bg-slate-950 border border-slate-850 text-slate-200 rounded-xl p-3 focus:outline-none text-xs"
                            value={usdToKesRate}
                            onChange={(e) => setUsdToKesRate(Number(e.target.value))}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500 uppercase">KES</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Appearance sliders card */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-350 border-b border-slate-800 pb-2">Storefront Hero Banner Style</h3>
                    
                    <div className="space-y-5">
                      {/* Slider 1: Opacity */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-300">
                          <span>Overlay Opacity</span>
                          <span className="text-emerald-400 font-mono">{overlayOpacity}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-950 rounded-lg"
                          value={overlayOpacity}
                          onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                        />
                        <p className="text-[9px] text-slate-550 leading-normal">Control darkness depth on showroom slider assets.</p>
                      </div>

                      {/* Slider 2: Height */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-300">
                          <span>Section Height</span>
                          <span className="text-emerald-400 font-mono">{sectionHeight}px</span>
                        </div>
                        <input
                          type="range"
                          min="200"
                          max="500"
                          className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-950 rounded-lg"
                          value={sectionHeight}
                          onChange={(e) => setSectionHeight(Number(e.target.value))}
                        />
                        <p className="text-[9px] text-slate-550 leading-normal">Adjust height of top promo slider blocks.</p>
                      </div>
                    </div>

                  </div>

                  {/* Slideshow Editor Card */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-350 border-b border-slate-800 pb-2">
                      Homepage Carousel Slides ({adminHeroSlides.length})
                    </h3>
                    
                    <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
                      {adminHeroSlides.map((slide, index) => (
                        <div key={slide.id} className="border border-slate-800 rounded-xl p-3 bg-slate-950 space-y-2 text-xs">
                          <div className="flex justify-between items-center pb-1 border-b border-slate-900">
                            <span className="text-[10px] font-black text-emerald-400 uppercase">Slide #{index + 1}</span>
                          </div>
                          <div>
                            <label className="block text-slate-500 text-[9px] font-bold uppercase mb-0.5">Tag</label>
                            <input
                              type="text"
                              className="w-full bg-slate-900 border border-slate-850 text-slate-200 rounded-lg p-2 text-[10px]"
                              value={slide.tag}
                              onChange={(e) => {
                                const newSlides = [...adminHeroSlides];
                                newSlides[index].tag = e.target.value;
                                setAdminHeroSlides(newSlides);
                              }}
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 text-[9px] font-bold uppercase mb-0.5">Title</label>
                            <input
                              type="text"
                              className="w-full bg-slate-900 border border-slate-850 text-slate-200 rounded-lg p-2 text-[10px] font-bold"
                              value={slide.title}
                              onChange={(e) => {
                                const newSlides = [...adminHeroSlides];
                                newSlides[index].title = e.target.value;
                                setAdminHeroSlides(newSlides);
                              }}
                            />
                          </div>
                          <div>
                            <label className="block text-slate-500 text-[9px] font-bold uppercase mb-0.5">Subtitle</label>
                            <textarea
                              rows={2}
                              className="w-full bg-slate-900 border border-slate-850 text-slate-200 rounded-lg p-2 text-[10px] leading-relaxed"
                              value={slide.subtitle}
                              onChange={(e) => {
                                const newSlides = [...adminHeroSlides];
                                newSlides[index].subtitle = e.target.value;
                                setAdminHeroSlides(newSlides);
                              }}
                            />
                          </div>
                           <div>
                            <label className="block text-slate-500 text-[9px] font-bold uppercase mb-0.5">Image URL / Direct Upload</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                className="flex-1 bg-slate-900 border border-slate-850 text-slate-200 rounded-lg p-2 text-[10px]"
                                value={slide.imageUrl}
                                onChange={(e) => {
                                  const newSlides = [...adminHeroSlides];
                                  newSlides[index].imageUrl = e.target.value;
                                  setAdminHeroSlides(newSlides);
                                }}
                              />
                              <label className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-350 hover:text-slate-200 px-3 py-2 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors relative">
                                {isUploadingSlide === index ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                                ) : (
                                  <Upload className="w-3.5 h-3.5" />
                                )}
                                <span>{isUploadingSlide === index ? 'Uploading...' : 'Browse'}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                  disabled={isUploadingSlide !== null}
                                  onChange={(e) => handleSlideImageUpload(e, index)}
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        setSavingRate(true)
                        try {
                          const res = await fetch('/api/settings', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              usdToKesRate,
                              overlayOpacity,
                              sectionHeight,
                              heroSlides: adminHeroSlides
                            })
                          })
                          if (res.ok) {
                            showToast('Website configurations and slideshow synchronized successfully!')
                            if (fetchProducts) await fetchProducts()
                          } else {
                            showToast('Failed to save settings on server.')
                          }
                        } catch (err) {
                          showToast('Offline: Could not connect to database.')
                        } finally {
                          setSavingRate(false)
                        }
                      }}
                      disabled={savingRate}
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-slate-950 disabled:text-slate-505 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
                    >
                      {savingRate ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving Settings...
                        </>
                      ) : 'Save & Sync Website Settings'}
                    </button>
                  </div>

                </div>

                {/* Right side: Live Preview */}
                <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <div className="pb-3 border-b border-slate-800 flex justify-between items-center">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-355">Storefront Live Preview</h3>
                      <p className="text-[9px] text-slate-500 mt-0.5">Real-time simulation of settings overrides on clients viewport</p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 rounded text-[9px] uppercase">Simulation</span>
                  </div>

                  {/* Interactive Front-end Preview Frame */}
                  <div className="my-6 border border-slate-800 rounded-xl bg-slate-950 overflow-hidden relative shadow-md">
                    
                    {/* Mock Browser bar */}
                    <div className="h-6.5 bg-slate-900 border-b border-slate-850/80 flex items-center px-3 gap-1.5">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <div className="flex-1 bg-slate-950 rounded text-[9px] text-slate-500 text-center font-mono py-0.5 max-w-xs mx-auto truncate">
                        https://centstores.co.ke/showroom
                      </div>
                    </div>

                    {/* Preview Banner Viewport */}
                    {adminHeroSlides.length > 0 && (() => {
                      const activePreviewSlide = adminHeroSlides[0];
                      return (
                        <div
                          className="relative w-full overflow-hidden flex items-center justify-center text-center p-6 bg-cover bg-center transition-all duration-150"
                          style={{
                            height: `${sectionHeight}px`,
                            backgroundImage: `url('${getImageUrl(activePreviewSlide.imageUrl)}')`
                          }}
                        >
                          {/* Dark overlay with dynamic opacity */}
                          <div
                            className="absolute inset-0 bg-slate-950 transition-all duration-150"
                            style={{ opacity: overlayOpacity / 100 }}
                          ></div>

                          {/* Content block */}
                          <div className="z-10 max-w-md space-y-3">
                            <span className="px-2.5 py-0.5 bg-emerald-500 text-slate-950 font-black tracking-widest text-[9px] uppercase rounded">
                              {activePreviewSlide.tag || 'PROMOTION'}
                            </span>
                            <h2 className="text-lg sm:text-xl font-black text-slate-100 leading-tight">
                              {activePreviewSlide.title}
                            </h2>
                            <p className="text-[10px] text-slate-300 leading-relaxed max-w-xs mx-auto">
                              {activePreviewSlide.subtitle}. Exchange Index: 1 USD = {usdToKesRate} KES
                            </p>
                            <button
                              type="button"
                              className="px-4 py-1.5 bg-emerald-500 text-slate-950 font-black text-[10px] uppercase rounded shadow-md cursor-pointer"
                            >
                              {activePreviewSlide.buttonText || 'Shop Now'}
                            </button>
                          </div>
                        </div>
                      );
                    })()}

                  </div>

                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-850/60 text-slate-400 text-[10px] leading-relaxed">
                    💡 <span className="font-bold text-slate-200">Layout Tips:</span> Section height slider allows adjusting visual screen space of top banners. Use overlay opacity to optimize text contrast (WCAG standards suggest high contrast ratios for text over images).
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ==================== PAGE 6: INVENTORY ==================== */}
          {activePage === 'inventory' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
                <div className="space-y-1">
                  <h1 className="text-2xl font-black text-slate-100 tracking-tight">Active Stock Inventory</h1>
                  <p className="text-xs text-slate-400">Database overview of store stock quantities, categories, and direct delete actions.</p>
                </div>
              </div>

              {/* Data Table Container */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-xs font-black uppercase text-slate-350 tracking-wider">Active Inventory List ({dbProducts.length} Items)</span>
                  <span className="text-[9px] text-slate-500 font-bold lowercase">* Action deletes immediately from client visibility</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-855 text-slate-450 font-bold bg-slate-950/30">
                        <th className="p-3">Product Name & Specifications</th>
                        <th className="p-3">Category</th>
                        <th className="p-3 text-right">Price</th>
                        <th className="p-3 text-center">Flash Sale Status</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {dbProducts.map((p) => {
                        return (
                          <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="p-3 max-w-sm">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-950 flex-shrink-0 border border-slate-800 relative flex items-center justify-center">
                                  <AdminProductImage src={p.imageUrl} alt={p.title} brand={p.brand} category={p.category} />
                                </div>
                                <div className="truncate">
                                  <p className="font-semibold text-slate-200 truncate">{p.title}</p>
                                  <p className="text-[10px] text-slate-500 mt-0.5">{p.brand} • {p.storage || 'Standard Storage'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-slate-400">{p.category}</td>
                            <td className="p-3 text-right font-bold text-slate-200">KSh {p.price.toLocaleString()}</td>
                            <td className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() => toggleFlashSaleStatus(p.id, p.isFlashSale)}
                                className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase border transition-colors cursor-pointer ${
                                  p.isFlashSale
                                    ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                    : 'bg-slate-800 border-transparent text-slate-400'
                                }`}
                              >
                                {p.isFlashSale ? 'Active' : 'Inactive'}
                              </button>
                            </td>
                            <td className="p-3 text-right flex justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleStartEditProduct(p)}
                                className="text-slate-500 hover:text-emerald-450 p-1.5 rounded transition-all cursor-pointer"
                                title="Edit Product"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteProduct(p.id, p.title)}
                                className="text-slate-500 hover:text-red-450 p-1.5 rounded transition-all cursor-pointer"
                                title="Delete from database"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ==================== PAGE 7: ORDERS ==================== */}
          {activePage === 'orders' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
                <div className="space-y-1">
                  <h1 className="text-2xl font-black text-slate-100 tracking-tight">
                    {ordersStatusFilter === 'Pending' ? 'Abandonment & Cart Recovery' : 'Store Orders Management'}
                  </h1>
                  <p className="text-xs text-slate-400">Review WhatsApp checkout notifications, fulfill shipments, or audit customer details.</p>
                </div>
                {ordersStatusFilter === 'Pending' && (
                  <button
                    onClick={handleClearAbandoned}
                    className="px-4 py-2 bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-900/30 hover:border-red-900/50 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    Clear Abandoned
                  </button>
                )}
              </div>

              {/* Controls bar */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
                {/* Search */}
                <div className="w-full md:w-80 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search by customer email, reference..."
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
                    value={ordersSearch}
                    onChange={(e) => setOrdersSearch(e.target.value)}
                  />
                </div>

                {/* Status selector */}
                <div className="flex items-center gap-3">
                  <select
                    className="bg-slate-950 border border-slate-850 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
                    value={ordersStatusFilter}
                    onChange={(e) => setOrdersStatusFilter(e.target.value as any)}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Fulfilled">Fulfilled</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              {/* Orders Data Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500 font-bold bg-slate-950/30">
                        <th className="p-3">Actions</th>
                        <th className="p-3">Order ID</th>
                        <th className="p-3">Customer</th>
                        <th className="p-3 text-center">Items count</th>
                        <th className="p-3 text-right">Total</th>
                        <th className="p-3 text-center">Status</th>
                        <th className="p-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {filteredOrders.map((o) => {
                        return (
                          <tr key={o.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="p-3">
                              <button
                                type="button"
                                onClick={() => setSelectedOrder(o)}
                                className="p-1 bg-emerald-500/10 text-emerald-450 border border-emerald-500/25 rounded hover:bg-emerald-500/20 transition-all cursor-pointer"
                                title="View Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </td>
                            <td className="p-3 font-mono font-bold text-slate-350">{o.id}</td>
                            <td className="p-3">
                              <p className="font-semibold text-slate-200">{o.customerName}</p>
                              <p className="text-[10px] text-slate-550">{o.customerEmail}</p>
                            </td>
                            <td className="p-3 text-center text-slate-300 font-mono">{o.itemsCount}</td>
                            <td className="p-3 text-right font-black text-slate-100">KSh {o.total.toLocaleString()}</td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase ${
                                o.status === 'Fulfilled'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                                  : 'bg-yellow-500/10 text-yellow-450 border border-yellow-500/25'
                              }`}>
                                {o.status}
                              </span>
                            </td>
                            <td className="p-3 text-slate-500 font-mono">{o.date}</td>
                          </tr>
                        )
                      })}
                      {filteredOrders.length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-500 font-bold">No orders found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ==================== PAGE 8: USERS ==================== */}
          {activePage === 'users' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
                <div className="space-y-1">
                  <h1 className="text-2xl font-black text-slate-100 tracking-tight">Users & Staff Accounts</h1>
                  <p className="text-xs text-slate-400">Manage user landings, upgrade staff role permissions, or revoke access credentials.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(true)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-500/10 cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add User
                </button>
              </div>

              {/* Controls bar */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="w-full md:w-80 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search by name, email, phone..."
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
                    value={usersSearch}
                    onChange={(e) => setUsersSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Users Data Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500 font-bold bg-slate-950/30">
                        <th className="p-3">Actions</th>
                        <th className="p-3">Name</th>
                        <th className="p-3">Email Address</th>
                        <th className="p-3">Phone</th>
                        <th className="p-3 text-center">Role Permission</th>
                        <th className="p-3 text-center">Status</th>
                        <th className="p-3">Joined Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {filteredUsers.map((u) => {
                        const isSelf = !!currentUser && currentUser.email === u.email
                        return (
                          <tr key={u.email} className="hover:bg-slate-800/40 transition-colors">
                            <td className="p-3">
                              <button
                                type="button"
                                onClick={() => onDeleteUser(u.email, u.name)}
                                disabled={isSelf}
                                className={`p-1.5 rounded transition-all border ${
                                  isSelf
                                    ? 'bg-slate-800 text-slate-600 border-transparent cursor-not-allowed'
                                    : 'bg-red-950/20 text-red-400 border-red-900/30 hover:bg-red-950/40 hover:border-red-900/50 cursor-pointer'
                                }`}
                                title={isSelf ? 'Cannot delete self' : 'Delete user'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                            <td className="p-3 font-semibold text-slate-200">{u.name} {isSelf && <span className="text-[9px] text-emerald-400 font-bold ml-1">(You)</span>}</td>
                            <td className="p-3 font-mono text-slate-400">{u.email}</td>
                            <td className="p-3 text-slate-400 font-mono">{u.phone || '+254711000000'}</td>
                            <td className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  if (isSelf) {
                                    showToast('You cannot revoke admin status from yourself!')
                                    return
                                  }
                                  const nextRole = u.role === 'admin' ? 'user' : 'admin'
                                  fetch(`/api/users/${u.email}/role`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ role: nextRole })
                                  }).then(res => {
                                    if (res.ok) {
                                      showToast(`Changed permission for ${u.name} to ${nextRole}`)
                                      if (fetchUsers) fetchUsers()
                                    }
                                  }).catch(() => {
                                    showToast('Failed to update role on server.')
                                  })
                                }}
                                className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition-all cursor-pointer ${
                                  u.role === 'admin'
                                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                }`}
                              >
                                {u.role}
                              </button>
                            </td>
                            <td className="p-3 text-center">
                              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-bold text-[9px] rounded-full">
                                {u.status || 'Active'}
                              </span>
                            </td>
                            <td className="p-3 text-slate-500 font-mono">{u.joinedDate || 'Jun 2026'}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* ==================== MODAL: ADD USER ==================== */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-slate-200 shadow-2xl relative animate-in zoom-in-95 duration-200">
            
            <button
              onClick={() => setIsAddUserModalOpen(false)}
              className="absolute right-4 top-4 text-slate-500 hover:text-slate-350 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="pb-2 border-b border-slate-800">
              <h3 className="text-md font-black text-slate-100 flex items-center gap-1.5">
                <UsersIcon className="w-5 h-5 text-emerald-450" /> Register User Account
              </h3>
              <p className="text-[10px] text-slate-500 mt-1">Configure staff metadata and initial login authorization scope.</p>
            </div>

            <form onSubmit={onAddUserSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-450 font-bold mb-1 text-[10px] uppercase">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-250 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500/50 text-xs"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-slate-450 font-bold mb-1 text-[10px] uppercase">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. sarah.j@centstore.co.ke"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-250 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500/50 text-xs"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-slate-450 font-bold mb-1 text-[10px] uppercase">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. +254711223344"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-250 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500/50 text-xs"
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-slate-450 font-bold mb-1 text-[10px] uppercase">Initial Role Permission</label>
                <select
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-2.5 focus:outline-none text-xs cursor-pointer"
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                >
                  <option value="user">User (Client Showcase Landing)</option>
                  <option value="admin">Admin (Executive Control Console)</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-800 hover:bg-slate-950 hover:border-slate-700 text-slate-400 hover:text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: VIEW ORDER DETAILS ==================== */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 text-slate-200 shadow-2xl relative animate-in zoom-in-95 duration-200">
            
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute right-4 top-4 text-slate-500 hover:text-slate-350 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="pb-2.5 border-b border-slate-800">
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-450 border border-emerald-500/25 rounded text-[9px] font-bold uppercase tracking-wider">
                Order details
              </span>
              <h3 className="text-md font-black text-slate-100 mt-1 font-mono">
                Order reference ID: {selectedOrder.id}
              </h3>
              <p className="text-[10px] text-slate-500 mt-1">Placed on {selectedOrder.date} via WhatsApp Checkout</p>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* Customer Metadata */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-850/60 space-y-2">
                <h4 className="font-bold text-[10px] uppercase text-slate-450 tracking-wider">Customer Details</h4>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <p><span className="text-slate-500 font-bold">Name:</span> {selectedOrder.customerName}</p>
                  <p><span className="text-slate-500 font-bold">Phone:</span> {selectedOrder.customerPhone}</p>
                  <p className="col-span-2"><span className="text-slate-500 font-bold">Email:</span> {selectedOrder.customerEmail}</p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <h4 className="font-bold text-[10px] uppercase text-slate-450 tracking-wider">Purchase List</h4>
                <div className="bg-slate-950 rounded-xl border border-slate-850/60 overflow-hidden">
                  <div className="divide-y divide-slate-850 px-3.5 py-1">
                    {selectedOrder.itemsList.map((item, idx) => (
                      <div key={idx} className="py-2.5 flex justify-between items-center text-slate-300">
                        <span>{item}</span>
                        <span className="font-mono text-slate-500 font-bold">x1</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status and Total */}
              <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-850/60">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-bold">Status:</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase ${
                    selectedOrder.status === 'Fulfilled'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                      : 'bg-yellow-500/10 text-yellow-450 border border-yellow-500/25'
                  }`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold mr-1">Total:</span>
                  <span className="font-black text-slate-100 text-sm">KSh {selectedOrder.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-3">
                {selectedOrder.status === 'Pending' && (
                  <button
                    type="button"
                    onClick={() => {
                      fetch(`/api/orders/${selectedOrder.id}/status`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: 'Fulfilled' })
                      }).then(res => {
                        if (res.ok) {
                          setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: 'Fulfilled' } : o))
                          setSelectedOrder(prev => prev ? { ...prev, status: 'Fulfilled' } : null)
                          showToast(`Order ${selectedOrder.id} marked as Fulfilled!`)
                          fetchOrders()
                        }
                      }).catch(() => {
                        showToast('Failed to update status on server.')
                      })
                    }}
                    className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    Fulfill Order
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 py-2.5 border border-slate-850 hover:bg-slate-950 hover:border-slate-800 text-slate-400 hover:text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
                >
                  Close
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  )
}
