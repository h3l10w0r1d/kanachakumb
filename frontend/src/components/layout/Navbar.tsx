import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { LogOut, User, Settings, Menu, X, Heart } from 'lucide-react'
import { useState } from 'react'

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group min-h-0 min-w-0">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-md">
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-xl font-bold text-primary leading-tight">Կանաչ Կամուրջ</p>
              <p className="text-sm text-muted-foreground">Հասմիկ Մկրտչյան</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/events">
              <Button variant="ghost" size="sm" className="text-base">
                📅 Միջոցառումներ
              </Button>
            </Link>
            <Link to="/subscription">
              <Button variant="ghost" size="sm" className="text-base">
                ⭐ Բաժանորդագրություն
              </Button>
            </Link>
            {isAuthenticated && user?.role === 'admin' && (
              <Link to="/admin">
                <Button variant="ghost" size="sm" className="text-base">
                  ⚙️ Կառավարում
                </Button>
              </Link>
            )}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 ml-2">
                <Link to="/profile">
                  <Button variant="outline" size="sm" className="text-base gap-2">
                    <User className="w-5 h-5" />
                    {user?.full_name?.split(' ')[0]}
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="text-base ml-2">
                  Մուտք գործել
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-3 rounded-xl hover:bg-muted transition-colors"
            aria-label="Ցանկ"
          >
            {menuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-2 pb-6">
            <Link to="/events" onClick={() => setMenuOpen(false)}>
              <div className="flex items-center gap-3 px-4 py-4 rounded-xl hover:bg-muted text-lg font-medium">
                📅 Միջոցառումներ
              </div>
            </Link>
            <Link to="/subscription" onClick={() => setMenuOpen(false)}>
              <div className="flex items-center gap-3 px-4 py-4 rounded-xl hover:bg-muted text-lg font-medium">
                ⭐ Բաժանորդագրություն
              </div>
            </Link>
            {isAuthenticated && user?.role === 'admin' && (
              <Link to="/admin" onClick={() => setMenuOpen(false)}>
                <div className="flex items-center gap-3 px-4 py-4 rounded-xl hover:bg-muted text-lg font-medium">
                  ⚙️ Կառավարում
                </div>
              </Link>
            )}
            {isAuthenticated ? (
              <>
                <Link to="/profile" onClick={() => setMenuOpen(false)}>
                  <div className="flex items-center gap-3 px-4 py-4 rounded-xl hover:bg-muted text-lg font-medium">
                    <User className="w-6 h-6" /> Իմ էջը
                  </div>
                </Link>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-4 rounded-xl hover:bg-muted text-lg font-medium text-destructive">
                  <LogOut className="w-6 h-6" /> Ելք
                </button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setMenuOpen(false)}>
                <Button className="w-full mt-2 text-lg" size="lg">Մուտք գործել</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
