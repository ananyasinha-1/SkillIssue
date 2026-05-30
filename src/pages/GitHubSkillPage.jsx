import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useAuth } from '../context/AuthContext'
import {
    fetchSkillFiles,
    fetchFileContentByPath,
    downloadSkillAsZip,
    getOrgAvatarUrl,
} from '../lib/githubService'
import SEO, { jsonLdSchemas } from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import SkillViewer from '../components/SkillViewer'
import SkillActionBar from '../components/SkillActionBar'
import Toast from '../components/Toast'

// ── Shared markdown component map (mirrors SkillDetailPage) ────────────────
const MD = {
    h1: ({ children }) => <h1 className="font-satoshi font-semibold text-2xl text-white mb-4 mt-6 first:mt-0 pb-2 border-b border-white/10">{children}</h1>,
    h2: ({ children }) => <h2 className="font-satoshi font-semibold text-xl text-white/90 mb-3 mt-5 first:mt-0 pb-1.5 border-b border-white/[0.07]">{children}</h2>,
    h3: ({ children }) => <h3 className="font-satoshi font-medium text-base text-white/85 mb-2 mt-4 first:mt-0">{children}</h3>,
    h4: ({ children }) => <h4 className="font-satoshi font-medium text-sm text-white/80 mb-2 mt-3 first:mt-0">{children}</h4>,
    p: ({ children }) => <p className="font-satoshi text-sm text-white/60 mb-3 leading-relaxed last:mb-0">{children}</p>,
    ul: ({ children }) => <ul className="list-disc list-outside pl-5 mb-3 space-y-1">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal list-outside pl-5 mb-3 space-y-1">{children}</ol>,
    li: ({ children }) => <li className="font-satoshi text-sm text-white/60 leading-relaxed">{children}</li>,
    strong: ({ children }) => <strong className="font-semibold text-white/85">{children}</strong>,
    em: ({ children }) => <em className="italic text-white/70">{children}</em>,
    a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-[#6bbcff] underline underline-offset-2 transition-colors">{children}</a>,
    code: ({ inline, children }) => inline
        ? <code className="font-mono text-[12px] text-accent/90 bg-accent/10 px-1.5 py-0.5 rounded">{children}</code>
        : <code className="block font-mono text-[12px] text-white/70 bg-white/[0.04] border border-white/[0.06] rounded-xl p-4 overflow-x-auto mb-3 leading-relaxed">{children}</code>,
    pre: ({ children }) => <>{children}</>,
    blockquote: ({ children }) => <blockquote className="border-l-2 border-accent/40 pl-4 my-3 italic text-white/45">{children}</blockquote>,
    hr: () => <hr className="border-none h-px bg-white/10 my-5" />,
    table: ({ children }) => <div className="overflow-x-auto mb-3"><table className="w-full text-sm font-satoshi border-collapse">{children}</table></div>,
    thead: ({ children }) => <thead className="border-b border-white/10">{children}</thead>,
    th: ({ children }) => <th className="text-left py-2 px-3 text-white/70 font-semibold text-xs uppercase tracking-wide">{children}</th>,
    td: ({ children }) => <td className="py-2 px-3 text-white/50 border-t border-white/[0.05]">{children}</td>,
    img: ({ src, alt }) => <img src={src} alt={alt} loading="lazy" className="max-w-full rounded-lg my-3" />,
}

export default function GitHubSkillPage() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const { user: authUser, openAuthModal } = useAuth()

    const repo = searchParams.get('repo') || ''
    const path = searchParams.get('path') || ''

    // Derive display name from path (last segment, prettified)
    const rawName = path.split('/').filter(Boolean).pop() || repo
    const displayName = rawName.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

    // Derive company from repo owner
    const repoOwner = repo.split('/')[0] || ''
    const avatarUrl = repo ? getOrgAvatarUrl(repo) : null

    const [content, setContent] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [skillFiles, setSkillFiles] = useState([])

    const [viewMode, setViewMode] = useState('rendered')
    const [copied, setCopied] = useState(false)
    const [linkCopied, setLinkCopied] = useState(false)
    const [downloading, setDownloading] = useState(false)
    const [toast, setToast] = useState(null)
    const [activeFile, setActiveFile] = useState(null)
    const [activeContent, setActiveContent] = useState(null)
    const [viewerContent, setViewerContent] = useState('')
    const [fileLoading, setFileLoading] = useState(false)

    const isGuest = !authUser

    // ── Fetch markdown content ────────────────────────────────────────────
    useEffect(() => {
        if (!repo || !path) {
            setError('Invalid share link — missing repo or path.')
            setLoading(false)
            return
        }

        setLoading(true)
        setError(null)

        fetchSkillFiles(repo, path)
            .then((files) => {
                if (Array.isArray(files)) setSkillFiles(files)
                const skillMd = files.find((f) => f.name.toUpperCase() === 'SKILL.MD')
                const anyMd = files.find((f) => f.name.toLowerCase().endsWith('.md'))
                const target = skillMd || anyMd
                if (!target) throw new Error('No .md file found in this skill folder.')
                return fetchFileContentByPath(repo, target.path)
            })
            .then(setContent)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }, [repo, path])

    function showToast(msg) {
        setToast(msg)
        setTimeout(() => setToast(null), 3000)
    }

    function handleCopy() {
        const src = viewerContent || activeContent || content
        if (!src) return
        navigator.clipboard.writeText(src)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    async function handleFileClick(file) {
        setActiveFile(file)
        setActiveContent(null)
        setFileLoading(true)
        setViewMode('raw')
        try {
            const text = await fetchFileContentByPath(repo, file.path)
            setActiveContent(text)
        } catch {
            setActiveContent(`// Could not load ${file.name}`)
        } finally {
            setFileLoading(false)
        }
    }

    async function handleShare() {
        const url = window.location.href
        if (navigator.share) {
            try { await navigator.share({ title: displayName, url }) } catch { /* cancelled */ }
        } else {
            await navigator.clipboard.writeText(url)
            setLinkCopied(true)
            showToast('Link copied to clipboard!')
            setTimeout(() => setLinkCopied(false), 2000)
        }
    }

    async function handleDownload() {
        if (!authUser) { openAuthModal(); return }
        if (!repo || !path) return
        setDownloading(true)
        try {
            await downloadSkillAsZip(repo, path, rawName)
        } catch (err) {
            showToast('Download failed: ' + err.message)
        } finally {
            setDownloading(false)
        }
    }

    // ── Split for guest paywall ───────────────────────────────────────────
    function splitMarkdown(md) {
        if (!md) return { preview: '', rest: '' }
        const blocks = md.split(/\n\n+/)
        return {
            preview: blocks.slice(0, 2).join('\n\n'),
            rest: blocks.slice(2).join('\n\n'),
        }
    }

    // ── Loading state ─────────────────────────────────────────────────────
    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <svg className="w-8 h-8 text-accent animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            </main>
        )
    }

    // ── Error / bad link ──────────────────────────────────────────────────
    if (error || !repo || !path) {
        return (
            <main className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-accent/5 border border-accent/10 flex items-center justify-center">
                    <svg className="w-8 h-8 text-accent/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                </div>
                <h1 className="font-clash font-bold text-3xl">Skill not found</h1>
                <p className="font-satoshi text-white/40 max-w-sm">
                    {error || 'This share link appears to be invalid or the skill has been removed.'}
                </p>
                <Link to="/browse" className="btn-primary">Browse Skills</Link>
            </main>
        )
    }

    const { preview, rest } = splitMarkdown(content || '')
    const hasMore = rest.trim().length > 0
    const githubUrl = `https://github.com/${repo}/tree/main/${path}`

    return (
        <>
            <SEO
                title={`${displayName} — GitHub Skill File`}
                description={`${displayName} skill file from ${repoOwner} on GitHub. Browse, copy, and use this AI skill file with Claude, ChatGPT, Gemini, Cursor and more.`}
                path={`/skill/github?repo=${encodeURIComponent(repo)}&path=${encodeURIComponent(path)}`}
                jsonLd={jsonLdSchemas.breadcrumb([
                    { name: 'Home', url: '/' },
                    { name: 'Browse Skills', url: '/browse' },
                    { name: displayName },
                ])}
            />
            <main className="relative min-h-screen pt-28 pb-24">
                {/* Ambient glow */}
                <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-accent/[0.04] rounded-full blur-[140px] pointer-events-none" />

                <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6">
                    <Breadcrumbs items={[
                        { label: 'Browse Skills', to: '/browse' },
                        { label: displayName },
                    ]} />
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 mb-8 text-white/30 hover:text-white/60 font-satoshi text-sm transition-colors group"
                    >
                        <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        Back
                    </button>

                    {/* ── Header ── */}
                    <div className="mb-8">
                        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                            <h1 className="font-clash font-bold text-3xl sm:text-4xl text-white leading-tight flex-1">
                                {displayName}
                            </h1>

                            {/* GitHub badge */}
                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/40 text-xs font-satoshi font-semibold shrink-0">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                                GitHub Skill
                            </span>
                        </div>

                        {/* Repo tag */}
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="px-2.5 py-1 rounded-lg bg-accent/10 border border-accent/20 text-accent text-[11px] font-satoshi font-bold uppercase tracking-wider">
                                Open Source
                            </span>
                            <span className="font-satoshi text-[11px] text-white/20 font-mono">{repo}</span>
                        </div>
                    </div>

                    {/* ── Source card (mirrors author card) ── */}
                    <a
                        href={githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3.5 mb-8 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-accent/20 hover:bg-white/[0.04] transition-all duration-300 group"
                    >
                        {avatarUrl && (
                            <img
                                src={avatarUrl}
                                alt={repoOwner}
                                loading="lazy"
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded-lg border border-white/10 object-cover shrink-0"
                            />
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="font-satoshi font-semibold text-sm text-white/80 group-hover:text-white transition-colors truncate">
                                {repoOwner}
                            </p>
                            <p className="font-satoshi text-xs text-white/30 truncate font-mono">{repo}</p>
                        </div>
                        <svg className="w-4 h-4 text-white/20 group-hover:text-accent/50 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                    </a>

                    <SkillActionBar
                        compact
                        className="mb-4"
                        actions={[
                            { key: 'copy', icon: 'copy', label: copied ? 'Copied!' : 'Copy', ariaLabel: 'Copy skill markdown', onClick: handleCopy, status: copied ? 'success' : undefined },
                            { key: 'share', icon: 'share', label: linkCopied ? 'Link copied!' : 'Share', ariaLabel: 'Share skill link', onClick: handleShare, status: linkCopied ? 'success' : undefined },
                            { key: 'download', icon: 'download', label: downloading ? 'Zipping...' : '.zip', ariaLabel: 'Download skill as zip', onClick: handleDownload, loading: downloading, primary: true },
                        ]}
                        secondaryActions={[
                            { key: 'github', icon: 'github', label: 'GitHub', ariaLabel: 'Open skill on GitHub', href: githubUrl },
                            isGuest && { key: 'signin', icon: 'save', label: 'Sign in to Save', ariaLabel: 'Sign in to save skill', onClick: openAuthModal },
                        ]}
                    />

                    <SkillViewer
                        className="mb-6"
                        files={skillFiles}
                        rootName={rawName}
                        markdownContent={content || ''}
                        locked={isGuest}
                        showTabs={!isGuest}
                        onLockedAction={openAuthModal}
                        fetchFileContent={(file) => fetchFileContentByPath(repo, file.path)}
                        onActiveContentChange={setViewerContent}
                    />
                </div>
            </main>

            {/* ── Toast ── */}
            <Toast message={toast} onDismiss={() => setToast(null)} />
        </>
    )
}
