import { useState, useCallback } from 'react'

/**
 * SkillHoverPreview
 * -----------------
 * A glassmorphic overlay that appears on card hover.
 * Must be placed *inside* the card root element that has className="group relative".
 *
 * Props
 * -----
 * title            – skill title (fallback heading)
 * description      – pre-loaded description text (optional)
 * subtitle         – fallback text shown when description is empty (e.g. "by OpenAI · code-review.md")
 * fetchDescription – async () => string — called once on first hover to lazy-load description
 * author           – author name / handle (optional)
 * avatarUrl        – URL of the author avatar (optional)
 * tags             – string[] of tag labels (optional, max 4 shown)
 * category         – category string (optional)
 * onCopy           – () => void — shown as "Copy" quick action (optional)
 * onShare          – () => void — shown as "Share" quick action (optional)
 * onDownload       – () => void — shown as "Download" quick action (optional)
 * accentClass      – Tailwind text-color class for accent elements, default 'text-accent'
 * borderClass      – Tailwind border-color for the card accent, default 'border-accent/30'
 * position         – 'top' | 'bottom' (default 'top') — where the preview pops from
 */
export default function SkillHoverPreview({
    title,
    description,
    subtitle,
    fetchDescription,
    author,
    avatarUrl,
    tags = [],
    category,
    onCopy,
    onShare,
    onDownload,
    accentClass = 'text-accent',
    borderClass = 'border-accent/30',
    position = 'top',
}) {
    const [shareCopied, setShareCopied] = useState(false)
    // Lazy-loaded description state
    const [lazyDesc, setLazyDesc] = useState(null)
    const [lazyLoading, setLazyLoading] = useState(false)
    const [lazyFetched, setLazyFetched] = useState(false)

    function handleShare(e) {
        e.stopPropagation()
        if (onShare) {
            onShare()
            setShareCopied(true)
            setTimeout(() => setShareCopied(false), 2000)
        }
    }

    // Called when the group-hover triggers the panel into view.
    // We use onMouseEnter on the preview div itself (pointer-events become active on hover).
    const handleMouseEnter = useCallback(async () => {
        if (!fetchDescription || lazyFetched || lazyLoading) return
        setLazyLoading(true)
        setLazyFetched(true)
        try {
            const text = await fetchDescription()
            if (text) setLazyDesc(text)
        } catch {
            /* silently ignore — subtitle or placeholder will show */
        } finally {
            setLazyLoading(false)
        }
    }, [fetchDescription, lazyFetched, lazyLoading])

    const hasActions = onCopy || onShare || onDownload
    const visibleTags = tags.slice(0, 4)

    // The description to actually display, in priority order:
    // 1. pre-loaded prop, 2. lazy-fetched from SKILL.md, 3. subtitle fallback, 4. placeholder
    const displayDesc = description || lazyDesc || null

    // Position classes — appear above or below the card
    const positionClasses = position === 'bottom'
        ? 'top-[calc(100%+8px)] bottom-auto origin-top'
        : 'bottom-[calc(100%+8px)] top-auto origin-bottom'

    return (
        <div
            className={`
                skill-hover-preview
                absolute left-1/2 -translate-x-1/2 z-50 w-[calc(100%+16px)] max-w-xs
                pointer-events-none group-hover:pointer-events-auto
                opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100
                transition-all duration-200 ease-out
                ${positionClasses}
            `}
            onClick={e => e.stopPropagation()}
            onMouseEnter={handleMouseEnter}
        >
            {/* Arrow pointing toward card */}
            <div className={`absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45
                bg-navy-100 border ${borderClass}
                ${position === 'bottom'
                    ? '-top-[5px] border-b-0 border-r-0'
                    : '-bottom-[5px] border-t-0 border-l-0'
                }
            `} />

            {/* Card body */}
            <div className={`
                relative rounded-2xl overflow-hidden
                bg-gradient-to-b from-navy-100 to-navy-50
                border ${borderClass}
                shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.03)]
                backdrop-blur-sm
                p-4
                flex flex-col gap-3
            `}>
                {/* Shimmer top edge */}
                <div className={`absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-current to-transparent ${accentClass} opacity-20`} />

                {/* Author row */}
                {author && (
                    <div className="flex items-center gap-2 min-w-0">
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt={author}
                                loading="lazy"
                                className="w-5 h-5 rounded-full border border-white/10 bg-white/5 object-cover shrink-0"
                            />
                        ) : (
                            <span className={`w-5 h-5 rounded-full ${accentClass} opacity-40 bg-current shrink-0`} />
                        )}
                        <span className="font-satoshi text-[11px] text-white/50 truncate">
                            {author}
                        </span>
                        {category && (
                            <>
                                <span className="w-0.5 h-0.5 rounded-full bg-white/15 shrink-0" />
                                <span className="font-satoshi text-[10px] text-white/30 uppercase tracking-wide shrink-0">
                                    {category}
                                </span>
                            </>
                        )}
                    </div>
                )}

                {/* Description / lazy loading state */}
                {lazyLoading ? (
                    <div className="flex flex-col gap-1.5">
                        <div className="skeleton-line w-full" />
                        <div className="skeleton-line w-4/5" />
                        <div className="skeleton-line w-3/5" />
                    </div>
                ) : displayDesc ? (
                    <p className="font-satoshi text-xs text-white/55 leading-relaxed line-clamp-3">
                        {displayDesc}
                    </p>
                ) : subtitle ? (
                    <p className="font-satoshi text-xs text-white/40 leading-relaxed line-clamp-2">
                        {subtitle}
                    </p>
                ) : (
                    <p className="font-satoshi text-xs text-white/30 italic leading-relaxed">
                        No description available.
                    </p>
                )}

                {/* Tags */}
                {visibleTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {visibleTags.map(tag => (
                            <span
                                key={tag}
                                className="inline-flex items-center px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-white/35 font-satoshi text-[10px] font-medium"
                            >
                                #{tag}
                            </span>
                        ))}
                        {tags.length > 4 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06] text-white/20 font-satoshi text-[10px]">
                                +{tags.length - 4}
                            </span>
                        )}
                    </div>
                )}

                {/* Quick actions */}
                {hasActions && (
                    <div className="flex items-center gap-2 pt-1 border-t border-white/[0.05]" onClick={e => e.stopPropagation()}>
                        {onCopy && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onCopy() }}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] font-satoshi text-[11px] font-semibold text-white/50
                                    hover:bg-accent/10 hover:border-accent/25 hover:text-accent transition-all duration-200`}
                            >
                                {/* Copy icon */}
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5a1.125 1.125 0 011.125 1.125v7.5" />
                                </svg>
                                Copy
                            </button>
                        )}

                        {onShare && (
                            <button
                                onClick={handleShare}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] font-satoshi text-[11px] font-semibold
                                    ${shareCopied ? 'text-emerald-400 border-emerald-500/25' : 'text-white/50 hover:bg-accent/10 hover:border-accent/25 hover:text-accent'}
                                    transition-all duration-200`}
                            >
                                {shareCopied ? (
                                    <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                                ) : (
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>
                                )}
                                {shareCopied ? 'Copied!' : 'Share'}
                            </button>
                        )}

                        {onDownload && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onDownload() }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] font-satoshi text-[11px] font-semibold text-white/50
                                    hover:bg-emerald-500/10 hover:border-emerald-500/25 hover:text-emerald-300 transition-all duration-200"
                            >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                </svg>
                                .zip
                            </button>
                        )}

                        {/* View details hint */}
                        <span className="ml-auto font-satoshi text-[10px] text-white/20 flex items-center gap-1">
                            Click to open
                            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}
