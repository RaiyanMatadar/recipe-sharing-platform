// Home page - Browse all recipes
// Shows search bar, category filters, and recipe cards
import { useState, useEffect } from 'react'
import { collection, query, orderBy, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import RecipeCard from '../components/RecipeCard'
import Navbar from '../components/Navbar'

function Home() {
  const [recipes, setRecipes] = useState([])
  const [filteredRecipes, setFilteredRecipes] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [loading, setLoading] = useState(true)

  // Categories with icons for filter buttons
  const categories = [
    { name: 'All', icon: '🍽️' },
    { name: 'Vegan', icon: '🥗' },
    { name: 'Dessert', icon: '🍰' },
    { name: 'Quick Meal', icon: '⚡' },
    { name: 'Breakfast', icon: '🍳' },
    { name: 'Dinner', icon: '🍲' },
  ]

  // Fetch all recipes on component mount
  useEffect(() => {
    fetchRecipes()
  }, [])

  // Filter recipes when search or category changes
  useEffect(() => {
    filterRecipes()
  }, [searchTerm, selectedCategory, recipes])

  // Fetch recipes from Firestore
  const fetchRecipes = async () => {
    try {
      const q = query(collection(db, 'recipes'), orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)

      const recipeList = []
      querySnapshot.forEach((doc) => {
        recipeList.push({ id: doc.id, ...doc.data() })
      })

      console.log('Fetched recipes:', recipeList)
      setRecipes(recipeList)
    } catch (err) {
      console.log('Error:', err)
    }
    setLoading(false)
  }

  // Filter recipes based on search and category
  const filterRecipes = () => {
    let filtered = recipes

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((recipe) =>
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((recipe) => recipe.category === selectedCategory)
    }

    setFilteredRecipes(filtered)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3 font-serif">
            Discover Delicious <span className="gradient-text">Recipes</span>
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Explore our collection of mouth-watering recipes from home cooks around the world
          </p>
        </div>

        {/* Search Section */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search recipes by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm text-gray-700 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-full font-medium transition-all duration-300 ${
                selectedCategory === cat.name
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-200 hover:bg-orange-50'
              }`}
            >
              <span className="text-lg">{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-500 font-medium">
            {loading ? 'Loading...' : `${filteredRecipes.length} recipes found`}
          </p>
          {selectedCategory !== 'All' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-600">
              {selectedCategory}
            </span>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500">Loading delicious recipes...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredRecipes.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No recipes found</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              {searchTerm
                ? `No recipes match "${searchTerm}". Try a different search term.`
                : 'No recipes in this category yet. Be the first to add one!'}
            </p>
          </div>
        )}

        {/* Recipe Grid */}
        {!loading && filteredRecipes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRecipes.map((recipe, index) => (
              <div key={recipe.id} className={`fade-in stagger-${(index % 4) + 1}`}>
                <RecipeCard recipe={recipe} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
