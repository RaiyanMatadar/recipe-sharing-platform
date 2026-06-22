// RecipeCard component
// Shows a recipe as a card with image, title, category, rating, author
import { Link } from 'react-router-dom'

function RecipeCard({ recipe, showActions = false, onEdit, onDelete }) {
  // Calculate average rating
  const getAverageRating = () => {
    if (!recipe.ratings || recipe.ratings.length === 0) {
      return 0
    }
    const sum = recipe.ratings.reduce((a, b) => a + b, 0)
    return (sum / recipe.ratings.length).toFixed(1)
  }

  // Placeholder image if no image provided
  const imageUrl = recipe.image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400'

  const ratingCount = recipe.ratings?.length || 0
  const avgRating = getAverageRating()

  return (
    <div className="recipe-card bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 group">
      {/* Recipe Image */}
      <Link to={`/recipe/${recipe.id}`} className="block relative overflow-hidden">
        <img
          src={imageUrl}
          alt={recipe.title}
          className="w-full h-52 object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-sm text-gray-700 shadow-sm">
            {recipe.category}
          </span>
        </div>
      </Link>

      <div className="p-5">
        {/* Title */}
        <Link to={`/recipe/${recipe.id}`}>
          <h3 className="text-lg font-bold text-gray-800 group-hover:text-orange-500 transition-colors duration-200 line-clamp-1 font-serif">
            {recipe.title}
          </h3>
        </Link>

        {/* Author */}
        <div className="flex items-center mt-2 text-sm text-gray-500">
          <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {recipe.author_name}
        </div>

        {/* Rating */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center">
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-lg ${
                    star <= Math.round(avgRating) ? 'text-amber-400' : 'text-gray-200'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-500">
              {avgRating}
            </span>
          </div>
          <span className="text-xs text-gray-400">
            {ratingCount} {ratingCount === 1 ? 'review' : 'reviews'}
          </span>
        </div>

        {/* Tags - show first 2 */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {recipe.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
              >
                {tag}
              </span>
            ))}
            {recipe.tags.length > 2 && (
              <span className="text-xs px-2 py-0.5 text-gray-400">
                +{recipe.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Edit and Delete buttons */}
        {showActions && (
          <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={() => onEdit(recipe.id)}
              className="flex-1 flex items-center justify-center space-x-1.5 bg-gray-50 text-gray-700 py-2.5 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-all text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Edit</span>
            </button>
            <button
              onClick={() => onDelete(recipe.id)}
              className="flex-1 flex items-center justify-center space-x-1.5 bg-gray-50 text-gray-700 py-2.5 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default RecipeCard
