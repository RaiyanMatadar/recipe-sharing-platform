// My Recipes page
// Shows only the logged-in user's recipes with edit and delete buttons
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import RecipeCard from '../components/RecipeCard'

function MyRecipes() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch user's recipes on mount
  useEffect(() => {
    fetchMyRecipes()
  }, [currentUser])

  // Fetch recipes created by the current user from Firestore
  const fetchMyRecipes = async () => {
    if (!currentUser?.uid) return

    try {
      const q = query(
        collection(db, 'recipes'),
        where('author_id', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)

      const recipeList = []
      querySnapshot.forEach((doc) => {
        recipeList.push({ id: doc.id, ...doc.data() })
      })

      console.log('My recipes:', recipeList)
      setRecipes(recipeList)
    } catch (err) {
      console.log('Error:', err)
    }
    setLoading(false)
  }

  // Handle edit - navigate to edit page
  const handleEdit = (recipeId) => {
    navigate(`/edit/${recipeId}`)
  }

  // Handle delete
  const handleDelete = async (recipeId) => {
    // Confirm before deleting
    if (!window.confirm('Are you sure you want to delete this recipe?')) {
      return
    }

    try {
      await deleteDoc(doc(db, 'recipes', recipeId))
      // Remove from local state
      setRecipes(recipes.filter((r) => r.id !== recipeId))
    } catch (err) {
      console.log('Error:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl mb-4 shadow-lg shadow-orange-500/30">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2 font-serif">My Recipes</h1>
          <p className="text-gray-500">Manage and organize your culinary creations</p>
        </div>

        {/* Stats Bar */}
        {!loading && recipes.length > 0 && (
          <div className="flex items-center justify-center space-x-8 mb-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-500">{recipes.length}</p>
              <p className="text-gray-500 text-sm">Recipes</p>
            </div>
            <div className="w-px h-12 bg-gray-200"></div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-500">
                {recipes.reduce((acc, r) => acc + (r.ratings?.length || 0), 0)}
              </p>
              <p className="text-gray-500 text-sm">Total Reviews</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500">Loading your recipes...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && recipes.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No recipes yet</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-6">
              You haven't created any recipes yet. Start sharing your culinary creations!
            </p>
            <button
              onClick={() => navigate('/create')}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Create Your First Recipe</span>
            </button>
          </div>
        )}

        {/* Recipe Grid */}
        {!loading && recipes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recipes.map((recipe, index) => (
              <div key={recipe.id} className={`fade-in stagger-${(index % 4) + 1}`}>
                <RecipeCard
                  recipe={recipe}
                  showActions={true}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyRecipes
    