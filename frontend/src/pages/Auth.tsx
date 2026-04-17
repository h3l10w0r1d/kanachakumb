import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/lib/api'
import { Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react'

type Mode = 'login' | 'register'

export default function Auth() {
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState<Mode>(
    searchParams.get('mode') === 'register' ? 'register' : 'login'
  )
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<any>()

  const switchMode = (m: Mode) => { setMode(m); setError(''); reset() }

  const onSubmit = async (data: any) => {
    setLoading(true); setError('')
    try {
      if (mode === 'login') {
        const resp = await authApi.login(data.email, data.password)
        const { access_token, refresh_token, user } = resp.data
        setAuth(user, access_token, refresh_token)
        navigate('/')
      } else {
        if (data.password !== data.confirm) {
          setError('Гайтнабаррере ланен ев-аменандам')
          setLoading(false); return
        }
        const resp = await authApi.register({
          email: data.email, full_name: data.full_name,
          phone: data.phone || undefined, password: data.password,
        })
        const { access_token, refresh_token, user } = resp.data
        setAuth(user, access_token, refresh_token)
        navigate('/subscription')
      }
    } catch (e: any) {
      setError(e.response?.data?.detail || (
        mode === 'login'
          ? 'Sutakan email kam gajtnabar. Khndrum enk noric pncel.'
          : 'Grancume dzakholjvec. Khndrum enk noric pncel.'
      ))
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left: Photo panel */}
      <div className="hidden md:flex relative bg-[#1c0e1e] flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,_#4a1942_0%,_#1c0e1e_70%)]" />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-[80px]" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-amber-600/15 rounded-full blur-[60px]" />
        <div className="relative">
          <Link to="/" className="flex items-center gap-3 text-white min-h-0 min-w-0">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
              </svg>
            </div>
            <span className="font-serif font-bold text-lg text-white">Kanach Kamurj</span>
          </Link>
        </div>
        <div className="relative space-y-6">
          <p className="text-white/40 text-sm uppercase tracking-widest">Mеr andamnerin masin</p>
          <blockquote className="text-white text-2xl font-serif leading-snug">
            "Amеn handipumits hеto urtakh em veradarnum tun."
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">👩</div>
            <div>
              <p className="text-white font-semibold">Marinе S.</p>
              <p className="text-white/50 text-sm">68 tarеkan</p>
            </div>
          </div>
        </div>
        <p className="relative text-white/25 text-sm">© 2025 Kanach Kamurj</p>
      </div>

      {/* Right: Form */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 bg-background">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 md:hidden min-h-0 min-w-0">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            <span className="text-muted-foreground text-base">Veradardal</span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-serif font-bold mb-2">
              {mode === 'login' ? 'Bari Galust' : 'Stextsek Hashiv'}
            </h1>
            <p className="text-muted-foreground text-lg">
              {mode === 'login'
                ? 'Mutq gorcetsreq dzеr hashiv'
                : 'Mianal Kanach Kamurj hamayunkin'}
            </p>
          </div>

          {/* Social auth */}
          <div className="space-y-3 mb-6">
            <button onClick={() => setError('Google-ov mutqy katarelvum е. Ogtagordsrek Email.')}
              className="w-full flex items-center justify-center gap-3 border-2 border-input rounded-xl px-5 py-3.5 text-base font-medium hover:bg-muted transition-colors">
              <img src="https://www.google.com/favicon.ico" alt="" className="w-5 h-5" />
              Sharuncakеl Google-ov
            </button>
            <button onClick={() => setError('Apple-ov mutqy katarelvum е. Ogtagordsrek Email.')}
              className="w-full flex items-center justify-center gap-3 border-2 border-input rounded-xl px-5 py-3.5 text-base font-medium hover:bg-muted transition-colors">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Sharuncakеl Apple-ov
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-4 text-sm text-muted-foreground">kam email-ov</span>
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
                className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 mb-5">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-base leading-relaxed">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === 'register' && (
                <motion.div key="name" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
                  <label className="block text-base font-semibold mb-1.5">Anun-azganun</label>
                  <Input placeholder="Anі Hovhannisyan"
                    {...register('full_name', { required: true, minLength: 2 })} />
                  {errors.full_name && <p className="text-red-600 text-sm mt-1">Lratsrek anun-azganuny</p>}
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-base font-semibold mb-1.5">El. hastsе</label>
              <Input type="email" placeholder="your@email.com"
                {...register('email', { required: true })} />
            </div>

            <AnimatePresence mode="wait">
              {mode === 'register' && (
                <motion.div key="phone" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
                  <label className="block text-base font-semibold mb-1.5">
                    Herakhоs <span className="font-normal text-muted-foreground">(кamèntir)</span>
                  </label>
                  <Input type="tel" placeholder="+374 XX XXX XXX" {...register('phone')} />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-base font-semibold mb-1.5">Gajtnabar</label>
              <div className="relative">
                <Input type={showPw ? 'text' : 'password'} placeholder="Nvazan 8 nish"
                  className="pr-12" {...register('password', { required: true, minLength: 8 })} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground min-h-0 min-w-0">
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-600 text-sm mt-1">Nvazan 8 nish</p>}
            </div>

            <AnimatePresence mode="wait">
              {mode === 'register' && (
                <motion.div key="confirm" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
                  <label className="block text-base font-semibold mb-1.5">Krnell Gajtnabar</label>
                  <Input type={showPw ? 'text' : 'password'} placeholder="••••••••"
                    {...register('confirm', { required: true })} />
                </motion.div>
              )}
            </AnimatePresence>

            <Button type="submit" size="lg" className="w-full rounded-xl mt-2" disabled={loading}>
              {loading ? 'Sparum...' : mode === 'login' ? 'Mutq Gorcetsel' : 'Gratsvеl Anvchaг'}
            </Button>
          </form>

          <p className="text-center text-base text-muted-foreground mt-6">
            {mode === 'login' ? (
              <>Dеrеvs hashiv chunek?{' '}
                <button onClick={() => switchMode('register')}
                  className="text-primary font-semibold hover:underline underline-offset-2 min-h-0 min-w-0">
                  Gratsvеl
                </button>
              </>
            ) : (
              <>Ardеn hashiv unek?{' '}
                <button onClick={() => switchMode('login')}
                  className="text-primary font-semibold hover:underline underline-offset-2 min-h-0 min-w-0">
                  Mutq gorcetsel
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
