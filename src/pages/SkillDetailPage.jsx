import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getSkillById, deleteSkill, toggleVisibility, starSkill, unstarSkill } from '../lib/skillService'
import { invalidateProfileCache } from '../lib/profileCache'
import { getProfile, toggleSavedSkill } from '../lib/userService'
import ConfirmDialog from '../components/ConfirmDialog'
import SEO, { jsonLdSchemas } from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import SkillViewer from '../components/SkillViewer'
import SkillActionBar from '../components/SkillActionBar'
import Toast from '../components/Toast'

const SITE = import.meta.env.VITE_SITE_URL || 'https://www.skillissue.bajpai.tech'

function starKey(userId, skillId) { return `starred:${userId}:${skillId}` }
function isStarred(userId, skillId) { return !!localStorage.getItem(starKey(userId, skillId)) }
function setStarred(userId, skillId, val) {
    val ? localStorage.setItem(starKey(userId, skillId), '1') : localStorage.removeItem(starKey(userId, skillId))
}
function slug(title = 'skill') { return title.toLowerCase().replace(/\s+/g, '-') }

export default function SkillDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user: authUser, profile: authProfile, openAuthModal, refreshProfile } = useAuth()

    const [skill, setSkill] = useState(null)
    const [author, setAuthor] = useState(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)
    const [viewerContent, setViewerContent] = useState('')
    const [copied, setCopied] = useState(false)
    const [linkCopied, setLinkCopied] = useState(false)
    const [starring, setStarring] = useState(false)
    const [starred, setStarredState] = useState(false)
    const [starCount, setStarCount] = useState(0)
    const [saving, setSaving] = useState(false)
    const [isSaved, setIsSaved] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [working, setWorking] = useState(false)
    const [toast, setToast] = useState(null)

    useEffect(() => {
        if (!id) return
        let cancelled = false
        getSkillById(id)
            .then((s) => {
                if (cancelled) return
                setSkill(s)
                setStarCount(s.star_count ?? 0)
                if (s.user_id) getProfile(s.user_id).then((profile) => !cancelled && setAuthor(profile)).catch(() => {})
            })
            .catch(() => !cancelled && setNotFound(true))
            .finally(() => !cancelled && setLoading(false))
        return () => { cancelled = true }
    }, [id])

    useEffect(() => {
        if (authUser && skill) setStarredState(isStarred(authUser.$id, skill.id))
    }, [authUser, skill])

    useEffect(() => {
        if (authProfile && skill) setIsSaved(!!authProfile.saved_skills?.includes(skill.id))
    }, [authProfile, skill])

    const isOwner = !!(authUser && skill && authUser.$id === skill.user_id)
    const isPrivate = skill?.visibility === 'private'
    const isGuest = !authUser

    useEffect(() => {
        if (!loading && skill && isPrivate && !isOwner) setNotFound(true)
    }, [loading, skill, isPrivate, isOwner])

    function showToast(message) {
        setToast(message)
    }

    function handleCopy() {
        const src = viewerContent || skill.content
        if (!src) return
        navigator.clipboard.writeText(src)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 2000)
    }

    function handleDownload() {
        if (!authUser) { openAuthModal(); return }
        const blob = new Blob([skill.content || ''], { type: 'text/markdown' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${slug(skill.title)}.md`
        a.click()
        URL.revokeObjectURL(url)
    }

    async function handleShare() {
        const url = `${SITE}/skill/${skill.id}`
        if (navigator.share) {
            try { await navigator.share({ title: skill.title, url }) } catch { /* cancelled */ }
        } else {
            await navigator.clipboard.writeText(url)
            setLinkCopied(true)
            showToast('Link copied to clipboard!')
            window.setTimeout(() => setLinkCopied(false), 2000)
        }
    }

    async function handleStar() {
        if (!authUser) { showToast('Sign in to star skills'); return }
        if (starring) return
        setStarring(true)
        try {
            if (starred) {
                const updated = await unstarSkill(skill.id, starCount)
                setStarCount(updated.star_count ?? Math.max(0, starCount - 1))
                setStarredState(false)
                setStarred(authUser.$id, skill.id, false)
            } else {
                const updated = await starSkill(skill.id, starCount)
                setStarCount(updated.star_count ?? starCount + 1)
                setStarredState(true)
                setStarred(authUser.$id, skill.id, true)
            }
        } catch {
            showToast('Failed to update star')
        } finally {
            setStarring(false)
        }
    }

    async function handleSaveSkill() {
        if (!authProfile || saving) return
        setSaving(true)
        try {
            const nextAction = isSaved ? 'unsave' : 'save'
            await toggleSavedSkill(authProfile.id, skill.id, nextAction)
            setIsSaved(!isSaved)
            invalidateProfileCache(authProfile?.username)
            showToast(isSaved ? 'Removed from Saved' : 'Saved to profile')
            await refreshProfile()
        } catch {
            showToast('Failed to update saved skill')
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete() {
        setWorking(true)
        try {
            await deleteSkill(skill.id)
            invalidateProfileCache(authProfile?.username)
            navigate(-1)
        } finally {
            setWorking(false)
            setShowDeleteConfirm(false)
        }
    }

    async function handleToggleVisibility() {
        setWorking(true)
        try {
            const next = isPrivate ? 'public' : 'private'
            const updated = await toggleVisibility(skill.id, next)
            setSkill(updated)
            invalidateProfileCache(authProfile?.username)
            showToast(`Skill is now ${next}.`)
        } finally {
            setWorking(false)
        }
    }

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <svg className="w-8 h-8 text-accent animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            </main>
        )
    }

    if (notFound || !skill) {
        return (
            <main className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-accent/5 border border-accent/10 flex items-center justify-center">
                    <svg className="w-8 h-8 text-accent/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                </div>
                <h1 className="font-clash font-bold text-3xl">Skill not found</h1>
                <p className="font-satoshi text-white/40 max-w-sm">This skill doesn't exist or is private. You need to be the owner to view private skills.</p>
                <Link to="/" className="btn-primary">Go Home</Link>
            </main>
        )
    }

    const authorName = author?.display_name || author?.username || 'Unknown'
    const authorAvatar = author?.avatar_url
    const authorUsername = author?.username

    return (
        <>
            <SEO
                title={skill.title}
                description={skill.description || `${skill.title} - AI skill file on Skill Issue. Copy, save, and use this skill with Claude, ChatGPT, Gemini, Cursor and more.`}
                path={`/skill/${skill.id}`}
                jsonLd={{
                    '@graph': [
                        jsonLdSchemas.skillPage({ ...skill, authorName }),
                        jsonLdSchemas.breadcrumb([
                            { name: 'Home', url: '/' },
                            { name: 'Browse Skills', url: '/browse' },
                            { name: skill.title },
                        ]),
                    ],
                }}
            />
            <main className="relative min-h-screen pt-28 pb-24">
                <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-accent/[0.04] rounded-full blur-[140px] pointer-events-none" />
                <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6">
                    <Breadcrumbs items={[{ label: 'Browse Skills', to: '/browse' }, { label: skill.title }]} />
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-8 text-white/30 hover:text-white/60 font-satoshi text-sm transition-colors group">
                        <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                        Back
                    </button>

                    <div className="mb-8">
                        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                            <h1 className="font-clash font-bold text-3xl sm:text-4xl text-white leading-tight flex-1">{skill.title}</h1>
                            <button onClick={handleStar} disabled={starring} aria-label={starred ? 'Unstar skill' : 'Star skill'} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-satoshi text-sm font-semibold transition-all duration-300 shrink-0 ${starred ? 'bg-amber-500/15 border-amber-500/30 text-amber-400 hover:bg-amber-500/10' : 'bg-white/[0.03] border-white/[0.08] text-white/40 hover:border-amber-500/30 hover:text-amber-400/80 hover:bg-amber-500/[0.06]'} disabled:opacity-50`}>
                                <svg className={`w-4 h-4 transition-transform ${starring ? 'animate-spin' : starred ? 'scale-110' : ''}`} fill={starred ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={starred ? 0 : 1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
                                <span>{starCount}</span>
                            </button>
                        </div>
                        {skill.description && <p className="font-satoshi text-white/40 text-base leading-relaxed mb-4">{skill.description}</p>}
                        <div className="flex items-center gap-2.5 flex-wrap">
                            {skill.category && <span className="px-2.5 py-1 rounded-lg bg-accent/10 border border-accent/20 text-accent text-[11px] font-satoshi font-bold uppercase tracking-wider">{skill.category}</span>}
                            <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-satoshi font-bold uppercase tracking-wider ${isPrivate ? 'bg-white/[0.04] border-white/10 text-white/25' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>{isPrivate ? 'Private' : 'Public'}</span>
                        </div>
                    </div>

                    <Link to={authorUsername ? `/u/${authorUsername}` : '#'} className="flex items-center gap-3.5 mb-8 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-accent/20 hover:bg-white/[0.04] transition-all duration-300 group">
                        {authorAvatar && <img src={authorAvatar} alt={authorName} loading="lazy" width={40} height={40} className="w-10 h-10 rounded-full border border-white/10 object-cover shrink-0" />}
                        <div className="flex-1 min-w-0">
                            <p className="font-satoshi font-semibold text-sm text-white/80 group-hover:text-white transition-colors truncate">{authorName}</p>
                            {authorUsername && <p className="font-satoshi text-xs text-white/30 truncate">@{authorUsername}</p>}
                        </div>
                    </Link>

                    <SkillActionBar
                        compact
                        className="mb-4"
                        actions={[
                            { key: 'copy', icon: 'copy', label: copied ? 'Copied!' : 'Copy', ariaLabel: 'Copy skill markdown', onClick: handleCopy, status: copied ? 'success' : undefined },
                            { key: 'share', icon: 'share', label: linkCopied ? 'Link copied!' : 'Share', ariaLabel: 'Share skill link', onClick: handleShare, status: linkCopied ? 'success' : undefined },
                            { key: 'download', icon: 'download', label: '.md', ariaLabel: 'Download markdown file', onClick: handleDownload, primary: true },
                        ]}
                        secondaryActions={[
                            isGuest && { key: 'signin', icon: 'save', label: 'Sign in to Save', ariaLabel: 'Sign in to save skill', onClick: openAuthModal },
                            !isGuest && !isOwner && { key: 'save', icon: 'save', label: saving ? 'Saving...' : isSaved ? 'Saved' : 'Save', ariaLabel: isSaved ? 'Remove from saved skills' : 'Save skill', onClick: handleSaveSkill, loading: saving, active: isSaved },
                        ]}
                    />

                    <SkillViewer
                        className="mb-6"
                        rootName={slug(skill.title)}
                        markdownContent={skill.content || ''}
                        locked={isGuest}
                        showTabs={!isGuest}
                        onLockedAction={openAuthModal}
                        onActiveContentChange={setViewerContent}
                    />

                    {isOwner && (
                        <div className="flex items-center gap-2 flex-wrap">
                            <button onClick={handleToggleVisibility} disabled={working} className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] text-white/40 font-satoshi text-xs font-medium hover:text-accent/70 hover:border-accent/20 hover:bg-accent/[0.04] transition-all disabled:opacity-40">{isPrivate ? 'Make Public' : 'Make Private'}</button>
                            <button onClick={() => setShowDeleteConfirm(true)} disabled={working} className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] text-white/40 font-satoshi text-xs font-medium hover:text-red-400/70 hover:border-red-500/20 hover:bg-red-500/[0.04] transition-all disabled:opacity-40">Delete</button>
                        </div>
                    )}
                </div>
            </main>

            <Toast message={toast} onDismiss={() => setToast(null)} />

            {showDeleteConfirm && (
                <ConfirmDialog
                    title="Delete Skill"
                    message={<><span className="text-white/70 font-semibold">"{skill.title}"</span>{' '}will be permanently deleted. This action cannot be undone.</>}
                    confirmLabel="Delete"
                    onConfirm={handleDelete}
                    onCancel={() => setShowDeleteConfirm(false)}
                    working={working}
                />
            )}
        </>
    )
}
