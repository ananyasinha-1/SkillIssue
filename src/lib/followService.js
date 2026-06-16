import {
    databases,
    account,
    isAppwriteConfigured,
    ID,
    Query,
    Permission,
    Role,
    DATABASE_ID,
} from './appwrite'

export const FOLLOWS_TABLE_ID =
    import.meta.env.VITE_APPWRITE_FOLLOWS_TABLE_ID ?? 'follows'

function requireAppwrite() {
    if (!isAppwriteConfigured || !databases) {
        throw new Error('Appwrite is not configured.')
    }
}

function normalise(doc) {
    if (!doc) return null
    return { ...doc, id: doc.$id, created_at: doc.$createdAt }
}

async function findFollowDoc(followerId, followingId) {
    const res = await databases.listDocuments(DATABASE_ID, FOLLOWS_TABLE_ID, [
        Query.equal('follower_id', followerId),
        Query.equal('following_id', followingId),
        Query.limit(1),
    ])
    return res.documents[0] ?? null
}

export async function getFollowStatus(targetUserId) {
    requireAppwrite()
    try {
        const user = await account.get()
        if (!user || user.$id === targetUserId) return 'none'
        const doc = await findFollowDoc(user.$id, targetUserId)
        return doc ? doc.status : 'none'
    } catch {
        return 'none'
    }
}

export async function getFollowers(userId) {
    requireAppwrite()
    try {
        const res = await databases.listDocuments(DATABASE_ID, FOLLOWS_TABLE_ID, [
            Query.equal('following_id', userId),
            Query.equal('status', 'accepted'),
            Query.orderDesc('$createdAt'),
            Query.limit(500),
        ])
        return res.documents.map(doc => ({
            follow_doc_id: doc.$id,
            user_id: doc.follower_id,
            created_at: doc.$createdAt,
        }))
    } catch {
        return []
    }
}

export async function getFollowing(userId) {
    requireAppwrite()
    try {
        const res = await databases.listDocuments(DATABASE_ID, FOLLOWS_TABLE_ID, [
            Query.equal('follower_id', userId),
            Query.equal('status', 'accepted'),
            Query.orderDesc('$createdAt'),
            Query.limit(500),
        ])
        return res.documents.map(doc => ({
            follow_doc_id: doc.$id,
            user_id: doc.following_id,
            created_at: doc.$createdAt,
        }))
    } catch {
        return []
    }
}

export async function getPendingRequests(userId) {
    requireAppwrite()
    try {
        const res = await databases.listDocuments(DATABASE_ID, FOLLOWS_TABLE_ID, [
            Query.equal('following_id', userId),
            Query.equal('status', 'pending'),
            Query.orderAsc('$createdAt'),
            Query.limit(200),
        ])
        return res.documents.map(doc => ({
            follow_doc_id: doc.$id,
            user_id: doc.follower_id,
            created_at: doc.$createdAt,
        }))
    } catch {
        return []
    }
}

export async function loadFollowData(userId, isOwner, getProfilesByUserIds) {
    requireAppwrite()

    const [followerSlims, followingSlims, pendingSlims] = await Promise.all([
        getFollowers(userId),
        getFollowing(userId),
        isOwner ? getPendingRequests(userId) : Promise.resolve([]),
    ])

    const allIds = [
        ...new Set([
            ...followerSlims.map(s => s.user_id),
            ...followingSlims.map(s => s.user_id),
            ...pendingSlims.map(s => s.user_id),
        ]),
    ]

    const profileMap = allIds.length > 0 ? await getProfilesByUserIds(allIds) : {}

    const enrich = slim => ({
        ...slim,
        ...(profileMap[slim.user_id] ?? {}),
    })

    return {
        followers: followerSlims.map(enrich),
        following: followingSlims.map(enrich),
        pendingRequests: pendingSlims.map(enrich),
    }
}

export async function sendFollowRequest(targetUserId) {
    requireAppwrite()
    const user = await account.get()
    if (!user) throw new Error('Not authenticated.')
    if (user.$id === targetUserId) throw new Error('Cannot follow yourself.')

    const existing = await findFollowDoc(user.$id, targetUserId)
    if (existing) {
        if (existing.status === 'accepted') throw new Error('Already following.')
        if (existing.status === 'pending') throw new Error('Follow request already pending.')
    }

    const doc = await databases.createDocument(
        DATABASE_ID,
        FOLLOWS_TABLE_ID,
        ID.unique(),
        {
            follower_id: user.$id,
            following_id: targetUserId,
            status: 'pending',
        }
    )
    return normalise(doc)
}

export async function unfollowUser(targetUserId) {
    requireAppwrite()
    const user = await account.get()
    if (!user) throw new Error('Not authenticated.')

    const doc = await findFollowDoc(user.$id, targetUserId)
    if (!doc) return

    if (doc.follower_id !== user.$id) throw new Error('Unauthorized.')

    await databases.deleteDocument(DATABASE_ID, FOLLOWS_TABLE_ID, doc.$id)
}

export async function acceptFollowRequest(followDocId) {
    requireAppwrite()
    const user = await account.get()
    if (!user) throw new Error('Not authenticated.')

    const doc = await databases.getDocument(DATABASE_ID, FOLLOWS_TABLE_ID, followDocId)

    if (doc.following_id !== user.$id) {
        throw new Error('Unauthorized: only the target user can accept requests.')
    }
    if (doc.status !== 'pending') {
        throw new Error('This request is not pending.')
    }

    const updated = await databases.updateDocument(
        DATABASE_ID,
        FOLLOWS_TABLE_ID,
        followDocId,
        { status: 'accepted' }
    )
    return normalise(updated)
}

export async function rejectFollowRequest(followDocId) {
    requireAppwrite()
    const user = await account.get()
    if (!user) throw new Error('Not authenticated.')

    const doc = await databases.getDocument(DATABASE_ID, FOLLOWS_TABLE_ID, followDocId)

    if (doc.following_id !== user.$id) {
        throw new Error('Unauthorized: only the target user can reject requests.')
    }

    await databases.deleteDocument(DATABASE_ID, FOLLOWS_TABLE_ID, doc.$id)
}

export async function removeFollower(followerUserId) {
    requireAppwrite()
    const user = await account.get()
    if (!user) throw new Error('Not authenticated.')

    const doc = await findFollowDoc(followerUserId, user.$id)
    if (!doc) return

    if (doc.following_id !== user.$id) throw new Error('Unauthorized.')

    await databases.deleteDocument(DATABASE_ID, FOLLOWS_TABLE_ID, doc.$id)
}