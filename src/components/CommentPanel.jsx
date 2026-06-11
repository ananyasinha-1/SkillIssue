import { useState, useEffect, useRef } from 'react'

function Avatar({ username, avatarUrl, size = 7 }) {
    const fallback = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(username[0] || 'anon')}`
    return (
        <img
            src={avatarUrl || fallback}
            alt={username || 'user'}
            className={`w-${size} h-${size} rounded-full border border-white/10 bg-white/5 object-cover shrink-0`}
        />
    )
}

function timeAgo(dateStr) {
    if (!dateStr) return ''
    const diff = Date.now() - new Date(dateStr).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return 'just now'
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    const d = Math.floor(h / 24)
    if (d < 30) return `${d}d ago`
    return `${Math.floor(d / 30)}mo ago`
}

function CommentItem({ comment }) {
    return (
        <div className="flex gap-3">
            <Avatar username={comment.username} avatarUrl={comment.avatarUrl} size={7} />
            <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-satoshi text-xs font-semibold text-white/70">
                        @{comment.username}
                    </span>
                    <span className="font-satoshi text-[10px] text-white/25">
                        {timeAgo(comment.created_at)}
                    </span>
                </div>
                <p className="font-satoshi text-sm text-white/55 leading-relaxed break-words">
                    {comment.body}
                </p>
            </div>
        </div>
    )
}

function CommentComposer({ user, userProfile, draft, setDraft, onSubmit, submitting }) {
    const textareaRef = useRef(null)

    function handleKeyDown(e) {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault()
            onSubmit()
        }
    }

    if (!user) {
        return (
            <div className="text-center py-4">
                <p className="font-satoshi text-xs text-white/30">Sign in to leave a comment.</p>
            </div>
        )
    }

    return (
        <div className="flex gap-2.5 items-start">
            <Avatar username={userProfile?.username || user.email} avatarUrl={userProfile?.avatar_url} size={7} />
            <div className="flex-1 min-w-0">
                <textarea
                    ref={textareaRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Write a comment… (⌘+Enter to send)"
                    rows={3}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 font-satoshi text-sm text-white/70 placeholder-white/20 resize-none focus:outline-none focus:border-accent/30 focus:bg-white/[0.06] transition-all duration-200 styled-scrollbar"
                />
                <div className="flex justify-end mt-2">
                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={!draft.trim() || submitting}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-accent text-navy font-satoshi font-bold text-xs hover:bg-[#6bbcff] hover:shadow-[0_0_16px_rgba(75,169,255,0.3)] transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none"
                    >
                        {submitting ? (
                            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        ) : (
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                            </svg>
                        )}
                        Send
                    </button>
                </div>
            </div>
        </div>
    )
}

function CommentList({ comments, loadingComments }) {
    return (
        <div className="flex-1 overflow-y-auto styled-scrollbar px-4 py-4 space-y-5">
            {loadingComments && (
                <div className="flex items-center justify-center py-10">
                    <svg className="w-5 h-5 text-accent animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                </div>
            )}
            {!loadingComments && comments.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                    <div className="w-10 h-10 rounded-full bg-accent/5 border border-accent/15 flex items-center justify-center">
                        <svg className="w-5 h-5 text-accent/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                        </svg>
                    </div>
                    <p className="font-satoshi text-sm text-white/30">No comments yet.</p>
                    <p className="font-satoshi text-xs text-white/20">Be the first to share your thoughts!</p>
                </div>
            )}
            {!loadingComments && comments.map((c) => (
                <CommentItem key={c.id} comment={c} />
            ))}
        </div>
    )
}


export default function CommentPanel({
    open,
    onClose,
    skillTitle,
    user,
    userProfile,
    comments = [],
    loadingComments = false,
    onSubmitComment,
    submitting = false,
}) {
    const [draft, setDraft] = useState('')
    const listRef = useRef(null)

    useEffect(() => {
        if (!open) setDraft('')
    }, [open])

    useEffect(() => {
        if (open && listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight
        }
    }, [comments.length, open])

    function handleSubmit() {
        const text = draft.trim()
        if (!text || submitting) return
        onSubmitComment?.(text)
        setDraft('')
    }

    return (
        <>
            
            <div
                className={`absolute inset-0 z-10 bg-black/40 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
                aria-hidden="true"
            />

            
            <div
                role="complementary"
                aria-label="Comments"
                className={`absolute top-0 right-0 bottom-0 z-20 flex flex-col bg-[#080b14] border-l border-white/[0.07] shadow-2xl transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
                style={{ width: 'min(360px, 100%)' }}
            >
                
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] shrink-0">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-accent/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                        </svg>
                        <span className="font-clash font-bold text-sm text-white/80">Comments</span>
                        {comments.length > 0 && (
                            <span className="font-satoshi text-[10px] text-white/30 bg-white/5 border border-white/10 rounded-full px-2 py-0.5">
                                {comments.length}
                            </span>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close comments"
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/[0.06] text-white/30 hover:text-white/60 transition-colors"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                
                <div ref={listRef} className="flex-1 overflow-y-auto styled-scrollbar">
                    <CommentList comments={comments} loadingComments={loadingComments} />
                </div>

                
                <div className="shrink-0 px-4 py-3 border-t border-white/[0.06] bg-white/[0.01]">
                    <CommentComposer
                        user={user}
                        userProfile={userProfile}
                        draft={draft}
                        setDraft={setDraft}
                        onSubmit={handleSubmit}
                        submitting={submitting}
                    />
                </div>
            </div>
        </>
    )
}


export function StandaloneCommentDrawer({
    open,
    onClose,
    skillTitle,
    user,
    userProfile,
    comments = [],
    loadingComments = false,
    onSubmitComment,
    submitting = false,
}) {
    const [draft, setDraft] = useState('')
    const listRef = useRef(null)

    useEffect(() => {
        if (!open) setDraft('')
    }, [open])

    useEffect(() => {
        if (open && listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight
        }
    }, [comments.length, open])

    function handleSubmit() {
        const text = draft.trim()
        if (!text || submitting) return
        onSubmitComment?.(text)
        setDraft('')
    }

    return (
        <>
            
            <div
                className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
                aria-hidden="true"
            />

            
            <div
                role="complementary"
                aria-label="Comments"
                className={`fixed top-0 right-0 bottom-0 z-50 flex flex-col bg-[#080b14] border-l border-white/[0.08] shadow-2xl transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
                style={{ width: 'min(400px, 100vw)' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] shrink-0">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-accent/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                        </svg>
                        <div>
                            <span className="font-clash font-bold text-sm text-white/80">Comments</span>
                            {skillTitle && <p className="font-satoshi text-[10px] text-white/30 truncate max-w-[260px]">{skillTitle}</p>}
                        </div>
                        {comments.length > 0 && (
                            <span className="font-satoshi text-[10px] text-white/30 bg-white/5 border border-white/10 rounded-full px-2 py-0.5 ml-1">
                                {comments.length}
                            </span>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close comments"
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/[0.06] text-white/30 hover:text-white/60 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                
                <div ref={listRef} className="flex-1 overflow-y-auto styled-scrollbar px-5 py-4 space-y-5">
                    <CommentList comments={comments} loadingComments={loadingComments} />
                </div>

                
                <div className="shrink-0 px-5 py-4 border-t border-white/[0.06] bg-white/[0.01]">
                    <CommentComposer
                        user={user}
                        userProfile={userProfile}
                        draft={draft}
                        setDraft={setDraft}
                        onSubmit={handleSubmit}
                        submitting={submitting}
                    />
                </div>
            </div>
        </>
    )
}
