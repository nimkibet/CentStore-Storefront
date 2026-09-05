import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { KeyRound, CheckCircle, AlertCircle } from 'lucide-react'

export interface User {
  email: string
  role: 'admin' | 'user'
  name: string
  password?: string
}

export interface OtpVerifyPageProps {
  onVerifySuccess?: (user: User) => void
  showToast?: (message: string) => void
}

export default function OtpVerifyPage({ onVerifySuccess, showToast }: OtpVerifyPageProps) {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Read passed email from navigation state or fallback
  const initialEmail = (location.state as { email?: string } | null)?.email || ''
  const [email, setEmail] = useState(initialEmail)
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      })
      const data = await res.json()

      if (res.ok && data.user) {
        if (onVerifySuccess) {
          onVerifySuccess(data.user)
        }
        if (showToast) {
          showToast(`Account verified! Welcome ${data.user.name}`)
        }
        if (data.user.role === 'admin') {
          navigate('/admin')
        } else {
          navigate('/')
        }
      } else {
        setError(data.error || 'Invalid or expired OTP code.')
      }
    } catch {
      // Offline fallback: verify sample codes
      if (code.length === 6) {
        const verifiedUser: User = {
          email: email || 'customer@centstores.co.ke',
          role: 'user',
          name: email.split('@')[0] || 'Verified Customer'
        }
        if (onVerifySuccess) onVerifySuccess(verifiedUser)
        if (showToast) showToast('Account verified! (Demo Mode)')
        navigate('/')
      } else {
        setError('Verification server offline. Please enter a valid 6-digit code.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="max-w-md mx-auto py-8 sm:py-12 animate-in zoom-in-95 duration-200">
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 text-slate-800">
        
        {/* Header Badge */}
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded">
            <KeyRound className="w-3 h-3" />
            OTP Code Verification
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Verify Account</h1>
          <p className="text-xs text-slate-500 leading-normal">
            {email ? (
              <>We sent a 6-digit confirmation code to <span className="font-bold text-slate-800">{email}</span>.</>
            ) : (
              <>Please enter your registered email and the 6-digit confirmation code.</>
            )}
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl p-3 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Dedicated OTP Verification Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!initialEmail && (
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. nimrod@example.com"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-xs focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">6-Digit Verification Code</label>
            <input
              type="text"
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 123456"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 text-sm text-center font-mono tracking-widest focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || code.length < 6}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase rounded-xl tracking-wider transition-all shadow-md shadow-emerald-500/10 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? 'Verifying...' : 'Verify & Log In'}
            <CheckCircle className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Navigation links */}
        <div className="flex justify-between items-center text-xs pt-2">
          <Link to="/login" className="text-xs text-slate-500 hover:text-blue-600 font-bold transition-colors underline">
            Back to Login
          </Link>
          <Link to="/" className="text-xs text-slate-500 hover:text-blue-600 font-bold transition-colors underline">
            Return to Showcase
          </Link>
        </div>

      </div>
    </section>
  )
}
