import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

// ── Google Icon ────────────────────────────────────────────
function GoogleIcon({ className = 'w-5 h-5' }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
    )
}

// ══════════════════════════════════════════════════════════
//   MAIN AUTH MODAL
// ══════════════════════════════════════════════════════════
export default function AuthModal({ contextText }) {
    const { closeAuthModal, signIn, sendOtp, verifyOtp } = useAuth()

    const [tab, setTab] = useState('google')
    
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [userId, setUserId] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    function clearError() { setError('') }

    // ── Google ─────────────────────────────────────────────
    async function handleGoogle() {
        setLoading(true)
        setError('')
        try {
            await signIn()
            // browser will redirect; keep button loading
        } catch (err) {
            setError(err.message)
            setLoading(false)
        }
    }

    // ── Send OTP ───────────────────────────────────────────
    async function handleSendOtp(e) {
        e.preventDefault()
        if (!email.trim()) return setError('Please enter your email.')
        setLoading(true)
        setError('')
        try {
            const id = await sendOtp(email.trim())
            setUserId(id)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // ── Verify OTP ─────────────────────────────────────────
    async function handleVerifyOtp(e) {
        e.preventDefault()
        if (!otp.trim()) return setError('Please enter the OTP.')
        setLoading(true)
        setError('')
        try {
            await verifyOtp(userId, otp.trim())
            // closeAuthModal is handled inside AuthContext's verifyOtp
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={closeAuthModal}
        >
            <div
                className="relative w-full max-w-md bg-[#080b14] border border-white/[0.08] rounded-2xl p-8 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close */}
                <button
                    onClick={closeAuthModal}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Header */}
                <div className="text-center mb-7">
                    <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/15 flex items-center justify-center mx-auto mb-4 p-2">
                        <img src="/favicon.png" alt="Skill Issue" className="w-full h-full object-contain" />
                    </div>
                    <h2 className="font-clash font-bold text-2xl">
                        {contextText || 'Welcome to Skill Issue'}
                    </h2>
                    <p className="font-satoshi text-sm text-white/35 mt-1.5">
                        Sign in to save, build, and share skill files
                    </p>
                </div>

                {/* Tab Toggle */}
                {!userId && (
                    <div className="flex rounded-xl border border-white/[0.07] bg-white/[0.02] p-1 mb-6">
                        {[['google', 'Google'], ['email', 'Email']].map(([key, label]) => (
                            <button
                                key={key}
                                onClick={() => { setTab(key); clearError() }}
                                className={`flex-1 py-2 rounded-lg font-satoshi text-sm font-medium transition-all duration-200 ${tab === key
                                    ? 'bg-accent/15 text-accent border border-accent/20'
                                    : 'text-white/35 hover:text-white/60'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                )}

                {/* ── Google Tab ─────────────────────────── */}
                {!userId && tab === 'google' && (
                    <div className="space-y-4">
                        <button
                            onClick={handleGoogle}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.10] hover:border-accent/30 hover:bg-white/[0.08] transition-all duration-300 group disabled:opacity-50 disabled:cursor-wait"
                        >
                            {loading ? (
                                <svg className="w-5 h-5 animate-spin text-accent" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                            ) : (
                                <GoogleIcon />
                            )}
                            <span className="font-satoshi font-semibold text-white/80 group-hover:text-white transition-colors">
                                {loading ? 'Redirecting…' : 'Continue with Google'}
                            </span>
                        </button>

                        <p className="text-center font-satoshi text-xs text-white/20 mt-4">
                            By continuing you agree to our Terms & Privacy Policy
                        </p>
                    </div>
                )}

                {/* ── Email Tab (OTP) ──────────────────────────── */}
                {tab === 'email' && (
                    <>
                        {!userId ? (
                            <form onSubmit={handleSendOtp} className="space-y-4">
                                <div>
                                    <label className="block font-satoshi text-xs text-white/40 mb-1.5">Email address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => { setEmail(e.target.value); clearError() }}
                                        placeholder="you@example.com"
                                        className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-accent/40 text-white placeholder:text-white/20 font-satoshi text-sm outline-none transition-all"
                                    />
                                </div>
                                {error && <p className="font-satoshi text-xs text-red-400">{error}</p>}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 rounded-xl bg-accent text-navy font-satoshi font-bold text-sm hover:bg-[#6bbcff] transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Sending OTP…' : 'Send OTP'}
                                </button>
                                <p className="font-satoshi text-xs text-white/20 text-center">
                                    We'll send a one-time password to your email.
                                </p>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyOtp} className="space-y-4">
                                <div className="text-center mb-4">
                                    <p className="font-satoshi text-sm text-white/40 mb-1">Enter the code sent to</p>
                                    <p className="font-satoshi text-sm font-medium text-accent">{email}</p>
                                </div>
                                <div>
                                    <label className="block font-satoshi text-xs text-white/40 mb-1.5">One-Time Password</label>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={e => { setOtp(e.target.value); clearError() }}
                                        placeholder="123456"
                                        className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-accent/40 text-white placeholder:text-white/20 font-satoshi text-sm outline-none transition-all text-center tracking-[0.5em]"
                                        maxLength={6}
                                    />
                                </div>
                                {error && <p className="font-satoshi text-xs text-red-400">{error}</p>}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 rounded-xl bg-accent text-navy font-satoshi font-bold text-sm hover:bg-[#6bbcff] transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Verifying…' : 'Verify & Sign In'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setUserId(null); setOtp(''); clearError() }}
                                    className="w-full py-2 font-satoshi text-sm text-white/40 hover:text-white/70 transition-colors"
                                >
                                    ← Back to Email
                                </button>
                            </form>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
