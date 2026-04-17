import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/lib/api'
import { Heart, Eye, EyeOff, AlertCircle } from 'lucide-react'

type Mode = 'login' | 'register'

interface LoginForm {
  email: string
  password: string
}

interface RegisterForm {
  email: string
  full_name: string
  phone?: string
  password: string
  confirm_password: string
}

export default function Auth() {
  const [mode, setMode] = useState<Mode>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const loginForm = useForm<LoginForm>()
  const registerForm = useForm<RegisterForm>()

  const handleLogin = async (data: LoginForm) => {
    setIsLoading(true)
    setError('')
    try {
      const resp = await authApi.login(data.email, data.password)
      const { access_token, refresh_token, user } = resp.data
      setAuth(user, access_token, refresh_token)
      navigate('/')
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Մուտքը ձախողվեց։ Ստուգեք Email-ն ու գաղտնաբառը։')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (data: RegisterForm) => {
    if (data.password !== data.confirm_password) {
      registerForm.setError('confirm_password', { message: 'Գաղտնաբառերը չեն համընկնում' })
      return
    }
    setIsLoading(true)
    setError('')
    try {
      const resp = await authApi.register({
        email: data.email,
        full_name: data.full_name,
        phone: data.phone,
        password: data.password,
      })
      const { access_token, refresh_token, user } = resp.data
      setAuth(user, access_token, refresh_token)
      navigate('/subscription')
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Գրանցումն ձախողվեց։ Խնդրում ենք կրկին փորձեք։')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setError('Google-ով մուտքը կտեղադրվի շուտով։ Օգտագործեք Email/Գաղտնաբառ:')
  }

  const handleAppleAuth = async () => {
    setError('Apple-ով մուտքը կտեղադրվի շուտով։ Օգտագործեք Email/Գաղտնաբառ:')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-background to-rose-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-8 min-h-0 min-w-0">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-md">
            <Heart className="w-8 h-8 text-white fill-white" />
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">Կանաչ Կամուրջ</p>
          </div>
        </Link>

        <Card className="shadow-xl border-2">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-3xl">
              {mode === 'login' ? '👋 Բարի Գալուստ' : '✨ Գրանցվել'}
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              {mode === 'login'
                ? 'Մուտք գործեք ձեր հաշիվ'
                : 'Ստեղծեք ձեր անձնական հաշիվ'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 rounded-xl p-4">
                <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                <p className="text-base leading-relaxed">{error}</p>
              </div>
            )}

            {/* Social Auth */}
            <div className="space-y-3">
              <button
                onClick={handleGoogleAuth}
                className="w-full flex items-center justify-center gap-3 border-2 border-input rounded-xl px-5 py-4 text-lg font-medium hover:bg-muted transition-colors"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6" />
                Շարունակել Google-ով
              </button>
              <button
                onClick={handleAppleAuth}
                className="w-full flex items-center justify-center gap-3 border-2 border-input rounded-xl px-5 py-4 text-lg font-medium hover:bg-muted transition-colors"
              >
                <span className="text-2xl leading-none">🍎</span>
                Շարունակել Apple-ով
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-base">
                <span className="bg-background px-4 text-muted-foreground font-medium">կամ</span>
              </div>
            </div>

            {/* Login Form */}
            {mode === 'login' && (
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <div>
                  <label className="elder-label">📧 Էլ. հասցե</label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    {...loginForm.register('email', { required: true })}
                  />
                </div>
                <div>
                  <label className="elder-label">🔒 Գաղտնաբառ</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pr-14"
                      {...loginForm.register('password', { required: true })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground min-h-0 min-w-0"
                    >
                      {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                  {isLoading ? '⏳ Սպասեք...' : '✅ Մուտք գործել'}
                </Button>
              </form>
            )}

            {/* Register Form */}
            {mode === 'register' && (
              <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                <div>
                  <label className="elder-label">👤 Ձեր անուն-ազգանունը</label>
                  <Input
                    placeholder="Անի Հովհաննիսյան"
                    {...registerForm.register('full_name', { required: true, minLength: 2 })}
                  />
                </div>
                <div>
                  <label className="elder-label">📧 Էլ. հասցե</label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    {...registerForm.register('email', { required: true })}
                  />
                </div>
                <div>
                  <label className="elder-label">📱 Հեռախոս <span className="text-muted-foreground font-normal">(կամընտիր)</span></label>
                  <Input
                    type="tel"
                    placeholder="+374 XX XXX XXX"
                    {...registerForm.register('phone')}
                  />
                </div>
                <div>
                  <label className="elder-label">🔒 Գաղտնաբառ</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Նվազ. 8 նիշ"
                      className="pr-14"
                      {...registerForm.register('password', { required: true, minLength: 8 })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground min-h-0 min-w-0"
                    >
                      {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="elder-label">🔒 Կրկնեք Գաղտնաբառը</label>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...registerForm.register('confirm_password', { required: true })}
                  />
                  {registerForm.formState.errors.confirm_password && (
                    <p className="text-red-600 text-base mt-1">
                      {registerForm.formState.errors.confirm_password.message}
                    </p>
                  )}
                </div>
                <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                  {isLoading ? '⏳ Սպասեք...' : '✨ Գրանցվել Հիմա'}
                </Button>
              </form>
            )}

            {/* Toggle Mode */}
            <div className="text-center pt-2">
              {mode === 'login' ? (
                <p className="text-lg text-muted-foreground">
                  Դեռ հաշիվ չունե՞ք։{' '}
                  <button
                    onClick={() => { setMode('register'); setError('') }}
                    className="text-primary font-bold hover:underline min-h-0 min-w-0"
                  >
                    Գրանցվեք
                  </button>
                </p>
              ) : (
                <p className="text-lg text-muted-foreground">
                  Արդեն հաշիվ ունե՞ք։{' '}
                  <button
                    onClick={() => { setMode('login'); setError('') }}
                    className="text-primary font-bold hover:underline min-h-0 min-w-0"
                  >
                    Մուտք գործել
                  </button>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
