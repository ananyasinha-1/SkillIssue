import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'


function Avatar({ src, name, size = 10 }) {
    const [err, setErr] = useState(false)
    useEffect(() => { setErr(false) }, [src])
    const initial = name?.charAt(0)?.toUpperCase() ?? '?'
    const cls = `w-${size} h-${size} rounded-full object-cover border border-accent/20`

    return src && !err ? (
        <img
            src={src}
            alt={name}
            onError={() => setErr(true)}
            loading="lazy"
            className={cls}
        />
    ) : (
        <div className={`w-${size} h-${size} rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0`}>
            <span className="font-clash font-bold text-sm text-accent">{initial}</span>
        </div>
    )
}


function PersonRow({ person, onClose }) {
    const navigate = useNavigate()

    function handleClick() {
        onClose()
        navigate(`/user/${person.username}`)
    }

    return (
        <button
            onClick={handleClick}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/[0.04] transition-colors duration-150 text-left group"
        >
            <Avatar src={person.avatar_url} name={person.display_name || person.username} />
            <div className="flex-1 min-w-0">
                <p className="font-clash font-semibold text-sm text-white/90 group-hover:text-white truncate leading-snug">
                    {person.display_name || person.username}
                </p>
                <p className="font-satoshi text-xs text-white/35 truncate">@{person.username}</p>
            </div>
            <svg className="w-4 h-4 text-white/10 group-hover:text-accent/40 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
        </button>
    )
}


function PendingRow({ person, onAccept, onReject }) {
    const [accepting, setAccepting] = useState(false)
    const [rejecting, setRejecting] = useState(false)

    async function handleAccept() {
        setAccepting(true)
        await onAccept(person.user_id)
        setAccepting(false)
    }

    async function handleReject() {
        setRejecting(true)
        await onReject(person.user_id)
        setRejecting(false)
    }

    return (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/[0.03] transition-colors duration-150">
            <Avatar src={person.avatar_url} name={person.display_name || person.username} />
            <div className="flex-1 min-w-0">
                <p className="font-clash font-semibold text-sm text-white/90 truncate leading-snug">
                    {person.display_name || person.username}
                </p>
                <p className="font-satoshi text-xs text-white/35 truncate">@{person.username}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                {/* Accept */}
                <button
                    onClick={handleAccept}
                    disabled={accepting || rejecting}
                    title="Accept"
                    className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/40 hover:shadow-[0_0_12px_rgba(52,211,153,0.2)] transition-all duration-200 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {accepting ? (
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                    ) : (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                    )}
                </button>
                {/* Reject */}
                <button
                    onClick={handleReject}
                    disabled={accepting || rejecting}
                    title="Reject"
                    className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 hover:shadow-[0_0_12px_rgba(248,113,113,0.2)] transition-all duration-200 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {rejecting ? (
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                    ) : (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    )
}


function EmptyState({ message }) {
    return (
        <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-white/15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
            </div>
            <p className="font-satoshi text-sm text-white/25">{message}</p>
        </div>
    )
}

export default function FollowModal({ type, people, onClose, onAccept, onReject }) {
    const [search, setSearch] = useState('')
    const searchRef = useRef(null)

    
    useEffect(() => {
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = prev }
    }, [])

    
    useEffect(() => {
        setTimeout(() => searchRef.current?.focus(), 80)
    }, [])

    
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [onClose])

    const titles = { followers: 'Followers', following: 'Following', pending: 'Pending Requests' }
    const title = titles[type] || 'People'

    const query = search.trim().toLowerCase()
    const filtered = query
        ? people.filter(p =>
            (p.display_name || '').toLowerCase().includes(query) ||
            (p.username || '').toLowerCase().includes(query)
        )
        : people

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', animation: 'modal-fade-in 0.2s ease-out' }}
            onClick={onClose}
        >
            
            <div
                onClick={e => e.stopPropagation()}
                className="relative flex flex-col rounded-[2rem] border border-white/[0.09] overflow-hidden"
                style={{
                    width: 'min(380px, 92vw)',
                    height: 'min(620px, 88vh)',
                    background: 'linear-gradient(160deg, #111730 0%, #0d1225 100%)',
                    boxShadow: '0 0 0 1px rgba(75,169,255,0.08), 0 32px 80px rgba(0,0,0,0.6), 0 0 60px rgba(75,169,255,0.06)',
                    animation: 'modal-scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
            >
                
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-[3px] rounded-b-full bg-accent/30" />

                
                <div className="flex items-center justify-between px-5 pt-6 pb-4 shrink-0">
                    <div>
                        <h2 className="font-clash font-bold text-lg text-white leading-tight">{title}</h2>
                        <p className="font-satoshi text-xs text-white/30 mt-0.5">
                            {people.length} {people.length === 1 ? 'person' : 'people'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.08] transition-all duration-150"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                
                <div className="px-5 pb-3 shrink-0">
                    <div className="relative">
                        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                        <input
                            ref={searchRef}
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search…"
                            className="w-full pl-9 pr-9 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07] focus:border-accent/30 focus:bg-white/[0.06] text-white placeholder:text-white/20 font-satoshi text-sm outline-none transition-all duration-200"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                
                <div className="h-px bg-white/[0.05] mx-5 shrink-0" />

                
                <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5 scroll-smooth" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(75,169,255,0.15) transparent' }}>
                    {filtered.length === 0 ? (
                        <EmptyState message={query ? 'No results found.' : type === 'pending' ? 'No pending requests.' : `No ${title.toLowerCase()} yet.`} />
                    ) : type === 'pending' ? (
                        filtered.map(person => (
                            <PendingRow
                                key={person.user_id}
                                person={person}
                                onAccept={onAccept}
                                onReject={onReject}
                            />
                        ))
                    ) : (
                        filtered.map(person => (
                            <PersonRow
                                key={person.user_id}
                                person={person}
                                onClose={onClose}
                            />
                        ))
                    )}
                </div>

               
                <div className="flex justify-center pb-3 pt-1 shrink-0">
                    <div className="w-10 h-1 rounded-full bg-white/[0.08]" />
                </div>
            </div>
        </div>
    )
}
