import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { PlatformProvider } from './context/PlatformContext'
import { router } from './router'

function App() {
  return (
    <PlatformProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </PlatformProvider>
  )
}

export default App
