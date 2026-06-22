// CommentSection component
// Shows all comments for a recipe and allows adding new comments
import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'

function CommentSection({ recipeId }) {
  const { currentUser } = useAuth()
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Fetch comments on mount and when recipeId changes
  useEffect(() => {
    fetchComments()
  }, [recipeId])

  // Fetch comments from Firestore
  const fetchComments = async () => {
    try {
      const q = query(
        collection(db, 'comments'),
        where('recipeId', '==', recipeId),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)

      const commentList = []
      querySnapshot.forEach((doc) => {
        commentList.push({ id: doc.id, ...doc.data() })
      })

      setComments(commentList)
    } catch (err) {
      console.log('Error:', err)
    }
    setLoading(false)
  }

  // Handle adding a new comment
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setSubmitting(true)

    try {
      await addDoc(collection(db, 'comments'), {
        recipeId: recipeId,
        userId: currentUser.uid,
        userName: currentUser.name || currentUser.email?.split('@')[0] || 'User',
        text: newComment.trim(),
        createdAt: serverTimestamp()
      })

      setNewComment('')
      fetchComments()
    } catch (err) {
      console.log('Error:', err)
    }

    setSubmitting(false)
  }

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Just now'

    // Handle Firestore timestamp
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    const diff = now - date

    // Show relative time for recent comments
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-800 mb-6 font-serif flex items-center">
        <span className="w-8 h-8 bg-orange-100 text-orange-500 rounded-lg flex items-center justify-center mr-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </span>
        Comments ({comments.length})
      </h3>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              rows={2}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition resize-none bg-gray-50 focus:bg-white"
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="sm:self-end bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-300 disabled:opacity-50 disabled:shadow-none flex items-center justify-center space-x-2"
          >
            {submitting ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span>Post</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && comments.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-xl">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-gray-500 text-sm">
            No comments yet. Be the first to share your thoughts!
          </p>
        </div>
      )}

      {/* Comments List */}
      {!loading && comments.length > 0 && (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-orange-50 transition-colors"
            >
              {/* User Avatar */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {comment.userName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              </div>

              {/* Comment Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-gray-800">{comment.userName}</span>
                  <span className="text-gray-400 text-xs">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CommentSection
