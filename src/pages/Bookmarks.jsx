// Bookmarks page
// Shows all recipes the user has bookmarked
import { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import RecipeCard from '../components/RecipeCard'

function Bookmarks() {
  const { currentUser } = useAuth()

  const [bookmarkedRecipes, setBookmarkedRecipes] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch bookmarked recipes on mount
  useEffect(() => {
    fetchBookmarks()
  }, [])

  // Fetch user's bookmarks and then fetch those recipes
  const fetchBookmarks = async () => {
    try {
      // Get user's bookmark IDs
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid))

      if (!userDoc.exists()) {
        setLoading(false)
        return
      }

      const bookmarkIds = userDoc.data().bookmarks || []
      console.log('Bookmark IDs:', bookmarkIds)

      // If no bookmarks, return early
      if (bookmarkIds.length === 0) {
        setBookmarkedRecipes([])
        setLoading(false)
        return
      }

      // Fetch all bookmarked recipes
      const recipePromises = bookmarkIds.map(async (recipeId) => {
        const recipeDoc = await getDoc(doc(db, 'recipes', recipeId))
        if (recipeDoc.exists()) {
          return { id: recipeDoc.id, ...recipeDoc.data() }
        }
        return null
      })

      const recipes = await Promise.all(recipePromises)
      // Filter out nulls (in case a recipe was deleted)
      const validRecipes = recipes.filter((r) => r !== null)

      console.log('Bookmarked recipes:', validRecipes)
      setBookmarkedRecipes(validRecipes)
    } catch (err) {
      console.log('Error:', err)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl mb-4 shadow-lg shadow-orange-500/30">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2 font-serif">My Bookmarks</h1>
          <p className="text-gray-500">Your saved collection of favorite recipes</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500">Loading bookmarks...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && bookmarkedRecipes.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No bookmarks yet</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-6">
              Start exploring recipes and save your favorites to find them easily later.
            </p>
            <button
              onClick={() => window.location.href = '/home'}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Browse Recipes</span>
            </button>
          </div>
        )}

        {/* Recipe Grid */}
        {!loading && bookmarkedRecipes.length > 0 && (
          <>
            {/* Stats */}
            <div className="text-center mb-8">
              <span className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">
                {bookmarkedRecipes.length} saved {bookmarkedRecipes.length === 1 ? 'recipe' : 'recipes'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {bookmarkedRecipes.map((recipe, index) => (
                <div key={recipe.id} className={`fade-in stagger-${(index % 4) + 1}`}>
                  <RecipeCard recipe={recipe} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Bookmarks
