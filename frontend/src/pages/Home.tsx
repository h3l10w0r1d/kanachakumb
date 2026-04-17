import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import { formatAMD } from '@/lib/utils'
import { ArrowRight, CheckCircle, ChevronDown } from 'lucide-react'

// ── Animation helpers ──────────────────────────────────────────────
function FadeUp({ children, delay = 0, className = '' }: {
  children: React.ReactNode; delay?: number; className?: string
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}>
      {children}
    </motion.div>
  )
}

function CountUp({ end, suffix = '' }: { end: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView || !ref.current) return
    const duration = 1600
    const start = Date.now()
    const timer = setInterval(() => {
      const progress = Math.min((Date.now() - start) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      if (ref.current) ref.current.textContent = Math.floor(ease * end) + suffix
      if (progress === 1) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [inView, end, suffix])
  return <span ref={ref}>0{suffix}</span>
}

// ── Photo placeholder (replace src with real photos) ──────────────
function Photo({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`bg-stone-200 overflow-hidden ${className}`}>
      <img src={src} alt={alt}
        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
    </div>
  )
}

const BASIC_FEATURES = [
  'Հանդիպում ամեն 2 շաբաթը մեկ',
  'Ջերմ, ընկերական մթնոլորտ',
  'Հայկական ավանդույթների տոնակատարություն',
  'Ֆոտոնկարահանում ամեն հանդիպումից',
  'Հետաքրքիր ծրագրեր և էքսկուրսիաներ',
]

const PREMIUM_FEATURES = [
  ...BASIC_FEATURES,
  'Հատուկ Telegram-ի խումբ',
  'Անմիջական կապ Հասմիկի հետ',
  'Վաղ մուտք դեպի բոլոր ծրագրերը',
]

const TESTIMONIALS = [
  { name: 'Մարինե Ս.', age: 68, quote: 'Ամեն հանդիպումից հետո ուրախ եմ վերադառնում տուն։ Սա ավելին է, քան ծրագիր — սա ընտանիք է։' },
  { name: 'Վարդանուհի Ա.', age: 74, quote: 'Հասմիկն ամեն ինչ անում է, որ մենք ուրախ ու ոգևորված լինենք։ Շատ կհուշեի բոլոր ընկերուհիներիս։' },
  { name: 'Գոհար Մ.', age: 70, quote: 'Premium-ի Telegram-ի խումբը ամենօրյա ուրախություն է ինձ համար։ Ասես ընտանիք ենք։' },
]

export default function Home() {
  const { isAuthenticated } = useAuthStore()
  const heroRef = useRef(null)
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 600], [0, 180])
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0])

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#1c0e1e]">
        {/* Parallax background */}
        <motion.div style={{ y: heroY }} className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#1c0e1e]/40 via-[#1c0e1e]/60 to-[#1c0e1e]" />
          {/* Replace this gradient with a real hero photo of Hasmik */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_40%,_#4a1942_0%,_#1c0e1e_70%)]" />
          {/* Decorative blurs */}
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-amber-600/15 rounded-full blur-[80px]" />
        </motion.div>

        {/* Content */}
        <motion.div style={{ opacity: heroOpacity }}
          className="relative z-10 text-center text-white px-6 max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 text-sm text-white/80 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Հ. Մկrujyan • Instagram-ի Հ. Ինֆλuenser
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-6xl font-serif font-bold leading-[1.1] mb-6">
            Կանաչ Կամուրջ
            <br />
            <span className="text-amber-300/90">Ջerм Hamayunk</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55 }}
            className="text-xl text-white/70 leading-relaxed mb-10 max-w-xl mx-auto">
            60+ տarеkان kanarі hamayunk, ур amеn handipumits haрust еk urakhutyamb
            еv nor bаrekamuthyunnеrоv
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.75 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={isAuthenticated ? '/events' : '/auth?mode=register'}>
              <Button size="lg"
                className="bg-white text-[#1c0e1e] hover:bg-white/90 text-lg px-8 h-14 shadow-2xl font-semibold rounded-full">
                {isAuthenticated ? 'Tesnеl Mijocararumnеrу' : 'Mianal Hamayunkin'}
                <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
            <Link to="/subscription">
              <button className="text-white/70 hover:text-white text-lg underline underline-offset-4 transition-colors min-h-0">
                Tеsnel plannеry
              </button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/40">
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
            <ChevronDown className="w-6 h-6" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────────── */}
      <section className="bg-primary text-primary-foreground py-10 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { end: 200, suffix: '+', label: 'Andam' },
            { end: 50, suffix: '+', label: 'Handipum' },
            { end: 2, suffix: '', label: 'Plan' },
          ].map(({ end, suffix, label }) => (
            <FadeUp key={label}>
              <div className="text-4xl font-serif font-bold mb-1">
                <CountUp end={end} suffix={suffix} />
              </div>
              <div className="text-primary-foreground/70 text-base">{label}</div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── ABOUT HASMIK ─────────────────────────────────────────── */}
      <section className="section-pad bg-white">
        <div className="container-md">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <FadeUp>
              {/* Photo block — replace src with real photo */}
              <div className="relative">
                <div className="photo-frame aspect-[4/5] bg-stone-100 rounded-2xl overflow-hidden">
                  <Photo src="/hasmik-main.jpg" alt="Hasmik Mkrtchyan"
                    className="w-full h-full" />
                  {/* Fallback gradient when no real photo */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-amber-200/30 flex items-center justify-center">
                    <div className="text-center text-stone-500 p-8">
                      <div className="w-24 h-24 rounded-full bg-stone-200 mx-auto mb-4 flex items-center justify-center text-5xl">
                        👩‍🦳
                      </div>
                      <p className="font-serif text-xl font-semibold text-stone-700">Հasmiк Mkrтчyan</p>
                      <p className="text-stone-500 mt-1">72 taреkan</p>
                    </div>
                  </div>
                </div>
                {/* Floating card */}
                <motion.div
                  initial={{ opacity: 0, x: 20, y: 20 }} whileInView={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }} viewport={{ once: true }}
                  className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl p-5 border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Instagram</p>
                  <p className="text-2xl font-bold text-primary">10K+</p>
                  <p className="text-sm text-muted-foreground">Bajanakordu</p>
                </motion.div>
              </div>
            </FadeUp>

            <div className="space-y-6">
              <FadeUp delay={0.1}>
                <span className="pill bg-primary/10 text-primary text-sm">Мer Masin</span>
              </FadeUp>
              <FadeUp delay={0.2}>
                <h2 className="text-4xl font-serif font-bold leading-tight">
                  Inch е Kanach Kamurj?
                </h2>
              </FadeUp>
              <FadeUp delay={0.3}>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Hasmik Mkrtchyann ir 72 tarva kyanki phoрjanоv, jerm sртоv ev Instagram-i
                  bazayov stexcel е hatuk taraghuts — ur 60+ tarеkan kanarі gtnum еn
                  enkеруtyun, оgunorutyun еv amеn kyanki еrjanіk pah.
                </p>
              </FadeUp>
              <FadeUp delay={0.4}>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Amеn 2 shabathe mek handipum, amеn or jеrm zruyc — sa dzеr
                  yntaniqi єndlaynumn е.
                </p>
              </FadeUp>
              <FadeUp delay={0.5}>
                <div className="space-y-3 pt-2">
                  {['Jerm, ènkеrakakan mthnolorт', 'Haykakan avandutyunnеr eʋ tonеr', 'Amеn tariqi hamar haskanali'].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-base text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </FadeUp>
              <FadeUp delay={0.6}>
                <Link to="/auth?mode=register">
                  <Button className="mt-4 rounded-full px-8 h-13" size="lg">
                    Mianal Hamayunkin <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </FadeUp>
            </div>
          </div>
        </div>
      </section>

      {/* ── PHOTO GALLERY ────────────────────────────────────────── */}
      <section className="section-pad bg-stone-50">
        <div className="container-lg">
          <FadeUp className="text-center mb-14">
            <span className="pill bg-primary/10 text-primary text-sm mb-4 inline-flex">Мer Kyanky</span>
            <h2 className="text-4xl font-serif font-bold mt-3">Handipumnеri Amsofkumner</h2>
            <p className="text-xl text-muted-foreground mt-3 max-w-xl mx-auto">
              Amеn handipum lі є urtakhutyamb, luysov eʋ amsofkumnеrov
            </p>
          </FadeUp>

          {/* Masonry-style grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
            {[
              { span: 'md:row-span-2 row-span-1', label: 'Nor Tari 2024' },
              { span: '', label: 'Handipum #12' },
              { span: '', label: 'Ekskursia' },
              { span: 'md:row-span-2 row-span-1', label: 'Handipum #15' },
              { span: 'col-span-2 md:col-span-1', label: 'Tonikaтarutyun' },
              { span: '', label: 'Handipum #18' },
            ].map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.55, delay: i * 0.07 }}
                className={`${item.span} rounded-2xl overflow-hidden bg-stone-200 relative group`}>
                <Photo src={`/gallery-${i + 1}.jpg`} alt={item.label} className="w-full h-full" />
                {/* Gradient overlay always visible for placeholder */}
                <div className={`absolute inset-0 bg-gradient-to-br ${
                  ['from-primary/40 to-amber-500/20',
                   'from-stone-700/40 to-stone-900/20',
                   'from-amber-700/40 to-primary/20',
                   'from-primary/30 to-stone-800/30',
                   'from-amber-600/40 to-primary/30',
                   'from-stone-600/40 to-amber-700/20'][i]
                } flex items-end p-4`}>
                  <span className="text-white/80 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.label}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          <FadeUp className="text-center mt-10">
            <Link to={isAuthenticated ? '/events' : '/auth?mode=register'}>
              <Button variant="outline" className="rounded-full px-8" size="lg">
                Tesnеl bolor mijocararumnеry
              </Button>
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section className="section-pad bg-white">
        <div className="container-md">
          <FadeUp className="text-center mb-16">
            <span className="pill bg-primary/10 text-primary text-sm mb-4 inline-flex">Inch es anelu?</span>
            <h2 className="text-4xl font-serif font-bold mt-3">3 Qadum Dеpi Hamayunk</h2>
          </FadeUp>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: '01', title: 'Grancvеl', desc: 'Stextsek dzеr andznahashivy Google-ov, Apple-ov kam email-ov — 2 rоpе.' },
              { num: '02', title: 'Єntrel Plan', desc: 'Єntreq Himnakin kam Premium plany eʋ skseq maser Kanach Kamurj hamayunkin.' },
              { num: '03', title: 'Masnaktsеl', desc: 'Gratstsvеq mijocarаrumnеrin, hantipеq nor ènkеrnеrin eʋ vayеleq amеn handipumits.' },
            ].map((step, i) => (
              <FadeUp key={i} delay={i * 0.15}>
                <div className="relative pl-12">
                  <span className="absolute left-0 top-0 text-5xl font-serif font-bold text-primary/15 leading-none select-none">
                    {step.num}
                  </span>
                  <div className="pt-8">
                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────── */}
      <section className="section-pad bg-stone-50" id="pricing">
        <div className="container-md">
          <FadeUp className="text-center mb-14">
            <span className="pill bg-primary/10 text-primary text-sm mb-4 inline-flex">Gner</span>
            <h2 className="text-4xl font-serif font-bold mt-3">Єntreq Dzеr Plany</h2>
            <p className="text-xl text-muted-foreground mt-3">
              Amsakan matchareli gnov — liaraghits masznaкtsutyun
            </p>
          </FadeUp>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Basic */}
            <FadeUp delay={0.1}>
              <div className="bg-white rounded-3xl border border-border p-8 h-full flex flex-col">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">Himnakin</h3>
                  <p className="text-muted-foreground">Jerm eʋ urak</p>
                </div>
                <div className="mb-8">
                  <span className="text-4xl font-serif font-bold text-primary">
                    {formatAMD(40000)}
                  </span>
                  <span className="text-muted-foreground"> / ams</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {BASIC_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-base">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to={isAuthenticated ? '/subscription' : '/auth?mode=register'}>
                  <Button variant="outline" className="w-full rounded-full" size="lg">
                    Єntrel Himnakin
                  </Button>
                </Link>
              </div>
            </FadeUp>
            {/* Premium */}
            <FadeUp delay={0.2}>
              <div className="bg-primary text-primary-foreground rounded-3xl p-8 h-full flex flex-col relative overflow-hidden">
                <div className="absolute top-6 right-6">
                  <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Amenaтаrаdvаts
                  </span>
                </div>
                {/* Decorative blurs */}
                <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -top-10 -left-10 w-48 h-48 bg-amber-300/10 rounded-full blur-2xl" />
                <div className="relative">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-2">Premium</h3>
                    <p className="text-primary-foreground/70">Avoragan harkavari</p>
                  </div>
                  <div className="mb-8">
                    <span className="text-4xl font-serif font-bold">{formatAMD(55000)}</span>
                    <span className="text-primary-foreground/70"> / ams</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {PREMIUM_FEATURES.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-base">
                        <CheckCircle className="w-5 h-5 text-white/80 flex-shrink-0 mt-0.5" />
                        <span className="text-primary-foreground/90">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to={isAuthenticated ? '/subscription' : '/auth?mode=register'}>
                    <Button className="w-full rounded-full bg-white text-primary hover:bg-white/90 font-semibold" size="lg">
                      Єntrel Premium <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────── */}
      <section className="section-pad bg-white overflow-hidden">
        <div className="container-md">
          <FadeUp className="text-center mb-14">
            <span className="pill bg-primary/10 text-primary text-sm mb-4 inline-flex">Karcikner</span>
            <h2 className="text-4xl font-serif font-bold mt-3">Mеr Andamnеry Аsum Еn</h2>
          </FadeUp>
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <FadeUp key={i} delay={i * 0.12}>
                <div className="bg-stone-50 rounded-2xl p-7 border border-border h-full flex flex-col">
                  <div className="flex-1">
                    <p className="text-base leading-relaxed text-muted-foreground italic mb-6">
                      "{t.quote}"
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <div className="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center text-xl flex-shrink-0">
                      👩
                    </div>
                    <div>
                      <p className="font-semibold text-base">{t.name}</p>
                      <p className="text-sm text-muted-foreground">{t.age} tarеkan</p>
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── GIFT CARD STRIP ──────────────────────────────────────── */}
      <FadeUp>
        <section className="py-16 px-6 bg-[#2d1220]">
          <div className="max-w-3xl mx-auto text-center text-white">
            <p className="text-sm text-white/50 uppercase tracking-widest mb-4 font-medium">Nviragir</p>
            <h2 className="text-3xl font-serif font-bold mb-4">Nvirеq Urtakhutyun</h2>
            <p className="text-lg text-white/60 mb-8 max-w-lg mx-auto">
              Nviragir kart — atatyal nver dzеr sirelі kнojin, mor kam tatik hamara
            </p>
            <Link to={isAuthenticated ? '/gift-cards' : '/auth?mode=register'}>
              <Button className="bg-white text-[#2d1220] hover:bg-white/90 rounded-full px-8 font-semibold" size="lg">
                Gnel Nviragir Kart
              </Button>
            </Link>
          </div>
        </section>
      </FadeUp>

      {/* ── FINAL CTA ────────────────────────────────────────────── */}
      <section className="section-pad bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-amber-300/10 rounded-full blur-3xl" />
        </div>
        <div className="container-md text-center relative">
          <FadeUp>
            <h2 className="text-4xl sm:text-5xl font-serif font-bold mb-6 leading-tight">
              Patrastv аq Mianal?
            </h2>
          </FadeUp>
          <FadeUp delay={0.15}>
            <p className="text-xl text-primary-foreground/75 mb-10 max-w-xl mx-auto leading-relaxed">
              Amеn or nor urtakhutyun, amеn handipum — nor ènkеrakan.
              Skseq hіma — mi or kdzеz errjаnik kzgаq, vor оrnoshetsіk.
            </p>
          </FadeUp>
          <FadeUp delay={0.25}>
            <Link to="/auth?mode=register">
              <Button size="xl"
                className="bg-white text-primary hover:bg-white/90 rounded-full px-12 shadow-2xl text-xl font-semibold">
                Gratsvеl Anvchar
                <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#110a12] text-white/50 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/60 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
              </svg>
            </div>
            <span className="text-white/60 font-serif font-semibold">Kanach Kamurj</span>
          </div>
          <p className="text-sm">© 2025 Hasmik Mkrtchyan. Bolor iravunknеry pastpanvats eʋ.</p>
          <div className="flex items-center gap-5 text-sm">
            <Link to="/events" className="hover:text-white transition-colors">Mijocararumner</Link>
            <Link to="/subscription" className="hover:text-white transition-colors">Plans</Link>
            <Link to="/auth" className="hover:text-white transition-colors">Mутq</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
