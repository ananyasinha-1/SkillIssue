import { useEffect } from 'react'

const variantIcon = {
    success: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    ),
    error: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008v.008H12v-.008zm9-.75a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
    info: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M12 9h.008v.008H12V9z" />
    ),
}

const variantClass = {
    success: 'text-emerald-400 border-accent/20',
    error: 'text-red-400 border-red-500/20',
    info: 'text-accent border-accent/20',
}

export default function Toast({ message, variant = 'success', onDismiss, duration = 3000 }) {
    useEffect(() => {
        if (!message || !duration || !onDismiss) return undefined
        const timer = window.setTimeout(onDismiss, duration)
        return () => window.clearTimeout(timer)
    }, [duration, message, onDismiss])

    if (!message) return null

    return (
        <div
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9998] animate-fade-in-up pointer-events-none"
            role="status"
            aria-live="polite"
        >
            <div className={`flex items-center gap-2.5 px-5 py-3 rounded-xl bg-navy border shadow-[0_8px_32px_rgba(0,0,0,0.5)] ${variantClass[variant] || variantClass.success}`}>
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    {variantIcon[variant] || variantIcon.success}
                </svg>
                <span className="font-satoshi text-sm text-white/80">{message}</span>
            </div>
        </div>
    )
}
