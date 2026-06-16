import {
    databases,
    isAppwriteConfigured,
    ID,
    Query,
    Permission,
    Role,
    DATABASE_ID,
    COMMENTS_TABLE_ID,
} from './appwrite'

function requireAppwrite() {
    if (!isAppwriteConfigured || !databases) {
        throw new Error('Appwrite is not configured.')
    }
}

/** Normalise Appwrite $id → id */
function normalise(doc) {
    if (!doc) return null
    return { ...doc, id: doc.$id }
}

/**
 * Fetch all comments for a skill, oldest-first.
 * @param {string} skillId  — db skill $id  OR  "github:{repo}:{path}"
 */
export async function getComments(skillId) {
    requireAppwrite()
    const res = await databases.listDocuments(
        DATABASE_ID,
        COMMENTS_TABLE_ID,
        [
            Query.equal('skill_id', skillId),
            Query.orderAsc('$createdAt'),
            Query.limit(200),
        ]
    )
    return res.documents.map(normalise)
}

/**
 * Post a new comment.
 * @param {object} opts
 * @param {string} opts.skillId    — db skill $id OR "github:{repo}:{path}"
 * @param {string} opts.skillType  — "db" | "github"
 * @param {string} opts.body       — comment text (max 2000 chars)
 * @param {object} opts.user       — Appwrite user object ({ $id, email })
 * @param {object} opts.profile    — app profile ({ username, avatar_url })
 */
export async function postComment({ skillId, skillType, body, user, profile }) {
    requireAppwrite()
    if (!user) throw new Error('You must be signed in to comment.')

    const trimmed = body?.trim()
    if (!trimmed) throw new Error('Comment cannot be empty.')
    if (trimmed.length > 2000) throw new Error('Comment is too long (max 2000 characters).')

    const username  = profile?.username || user.email?.split('@')[0] || 'anon'
    const avatarUrl = profile?.avatar_url || null

    const perms = [
        Permission.read(Role.any()),
        Permission.delete(Role.user(user.$id)),
    ]

    const doc = await databases.createDocument(
        DATABASE_ID,
        COMMENTS_TABLE_ID,
        ID.unique(),
        {
            skill_id:   skillId,
            skill_type: skillType,
            user_id:    user.$id,
            username,
            avatar_url: avatarUrl,
            body:       trimmed,
        },
        perms
    )
    return normalise(doc)
}

/**
 * @param {string} commentId 
 */
export async function deleteComment(commentId) {
    requireAppwrite()
    await databases.deleteDocument(DATABASE_ID, COMMENTS_TABLE_ID, commentId)
}