// Edit Recipe page
// Similar to Create Recipe but loads existing recipe data
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'

import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

function EditRecipe() {
  const { id } = useParams()
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  // Form state
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Breakfast')
  const [tags, setTags] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [ingredients, setIngredients] = useState('')
  const [instructions, setInstructions] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Categories for dropdown
  const categories = [
    { name: 'Vegan', icon: '🥗' },
    { name: 'Dessert', icon: '🍰' },
    { name: 'Quick Meal', icon: '⚡' },
    { name: 'Breakfast', icon: '🍳' },
    { name: 'Dinner', icon: '🍲' },
  ]

  // Fetch recipe data on mount
  useEffect(() => {
    fetchRecipe()
  }, [id])

  // Fetch recipe from Firestore
  const fetchRecipe = async () => {
    try {
      const docRef = doc(db, 'recipes', id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data()

        // Check if current user is the author
        if (data.author_id !== currentUser.uid) {
          setError('You can only edit your own recipes')
          setLoading(false)
          return
        }

        // Fill form with existing data
        setTitle(data.title)
        setCategory(data.category)
        setTags(data.tags ? data.tags.join(', ') : '')
        setImageUrl(data.image_url || '')
        setVideoUrl(data.video_url || '')
        setIngredients(data.ingredients)
        setInstructions(data.instructions)
      } else {
        setError('Recipe not found')
      }
    } catch (err) {
      console.log('Error:', err)
      setError('Something went wrong')
    }
    setLoading(false)
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    // Validate form
    if (!title || !ingredients || !instructions) {
      setError('Please fill in all required fields')
      setSaving(false)
      return
    }

    // Parse tags
    const tagArray = tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag !== '')

    try {
      const docRef = doc(db, 'recipes', id)
      await updateDoc(docRef, {
        title,
        category,
        tags: tagArray,
        image_url: imageUrl,
        video_url: videoUrl,
        ingredients,
        instructions,
      })

      navigate('/my-recipes')
    } catch (err) {
      console.log('Error:', err)
      setError('Something went wrong. Please try again.')
    }

    setSaving(false)
  }

  // Quill editor configuration
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      ['clean'],
    ],
  }

  const quillFormats = [
    'header',
    'bold',
    'italic',
    'underline',
    'list',
    'bullet',
    'link',
    'image',
  ]

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

  if (error && !title) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl text-center">
            <svg className="w-12 h-12 mx-auto mb-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-medium">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl mb-4 shadow-lg shadow-orange-500/30">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2 font-serif">Edit Recipe</h1>
          <p className="text-gray-500">Update your culinary creation</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6 flex items-center space-x-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Recipe Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
              <span className="w-8 h-8 bg-orange-100 text-orange-500 rounded-lg flex items-center justify-center mr-3 text-sm font-bold">1</span>
              Basic Information
            </h2>

            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Recipe Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition bg-gray-50 focus:bg-white"
                  placeholder="Give your recipe a name..."
                />
              </div>

              {/* Category and Tags */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition bg-gray-50 focus:bg-white appearance-none"
                    >
                      {categories.map((cat) => (
                        <option key={cat.name} value={cat.name}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                    <svg className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition bg-gray-50 focus:bg-white"
                    placeholder="easy, healthy, spicy..."
                  />
                  <p className="text-xs text-gray-400 mt-1">Separate with commas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Media Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
              <span className="w-8 h-8 bg-orange-100 text-orange-500 rounded-lg flex items-center justify-center mr-3 text-sm font-bold">2</span>
              Media (Optional)
            </h2>

            <div className="space-y-6">
              {/* Image URL */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Image URL
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition bg-gray-50 focus:bg-white"
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
              </div>

              {/* Video URL */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Video URL
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.483-4.535a1 1 0 011.026-.123A1 1 0 0121 5.87V18.13a1 1 0 01-1.491.87L15 14M4 6h10a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition bg-gray-50 focus:bg-white"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Ingredients Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
              <span className="w-8 h-8 bg-orange-100 text-orange-500 rounded-lg flex items-center justify-center mr-3 text-sm font-bold">3</span>
              Ingredients <span className="text-red-400 text-sm ml-1">*</span>
            </h2>

            <div>
              <textarea
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                required
                rows={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition bg-gray-50 focus:bg-white resize-none"
                placeholder="List your ingredients, one per line..."
              />
              <p className="text-xs text-gray-400 mt-2">Enter each ingredient on a new line</p>
            </div>
          </div>

          {/* Instructions Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
              <span className="w-8 h-8 bg-orange-100 text-orange-500 rounded-lg flex items-center justify-center mr-3 text-sm font-bold">4</span>
              Instructions <span className="text-red-400 text-sm ml-1">*</span>
            </h2>

            <div className="rounded-xl overflow-hidden border border-gray-200">
              <ReactQuill
                theme="snow"
                value={instructions}
                onChange={setInstructions}
                modules={quillModules}
                formats={quillFormats}
                placeholder="Write your cooking instructions here..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pb-8">
            <button
              type="submit"
              disabled={saving}
              className="w-full md:w-auto md:min-w-[300px] bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 px-12 rounded-xl font-semibold shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-300 disabled:opacity-50 disabled:shadow-none transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditRecipe
