import { useState, useEffect, useCallback } from 'react'
import { getComments, postComment, deleteComment } from '../lib/commentService'

/**
 * @param {object} opts
 * @param {string}  opts.skillId    
 * @param {string}  opts.skillType 
 * @param {boolean} opts.open      
 * @param {object}  opts.user     
 * @param {object}  opts.profile    
 * @returns {{ comments, loadingComments, submitting, submitComment, removeComment }}
 */
export function useComments({ skillId, skillType, open, user, profile }) {
    const [comments, setComments]               = useState([])
    const [loadingComments, setLoadingComments] = useState(false)
    const [submitting, setSubmitting]           = useState(false)
    
    const [deletingIds, setDeletingIds]         = useState(new Set())

    
    useEffect(() => {
        if (!open || !skillId) return
        let cancelled = false
        setLoadingComments(true)
        getComments(skillId)
            .then(docs => { if (!cancelled) setComments(docs) })
            .catch(err => { if (!cancelled) console.error('[useComments] fetch failed:', err) })
            .finally(() => { if (!cancelled) setLoadingComments(false) })
        return () => { cancelled = true }
    }, [open, skillId])

    
    const submitComment = useCallback(async (body) => {
        if (!user || !body?.trim() || submitting) return
        setSubmitting(true)

        
        const tempId = `temp_${Date.now()}`
        const optimistic = {
            id:         tempId,
            $id:        tempId,
            skill_id:   skillId,
            skill_type: skillType,
            user_id:    user.$id,
            username:   profile?.username || user.email?.split('@')[0] || 'anon',
            avatar_url: profile?.avatar_url || null,
            body:       body.trim(),
            created_at: new Date().toISOString(),
            $createdAt: new Date().toISOString(),
            _optimistic: true,
        }
        setComments(prev => [...prev, optimistic])

        try {
            const saved = await postComment({ skillId, skillType, body, user, profile })
           
            setComments(prev => prev.map(c => c.id === tempId ? saved : c))
        } catch (err) {
            console.error('[useComments] post failed:', err)
           
            setComments(prev => prev.filter(c => c.id !== tempId))
        } finally {
            setSubmitting(false)
        }
    }, [user, profile, skillId, skillType, submitting])

    
    const removeComment = useCallback(async (commentId) => {
        setDeletingIds(prev => new Set(prev).add(commentId))
       
        setComments(prev => prev.filter(c => c.id !== commentId))
        try {
            await deleteComment(commentId)
        } catch (err) {
            console.error('[useComments] delete failed:', err)
            
            getComments(skillId).then(docs => setComments(docs)).catch(() => {})
        } finally {
            setDeletingIds(prev => { const s = new Set(prev); s.delete(commentId); return s })
        }
    }, [skillId])

    return { comments, loadingComments, submitting, deletingIds, submitComment, removeComment }
}
