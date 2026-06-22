// PrivateRoute component
// Redirects to login page if user is not logged in
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth()

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  // If not logged in, redirect to login page
  if (!currentUser) {
    return <Navigate to="/" replace />
  }

  // If logged in, show the protected content
  return children
}

export default PrivateRoute
