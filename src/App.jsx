// Main App component with routing
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'

// Pages
import LoginRegister from './pages/LoginRegister'
import Home from './pages/Home'
import CreateRecipe from './pages/CreateRecipe'
import EditRecipe from './pages/EditRecipe'
import RecipeDetail from './pages/RecipeDetail'
import MyRecipes from './pages/MyRecipes'
import Bookmarks from './pages/Bookmarks'
import MealPlanner from './pages/MealPlanner'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route - Login/Register */}
          <Route path="/" element={<LoginRegister />} />

          {/* Protected Routes */}
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/create"
            element={
              <PrivateRoute>
                <CreateRecipe />
              </PrivateRoute>
            }
          />
          <Route
            path="/edit/:id"
            element={
              <PrivateRoute>
                <EditRecipe />
              </PrivateRoute>
            }
          />
          <Route
            path="/recipe/:id"
            element={
              <PrivateRoute>
                <RecipeDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-recipes"
            element={
              <PrivateRoute>
                <MyRecipes />
              </PrivateRoute>
            }
          />
          <Route
            path="/bookmarks"
            element={
              <PrivateRoute>
                <Bookmarks />
              </PrivateRoute>
            }
          />
          <Route
            path="/meal-planner"
            element={
              <PrivateRoute>
                <MealPlanner />
              </PrivateRoute>
            }
          />

          {/* Redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
