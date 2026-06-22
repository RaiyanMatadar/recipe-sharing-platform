// Recipe Detail page
// Shows full recipe with rating, bookmark, comments, and ingredient substitutions
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { doc, getDoc, updateDoc, deleteDoc, arrayUnion } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import StarRating from '../components/StarRating'
import CommentSection from '../components/CommentSection'

function RecipeDetail() {
  const { id } = useParams()
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [userRating, setUserRating] = useState(0)

  // Hardcoded ingredient substitutions
  const substitutions = [
    { original: 'Butter', substitute: 'Coconut Oil (vegan)' },
    { original: 'Eggs', substitute: 'Flax Egg (vegan)' },
    { original: 'Milk', substitute: 'Almond Milk (dairy-free)' },
    { original: 'Sugar', substitute: 'Honey or Maple Syrup' },
    { original: 'Flour', substitute: 'Almond Flour (gluten-free)' },
    { original: 'Cream', substitute: 'Coconut Cream (vegan)' },
  ]

  // Fetch recipe on mount
  useEffect(() => {
    fetchRecipe()
    checkBookmark()
  }, [id])

  // Fetch recipe from Firestore
  const fetchRecipe = async () => {
    try {
      const docRef = doc(db, 'recipes', id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data()
        console.log('Recipe:', data)
        setRecipe({ id: docSnap.id, ...data })
      } else {
        console.log('Recipe not found')
      }
    } catch (err) {
      console.log('Error:', err)
    }
    setLoading(false)
  }

  // Check if recipe is bookmarked by current user
  const checkBookmark = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
      if (userDoc.exists()) {
        const bookmarks = userDoc.data().bookmarks || []
        setIsBookmarked(bookmarks.includes(id))
      }
    } catch (err) {
      console.log('Error checking bookmark:', err)
    }
  }

  // Handle rating submission
  const handleRate = async (rating) => {
    setUserRating(rating)

    try {
      const docRef = doc(db, 'recipes', id)
      // Get current ratings and add new one
      const currentRatings = recipe.ratings || []
      const newRatings = [...currentRatings, rating]

      await updateDoc(docRef, { ratings: newRatings })

      // Update local state
      setRecipe({ ...recipe, ratings: newRatings })
    } catch (err) {
      console.log('Error:', err)
    }
  }

  // Handle bookmark toggle
  const handleBookmark = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid))

      if (userDoc.exists()) {
        let bookmarks = userDoc.data().bookmarks || []

        if (isBookmarked) {
          // Remove from bookmarks
          bookmarks = bookmarks.filter((b) => b !== id)
        } else {
          // Add to bookmarks
          bookmarks = [...bookmarks, id]
        }

        await updateDoc(doc(db, 'users', currentUser.uid), { bookmarks })
        setIsBookmarked(!isBookmarked)
      }
    } catch (err) {
      console.log('Error:', err)
    }
  }

  // Handle delete recipe
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) {
      return
    }

    try {
      await deleteDoc(doc(db, 'recipes', id))
      navigate('/home')
    } catch (err) {
      console.log('Error:', err)
    }
  }

  // Calculate average rating
  const getAverageRating = () => {
    if (!recipe?.ratings || recipe.ratings.length === 0) {
      return 0
    }
    const sum = recipe.ratings.reduce((a, b) => a + b, 0)
    return (sum / recipe.ratings.length).toFixed(1)
  }

  // Get YouTube embed URL from regular YouTube URL
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null
    const youtubeMatch = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s?]+)/
    )
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`
    }
    return url
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500">Loading recipe...</p>
        </div>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32">
          <svg className="w-24 h-24 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500">Recipe not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden mb-8 shadow-xl">
          {/* Recipe Image */}
          <img
            src={
              recipe.image_url ||
              'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1200'
            }
            alt={recipe.title}
            className="w-full h-80 md:h-96 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
            {/* Category */}
            <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full mb-3">
              {recipe.category}
            </span>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-bold mb-3 font-serif">{recipe.title}</h1>

            {/* Author and Rating */}
            <div className="flex flex-wrap items-center gap-4 text-white/90">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-2">
                  {recipe.author_name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span>by {recipe.author_name}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-amber-400 text-lg">★</span>
                <span className="font-medium">{getAverageRating()}</span>
                <span className="text-white/70">({recipe.ratings?.length || 0} reviews)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
          {/* Bookmark Button */}
          <button
            onClick={handleBookmark}
            className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-medium transition-all duration-300 ${
              isBookmarked
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50'
            }`}
          >
            <svg className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
          </button>

          {/* Edit/Delete buttons - only for recipe author */}
          {currentUser.uid === recipe.author_id && (
            <>
              <button
                onClick={() => navigate(`/edit/${id}`)}
                className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50 transition-all duration-300 font-medium"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit</span>
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-white border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 transition-all duration-300 font-medium"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Delete</span>
              </button>
            </>
          )}
        </div>

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {recipe.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-4 py-2 bg-orange-50 text-orange-600 rounded-full text-sm font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Video (if provided) */}
        {recipe.video_url && (
          <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.483-4.535a1 1 0 011.026-.123A1 1 0 0121 5.87V18.13a1 1 0 01-1.491.87L15 14M4 6h10a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" />
                </svg>
                Video Tutorial
              </h2>
            </div>
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                src={getYouTubeEmbedUrl(recipe.video_url)}
                title="Recipe Video"
                className="w-full h-80"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}

        {/* Ingredients & Instructions Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Ingredients */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-4 font-serif flex items-center">
                <span className="w-8 h-8 bg-orange-100 text-orange-500 rounded-lg flex items-center justify-center mr-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </span>
                Ingredients
              </h2>
              <pre className="whitespace-pre-wrap text-gray-600 bg-gray-50 p-4 rounded-xl text-sm leading-relaxed">
                {recipe.ingredients}
              </pre>
            </div>
          </div>

          {/* Instructions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 font-serif flex items-center">
                <span className="w-8 h-8 bg-orange-100 text-orange-500 rounded-lg flex items-center justify-center mr-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                Instructions
              </h2>
              <div
                className="prose max-w-none text-gray-600"
                dangerouslySetInnerHTML={{ __html: recipe.instructions }}
              />
            </div>
          </div>
        </div>

        {/* Rate this Recipe */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 mb-8 border border-orange-100">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 font-serif">Rate this Recipe</h3>
              <p className="text-gray-500 text-sm">Share your experience with others</p>
            </div>
            <div className="flex items-center space-x-4">
              <StarRating
                rating={userRating}
                onRate={handleRate}
                readonly={userRating > 0}
              />
              {userRating > 0 && (
                <span className="text-orange-500 font-medium">Thanks!</span>
              )}
            </div>
          </div>
        </div>

        {/* Ingredient Substitutions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-2 font-serif flex items-center">
            <span className="w-8 h-8 bg-green-100 text-green-500 rounded-lg flex items-center justify-center mr-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4-4m-4 4l4-4" />
              </svg>
            </span>
            Ingredient Substitutions
          </h2>
          <p className="text-gray-500 text-sm mb-4 mt-2">Common substitutions for dietary needs</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {substitutions.map((sub, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-800 font-medium">{sub.original}</span>
                  <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <span className="text-green-600 text-sm">{sub.substitute}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <CommentSection recipeId={id} />
        </div>
      </div>
    </div>
  )
}

export default RecipeDetail
