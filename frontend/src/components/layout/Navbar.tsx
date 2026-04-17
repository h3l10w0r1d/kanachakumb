import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { LogOut, User, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const isHome = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  const handleLogout = () => { logout(); navigate('/') }

  const navLinks = [
    { to: '/events', label: 'Միջոցառումներ' },
    { to: '/subscription', label: 'Բաժանորդագրություն' },
    ...(isAuthenticated && user?.role === 'admin' ? [{ to: '/admin', label: 'Կառավարում' }] : []),
  ]

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled || !isHome || menuOpen
        ? 'bg-white/95 backdrop-blur-md border-b border-border shadow-sm'
        : 'bg-transparent'
    )}>
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-[72px]">
        <Link to="/" className="flex items-center gap-3 min-h-0 min-w-0 group">
          <div className={cn(
            'w-9 h-9 rounded-full flex items-center justify-center transition-colors',
            scrolled || !isHome ? 'bg-primary' : 'bg-white/20 backdrop-blur-sm'
          )}>
            <svg viewBox="0 0 24 24" fill="currentColor"
              className={cn('w-5 h-5', scrolled || !isHome ? 'text-white' : 'text-white')}>
              <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
            </svg>
          </div>
          <span className={cn(
            'font-serif font-bold text-xl tracking-tight transition-colors',
            scrolled || !isHome ? 'text-foreground' : 'text-white'
          )}>
            Կանաչ Կամուրջ
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to}>
              <button className={cn(
                'px-4 py-2 rounded-lg text-[15px] font-medium transition-colors min-h-0',
                scrolled || !isHome
                  ? 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              )}>
                {label}
              </button>
            </Link>
          ))}
          {isAuthenticated ? (
            <div className="flex items-center gap-2 ml-2">
              <Link to="/profile">
                <Button size="sm" variant={scrolled || !isHome ? 'outline' : 'secondary'}
                  className="gap-2 text-[15px]">
                  <User className="w-4 h-4" />
                  {user?.full_name?.split(' ')[0]}
                </Button>
              </Link>
              <button onClick={handleLogout}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors min-h-0 min-w-0">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Link to="/auth">
                <button className={cn(
                  'px-4 py-2 rounded-lg text-[15px] font-medium transition-colors min-h-0',
                  scrolled || !isHome
                    ? 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                )}>
                  Մուտք
                </button>
              </Link>
              <Link to="/auth?mode=register">
                <Button size="sm"
                  className={cn('text-[15px]', !scrolled && isHome && 'bg-white text-primary hover:bg-white/90')}>
                  Գրանցվել
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMenuOpen(!menuOpen)}
          className={cn(
            'md:hidden p-2 rounded-lg transition-colors min-h-0 min-w-0',
            scrolled || !isHome ? 'text-foreground hover:bg-muted' : 'text-white hover:bg-white/10'
          )}>
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-border px-6 py-4 space-y-1">
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to}>
              <div className="py-3.5 px-4 rounded-lg text-lg font-medium hover:bg-muted transition-colors">
                {label}
              </div>
            </Link>
          ))}
          <div className="pt-3 border-t border-border mt-3 space-y-2">
            {isAuthenticated ? (
              <>
                <Link to="/profile">
                  <div className="py-3.5 px-4 rounded-lg text-lg font-medium hover:bg-muted transition-colors flex items-center gap-3">
                    <User className="w-5 h-5" /> Իմ էջը
                  </div>
                </Link>
                <button onClick={handleLogout}
                  className="w-full py-3.5 px-4 rounded-lg text-lg font-medium text-destructive hover:bg-red-50 transition-colors flex items-center gap-3 min-h-0">
                  <LogOut className="w-5 h-5" /> Ելք
                </button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <div className="py-3.5 px-4 rounded-lg text-lg font-medium hover:bg-muted transition-colors">
                    Մուտք գործել
                  </div>
                </Link>
                <Link to="/auth?mode=register">
                  <Button className="w-full text-lg" size="lg">Գրանցվել անվճար</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
