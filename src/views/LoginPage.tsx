import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react'

export interface User {
  email: string
  role: 'admin' | 'user'
  name: string
  password?: string
}

export interface LoginPageProps {
  onLoginSuccess?: (user: User) => void
  showToast?: (message: string) => void
}

export default function LoginPage({ onLoginSuccess, showToast }: LoginPageProps) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()

      if (res.ok && data.user) {
        if (onLoginSuccess) {
          onLoginSuccess(data.user)
        }
        if (showToast) {
          showToast(`Welcome back, ${data.user.name}!`)
        }
        if (data.user.role === 'admin') {
          navigate('/admin')
        } else {
          navigate('/')
        }
      } else {
        setError(data.error || 'Invalid email or password.')
      }
    } catch {
      // Fallback for offline demo credentials
      if (email === 'admin@centstores.co.ke' && password === 'admin123') {
        const adminUser: User = { email, role: 'admin', name: 'Executive Admin' }
        if (onLoginSuccess) onLoginSuccess(adminUser)
        if (showToast) showToast('Welcome back, Executive Admin! (Offline Mode)')
        navigate('/admin')
      } else if (email === 'user@centstores.co.ke' && password === 'user123') {
        const regUser: User = { email, role: 'user', name: 'Premium Client' }
        if (onLoginSuccess) onLoginSuccess(regUser)
        if (showToast) showToast('Welcome back, Premium Client! (Offline Mode)')
        navigate('/')
      } else {
        setError('Authentication server offline. Please verify your connection or try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = (provider: string) => {
    if (showToast) {
      showToast(`${provider} authentication initiated...`)
    }
    // Simulate social login with customer session
    const socialUser: User = {
      email: `user_${provider.toLowerCase()}@centstores.co.ke`,
      role: 'user',
      name: `${provider} Verified Client`
    }
    if (onLoginSuccess) onLoginSuccess(socialUser)
    navigate('/')
  }

  return (
    <section className="max-w-md mx-auto py-8 sm:py-12 animate-in zoom-in-95 duration-200">
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-md space-y-6 text-slate-800">
        
        {/* Header Badge */}
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1 text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-600 font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded">
            <ShieldCheck className="w-3 h-3" />
            Secure Access Portal
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Cent Stores Login</h1>
          <p className="text-xs text-slate-500">Sign in to manage stock inventory, track orders, and configure permissions</p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl p-3 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Dedicated Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. admin@centstores.co.ke"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-xs focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Secret Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-xs focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase rounded-xl tracking-wider transition-all shadow-md shadow-blue-500/10 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? 'Authenticating...' : 'Authenticate & Sign In'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full"></div>
          <span className="bg-white px-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">or sign in with</span>
          <div className="border-t border-slate-200 w-full"></div>
        </div>

        {/* Social Login Options */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleSocialLogin('Google')}
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin('Apple')}
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.63 1.35-.57.65-1.06 1.71-.93 2.73 1 .08 2.02-.48 2.64-1.23z" />
            </svg>
            <span>Apple</span>
          </button>
        </div>

        {/* Link to Signup */}
        <div className="flex justify-between items-center text-xs pt-2">
          <span className="text-slate-500">Don't have an account?</span>
          <Link to="/signup" className="text-blue-600 hover:underline font-bold">
            Sign Up
          </Link>
        </div>

        {/* Link back to Showroom */}
        <div className="text-center pt-2">
          <Link to="/" className="text-xs text-slate-500 hover:text-blue-600 font-bold transition-colors underline">
            Cancel & Return to Showcase
          </Link>
        </div>

      </div>
    </section>
  )
}
