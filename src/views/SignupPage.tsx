import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, Mail, Lock, UserPlus, AlertCircle, ShieldCheck } from 'lucide-react'

export interface SignupPageProps {
  showToast?: (message: string) => void
}

export default function SignupPage({ showToast }: SignupPageProps) {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      })
      const data = await res.json()

      if (res.ok) {
        if (showToast) {
          showToast('OTP Verification code dispatched to your email.')
        }
        navigate('/otp-verify', { state: { email } })
      } else {
        setError(data.error || 'Registration failed. Please try again.')
      }
    } catch {
      // Offline fallback: simulate dispatching OTP code to test email
      if (showToast) {
        showToast('OTP Verification code dispatched to your email (Demo mode).')
      }
      navigate('/otp-verify', { state: { email } })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="max-w-md mx-auto py-8 sm:py-12 animate-in zoom-in-95 duration-200">
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 text-slate-800">
        
        {/* Header Badge */}
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1 text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-600 font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded">
            <ShieldCheck className="w-3 h-3" />
            Create Customer Account
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Cent Stores Signup</h1>
          <p className="text-xs text-slate-500">Create an account to track orders, save wishlists, and receive member promotions</p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl p-3 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Dedicated Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Nimrod Kibet"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-xs focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

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
                placeholder="e.g. nimrod@example.com"
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
            {isLoading ? 'Creating Account...' : 'Register Account'}
            <UserPlus className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Link to Login */}
        <div className="flex justify-between items-center text-xs pt-2">
          <span className="text-slate-500">Already have an account?</span>
          <Link to="/login" className="text-blue-600 hover:underline font-bold">
            Log In
          </Link>
        </div>

        {/* Link back to Showcase */}
        <div className="text-center pt-2">
          <Link to="/" className="text-xs text-slate-500 hover:text-blue-600 font-bold transition-colors underline">
            Cancel & Return to Showcase
          </Link>
        </div>

      </div>
    </section>
  )
}
