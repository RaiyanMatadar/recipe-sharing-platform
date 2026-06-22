// AuthContext provides the current user to all components
// It listens to Firebase auth state changes
import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase'

// Create the context
const AuthContext = createContext()

// Custom hook to use the auth context
export function useAuth() {
  return useContext(AuthContext)
}

// AuthProvider component that wraps the app
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? 'logged in' : 'not logged in')

      if (user) {
        // Get the user's profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid))

        if (userDoc.exists()) {
          // User profile exists
          const userData = userDoc.data()
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            ...userData
          })
        } else {
          // User profile doesn't exist yet - use displayName from auth
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            name: user.displayName || user.email?.split('@')[0] || 'User'
          })
        }
      } else {
        setCurrentUser(null)
      }
      setLoading(false)
    })

    // Clean up the subscription when component unmounts
    return unsubscribe
  }, [])

  // Value to provide to all children
  const value = {
    currentUser,
    setCurrentUser,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
