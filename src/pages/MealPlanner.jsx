// Meal Planner page
// A weekly planner where user can plan meals for each day
import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

function MealPlanner() {
  const { currentUser } = useAuth()

  // State for meal plan
  const [mealPlan, setMealPlan] = useState({
    monday: { breakfast: '', lunch: '', dinner: '' },
    tuesday: { breakfast: '', lunch: '', dinner: '' },
    wednesday: { breakfast: '', lunch: '', dinner: '' },
    thursday: { breakfast: '', lunch: '', dinner: '' },
    friday: { breakfast: '', lunch: '', dinner: '' },
    saturday: { breakfast: '', lunch: '', dinner: '' },
    sunday: { breakfast: '', lunch: '', dinner: '' },
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [recipes, setRecipes] = useState([])
  const [savedMessage, setSavedMessage] = useState('')

  // Days of the week for display
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  // Meal types with icons
  const mealTypes = [
    { key: 'breakfast', label: 'Breakfast', icon: '🌅', color: 'from-amber-100 to-orange-50' },
    { key: 'lunch', label: 'Lunch', icon: '☀️', color: 'from-yellow-100 to-amber-50' },
    { key: 'dinner', label: 'Dinner', icon: '🌙', color: 'from-orange-100 to-red-50' },
  ]

  // Fetch meal plan and recipes on mount
  useEffect(() => {
    fetchMealPlan()
    fetchRecipes()
  }, [])

  // Fetch user's meal plan from Firestore
  const fetchMealPlan = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid))

      if (userDoc.exists() && userDoc.data().mealPlan) {
        setMealPlan(userDoc.data().mealPlan)
      }
    } catch (err) {
      console.log('Error:', err)
    }
    setLoading(false)
  }

  // Fetch all recipes for the dropdown
  const fetchRecipes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'recipes'))
      const recipeList = []
      querySnapshot.forEach((doc) => {
        recipeList.push({ id: doc.id, ...doc.data() })
      })
      setRecipes(recipeList)
    } catch (err) {
      console.log('Error:', err)
    }
  }

  // Handle meal plan change
  const handleChange = (day, mealType, value) => {
    setMealPlan((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealType]: value,
      },
    }))
  }

  // Handle save meal plan
  const handleSave = async () => {
    setSaving(true)

    try {
      await setDoc(doc(db, 'users', currentUser.uid), {
        mealPlan: mealPlan
      }, { merge: true })

      setSavedMessage('Meal plan saved successfully!')
      setTimeout(() => setSavedMessage(''), 3000)
    } catch (err) {
      console.log('Error:', err)
      setSavedMessage('Error saving. Please try again.')
    }

    setSaving(false)
  }

  // Count total meals planned
  const countMeals = () => {
    let count = 0
    days.forEach(day => {
      mealTypes.forEach(meal => {
        if (mealPlan[day][meal.key]) count++
      })
    })
    return count
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500">Loading meal plan...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl mb-4 shadow-lg shadow-orange-500/30">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2 font-serif">Meal Planner</h1>
          <p className="text-gray-500">Plan your weekly meals for easier grocery shopping and cooking</p>
        </div>

        {/* Stats and Save Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {countMeals()} meals planned
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {savedMessage && (
              <span className={`text-sm ${savedMessage.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
                {savedMessage}
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-300 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Save Plan</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Desktop Weekly Grid */}
        <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Days Header */}
          <div className="grid grid-cols-8 bg-gray-50 border-b border-gray-100">
            <div className="p-4 font-medium text-gray-600 text-sm">Meal</div>
            {days.map((day, index) => (
              <div key={day} className="p-4 font-semibold text-gray-800 text-center border-l border-gray-100">
                <div className="text-lg">{dayLabels[index]}</div>
              </div>
            ))}
          </div>

          {/* Meal Rows */}
          {mealTypes.map((meal, mealIndex) => (
            <div key={meal.key} className={`grid grid-cols-8 ${mealIndex < 2 ? 'border-b border-gray-100' : ''}`}>
              <div className={`p-4 bg-gradient-to-br ${meal.color} flex items-center`}>
                <div>
                  <span className="text-2xl mb-1 block">{meal.icon}</span>
                  <span className="font-medium text-gray-700 text-sm">{meal.label}</span>
                </div>
              </div>
              {days.map((day) => (
                <div key={day} className="p-2 border-l border-gray-100">
                  <input
                    type="text"
                    list={`recipes-${meal.key}-${day}`}
                    value={mealPlan[day][meal.key]}
                    onChange={(e) => handleChange(day, meal.key, e.target.value)}
                    placeholder="Add meal..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition hover:bg-gray-50"
                  />
                  <datalist id={`recipes-${meal.key}-${day}`}>
                    {recipes.map((recipe) => (
                      <option key={recipe.id} value={recipe.title} />
                    ))}
                  </datalist>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden space-y-4">
          {days.map((day) => (
            <div key={day} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                <h3 className="font-semibold text-lg capitalize">{day}</h3>
              </div>
              <div className="p-4 space-y-3">
                {mealTypes.map((meal) => (
                  <div key={meal.key} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-lg">
                      {meal.icon}
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 font-medium">{meal.label}</label>
                      <input
                        type="text"
                        list={`recipes-mobile-${meal.key}-${day}`}
                        value={mealPlan[day][meal.key]}
                        onChange={(e) => handleChange(day, meal.key, e.target.value)}
                        placeholder="Add meal..."
                        className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                      />
                      <datalist id={`recipes-mobile-${meal.key}-${day}`}>
                        {recipes.map((recipe) => (
                          <option key={recipe.id} value={recipe.title} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Recipe Suggestions */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Quick Add
          </h3>
          <p className="text-gray-500 text-sm mb-4">Click on a recipe to add it to your planner</p>
          <div className="flex flex-wrap gap-2">
            {recipes.slice(0, 8).map((recipe) => (
              <button
                key={recipe.id}
                onClick={() => {
                  // Find first empty slot and add the recipe
                  for (const day of days) {
                    for (const meal of mealTypes) {
                      if (!mealPlan[day][meal.key]) {
                        handleChange(day, meal.key, recipe.title)
                        return
                      }
                    }
                  }
                }}
                className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-full text-sm hover:bg-orange-50 hover:text-orange-600 transition-colors border border-gray-200 hover:border-orange-200"
              >
                {recipe.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MealPlanner
