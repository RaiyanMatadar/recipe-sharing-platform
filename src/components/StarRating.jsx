// StarRating component
// Shows 5 stars that user can click to rate a recipe
import { useState } from 'react'

function StarRating({ rating, onRate, readonly = false }) {
  const [hover, setHover] = useState(0)

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onRate && onRate(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={`star-icon text-2xl ${
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          } focus:outline-none transition-all duration-200`}
        >
          <span
            className={`${
              star <= (hover || rating) ? 'text-amber-400' : 'text-gray-200'
            } ${!readonly && star <= (hover || rating) ? 'drop-shadow-sm' : ''}`}
          >
            ★
          </span>
        </button>
      ))}
    </div>
  )
}

export default StarRating
