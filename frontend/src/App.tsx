import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Navbar } from '@/components/layout/Navbar'
import Home from '@/pages/Home'
import Auth from '@/pages/Auth'
import Events from '@/pages/Events'
import Subscription from '@/pages/Subscription'
import Profile from '@/pages/Profile'
import GiftCards from '@/pages/GiftCards'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminEvents from '@/pages/admin/AdminEvents'
import AdminUsers from '@/pages/admin/AdminUsers'
import AdminGiftCards from '@/pages/admin/AdminGiftCards'
import { useAuthStore } from '@/store/authStore'

const queryClient = new QueryClient()

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/auth" replace />
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/" replace />
  return <>{children}</>
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />

          <Route element={<AppLayout><Routes><Route path="/*" element={null} /></Routes></AppLayout>}>
            {/* This pattern doesn't work, use inline layout */}
          </Route>

          <Route path="/" element={<><Navbar /><Home /></>} />
          <Route path="/events" element={<><Navbar /><Events /></>} />
          <Route path="/subscription" element={<><Navbar /><ProtectedRoute><Subscription /></ProtectedRoute></>} />
          <Route path="/profile" element={<><Navbar /><ProtectedRoute><Profile /></ProtectedRoute></>} />
          <Route path="/gift-cards" element={<><Navbar /><ProtectedRoute><GiftCards /></ProtectedRoute></>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} >
            <Route index element={null} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="gift-cards" element={<AdminGiftCards />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
