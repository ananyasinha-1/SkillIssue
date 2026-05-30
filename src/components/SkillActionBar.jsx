function Icon({ type, active = false, spinning = false }) {
    const cls = `w-4 h-4 ${spinning ? 'animate-spin' : ''}`
    if (type === 'check') return <svg className={`${cls} text-emerald-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
    if (type === 'share') return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>
    if (type === 'download') return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
    if (type === 'save') return <svg className={cls} fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" /></svg>
    if (type === 'github') return <svg className={cls} fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386C24 5.373 18.627 0 12 0z" /></svg>
    return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" /></svg>
}

function ActionButton({ action, compact }) {
    const active = action.active || action.status === 'success'
    const label = action.label || action.ariaLabel
    const base = action.primary
        ? 'bg-accent text-navy hover:bg-[#6bbcff] hover:shadow-[0_0_20px_rgba(75,169,255,0.3)]'
        : active
            ? 'border-accent/40 bg-accent/20 text-accent'
            : 'border-white/10 bg-white/[0.03] text-white/60 hover:border-accent/30 hover:bg-white/[0.06] hover:text-white/80'
    const className = `flex items-center gap-1.5 sm:gap-2 ${compact ? 'px-3 py-1.5 rounded-lg text-xs' : 'px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-sm'} border font-satoshi font-semibold transition-all duration-300 disabled:opacity-50 group ${base} ${action.className || ''}`
    const icon = <Icon type={action.status === 'success' ? 'check' : action.icon} active={active} spinning={action.loading} />

    if (action.href) {
        return (
            <a href={action.href} target="_blank" rel="noopener noreferrer" title={action.title || label} aria-label={action.ariaLabel || label} className={className}>
                {icon}
                <span className={compact ? '' : 'hidden sm:inline'}>{label}</span>
            </a>
        )
    }
    return (
        <button type="button" onClick={action.onClick} disabled={action.disabled || action.loading} title={action.title || label} aria-label={action.ariaLabel || label} className={className}>
            {icon}
            <span className={compact ? '' : 'hidden sm:inline'}>{label}</span>
        </button>
    )
}

export default function SkillActionBar({ actions = [], secondaryActions = [], compact = false, className = '' }) {
    return (
        <div className={`flex items-center justify-between gap-2 flex-wrap ${className}`}>
            <div className="flex items-center gap-2 flex-wrap">
                {actions.filter(Boolean).map((action) => <ActionButton key={action.key || action.label} action={action} compact={compact} />)}
            </div>
            {secondaryActions.filter(Boolean).length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                    {secondaryActions.filter(Boolean).map((action) => <ActionButton key={action.key || action.label} action={action} compact={compact} />)}
                </div>
            )}
        </div>
    )
}
