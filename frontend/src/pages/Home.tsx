import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import { formatAMD } from '@/lib/utils'
import { ArrowRight, CheckCircle } from 'lucide-react'

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

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="pt-36 pb-16 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-sm font-medium text-primary uppercase tracking-widest mb-6">
            Հասմիկ Մկրտչյան · 60+ Համայնք
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-6xl font-serif font-bold text-foreground leading-[1.1] mb-6">
            Կանաչ Կամուրջ
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-xl text-muted-foreground leading-relaxed mb-10 max-w-xl mx-auto">
            60+ տարեկան կանանց համայնք — ուր ամեն հանդիպումից հեռանում ես
            ուրախությամբ եւ նոր ընկերություններով
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={isAuthenticated ? '/events' : '/auth?mode=register'}>
              <Button size="lg" className="rounded-full px-8 text-lg font-semibold shadow-sm">
                {isAuthenticated ? 'Տեսնել Միջոցառումները' : 'Միանալ Համայնքին'}
                <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
            <Link to="/subscription">
              <button className="text-muted-foreground hover:text-foreground text-sm transition-colors" style={{ minHeight: 0 }}>
                Տեսնել պլանները
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────────── */}
      <section className="border-y border-border py-10 px-6 bg-[#f9f7f5]">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { end: 200, suffix: '+', label: 'Անդամ' },
            { end: 50, suffix: '+', label: 'Հանդիպում' },
            { end: 2, suffix: '', label: 'Պլան' },
          ].map(({ end, suffix, label }) => (
            <FadeUp key={label}>
              <div className="text-4xl font-serif font-bold text-foreground mb-1">
                <CountUp end={end} suffix={suffix} />
              </div>
              <div className="text-muted-foreground text-sm">{label}</div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── ABOUT HASMIK ─────────────────────────────────────────── */}
      <section className="section-pad bg-white">
        <div className="container-md">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <FadeUp>
              <div className="relative">
                <div className="photo-frame aspect-[4/5] bg-stone-100 rounded-2xl overflow-hidden">
                  <Photo src="/hasmik-main.jpg" alt="Hasmik Mkrtchyan" className="w-full h-full" />
                  {/* Neutral fallback — shown when image is missing */}
                  <div className="absolute inset-0 bg-stone-100 flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="w-24 h-24 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                        <span className="font-serif text-3xl font-bold text-primary">ՀՄ</span>
                      </div>
                      <p className="font-serif text-xl font-semibold text-stone-700">Հասմիկ Մկրտչյան</p>
                      <p className="text-stone-500 mt-1 text-sm">72 տարեկան</p>
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
                  <p className="text-sm text-muted-foreground">Բաժանորդ</p>
                </motion.div>
              </div>
            </FadeUp>

            <div className="space-y-6">
              <FadeUp delay={0.1}>
                <span className="pill bg-primary/10 text-primary text-sm">Մեր Մասին</span>
              </FadeUp>
              <FadeUp delay={0.2}>
                <h2 className="text-4xl font-serif font-bold leading-tight">
                  Ի՞նչ է Կանաչ Կամուրջը
                </h2>
              </FadeUp>
              <FadeUp delay={0.3}>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Հասմիկ Մկրտչյանը իր 72 տարվա կյանքի փորձով, ջերմ սրտով եւ
                  Instagram-ի բազայով ստեղծել է հատուկ տարածություն — ուր 60+
                  տարեկան կանայք գտնում են ընկերություն, օգնություն եւ ամեն
                  կյանքի ուրախ պահ։
                </p>
              </FadeUp>
              <FadeUp delay={0.4}>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Ամեն 2 շաբաթը մեկ հանդիպում, ամեն օր ջերմ զրույց —
                  սա ձեր ընտանիքի ընդլայնումն է։
                </p>
              </FadeUp>
              <FadeUp delay={0.5}>
                <div className="space-y-3 pt-2">
                  {[
                    'Ջերմ, ընկերական մթնոլորտ',
                    'Հայկական ավանդույթներ եւ տոներ',
                    'Ամեն տարիքի համար հասկանալի',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-base text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </FadeUp>
              <FadeUp delay={0.6}>
                <Link to="/auth?mode=register">
                  <Button className="mt-4 rounded-full px-8" size="lg">
                    Միանալ Համայնքին <ArrowRight className="w-4 h-4 ml-1" />
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
            <span className="pill bg-primary/10 text-primary text-sm mb-4 inline-flex">Մեր Կյանքը</span>
            <h2 className="text-4xl font-serif font-bold mt-3">Հանդիպումների Պահերը</h2>
            <p className="text-xl text-muted-foreground mt-3 max-w-xl mx-auto">
              Ամեն հանդիպում լի է ուրախությամբ, լույսով եւ հիշատակներով
            </p>
          </FadeUp>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
            {[
              { span: 'md:row-span-2 row-span-1', label: 'Նոր Տարի 2024' },
              { span: '', label: 'Հանդիպում #12' },
              { span: '', label: 'Էքսկուրսիա' },
              { span: 'md:row-span-2 row-span-1', label: 'Հանդիպում #15' },
              { span: 'col-span-2 md:col-span-1', label: 'Տոնակատարություն' },
              { span: '', label: 'Հանդիպում #18' },
            ].map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.55, delay: i * 0.07 }}
                className={`${item.span} rounded-2xl overflow-hidden bg-stone-200 relative group`}>
                <Photo src={`/gallery-${i + 1}.jpg`} alt={item.label} className="w-full h-full" />
                <div className="absolute inset-0 flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                  <span className="text-white text-sm font-medium">{item.label}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <FadeUp className="text-center mt-10">
            <Link to={isAuthenticated ? '/events' : '/auth?mode=register'}>
              <Button variant="outline" className="rounded-full px-8" size="lg">
                Տեսնել բոլոր միջոցառումները
              </Button>
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section className="section-pad bg-white">
        <div className="container-md">
          <FadeUp className="text-center mb-16">
            <span className="pill bg-primary/10 text-primary text-sm mb-4 inline-flex">Ինչպե՞ս</span>
            <h2 className="text-4xl font-serif font-bold mt-3">3 Քայլ դեպի Համայնք</h2>
          </FadeUp>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: '01', title: 'Գրանցվել', desc: 'Ստեղծեք ձեր անձնահաշիվը Google-ով, Apple-ով կամ email-ով — 2 րոպե։' },
              { num: '02', title: 'Ընտրել Պլան', desc: 'Ընտրեք Հիմնական կամ Premium պլանը եւ սկսեք դառնալ Կանաչ Կամուրջ համայնքի անդամ։' },
              { num: '03', title: 'Մասնակցել', desc: 'Գրանցվեք միջոցառումներին, հանդիպեք նոր ընկերների եւ վայելեք ամեն հանդիպում։' },
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
            <span className="pill bg-primary/10 text-primary text-sm mb-4 inline-flex">Գներ</span>
            <h2 className="text-4xl font-serif font-bold mt-3">Ընտրեք Ձեր Պլանը</h2>
            <p className="text-xl text-muted-foreground mt-3">
              Ամսական մատչելի գնով — լիարժեք մասնակցություն
            </p>
          </FadeUp>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Basic */}
            <FadeUp delay={0.1}>
              <div className="bg-white rounded-3xl border border-border p-8 h-full flex flex-col">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">Հիմնական</h3>
                  <p className="text-muted-foreground">Ջերմ եւ հասկանալի</p>
                </div>
                <div className="mb-8">
                  <span className="text-4xl font-serif font-bold text-primary">
                    {formatAMD(40000)}
                  </span>
                  <span className="text-muted-foreground"> / ամս</span>
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
                    Ընտրել Հիմնական
                  </Button>
                </Link>
              </div>
            </FadeUp>
            {/* Premium */}
            <FadeUp delay={0.2}>
              <div className="bg-primary text-primary-foreground rounded-3xl p-8 h-full flex flex-col relative overflow-hidden">
                <div className="absolute top-6 right-6">
                  <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Ամենահայտնի
                  </span>
                </div>
                <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
                <div className="relative">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-2">Premium</h3>
                    <p className="text-primary-foreground/70">Ամենաամբողջական</p>
                  </div>
                  <div className="mb-8">
                    <span className="text-4xl font-serif font-bold">{formatAMD(55000)}</span>
                    <span className="text-primary-foreground/70"> / ամս</span>
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
                      Ընտրել Premium <ArrowRight className="w-4 h-4 ml-1" />
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
            <span className="pill bg-primary/10 text-primary text-sm mb-4 inline-flex">Կարծիքներ</span>
            <h2 className="text-4xl font-serif font-bold mt-3">Մեր Անդամները Ասում Են</h2>
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
                    <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="font-serif font-bold text-primary text-sm">
                        {t.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-base">{t.name}</p>
                      <p className="text-sm text-muted-foreground">{t.age} տարեկան</p>
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
        <section className="py-16 px-6 border-y border-border bg-[#f9f7f5]">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm text-primary uppercase tracking-widest mb-4 font-medium">Նվիրագիր</p>
            <h2 className="text-3xl font-serif font-bold mb-4 text-foreground">Նվիրեք Ուրախություն</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
              Նվիրագիր քարտ — անատyal նվեր ձեր սիրելի ընկերոջ, մոր կամ տատիկի համար
            </p>
            <Link to={isAuthenticated ? '/gift-cards' : '/auth?mode=register'}>
              <Button className="rounded-full px-8 font-semibold" size="lg">
                Գնել Նվիրագիր Քարտ
              </Button>
            </Link>
          </div>
        </section>
      </FadeUp>

      {/* ── FINAL CTA ────────────────────────────────────────────── */}
      <section className="section-pad bg-white">
        <div className="container-md text-center">
          <FadeUp>
            <h2 className="text-4xl sm:text-5xl font-serif font-bold mb-6 leading-tight text-foreground">
              Պատրա՞ստ եք Միանալ
            </h2>
          </FadeUp>
          <FadeUp delay={0.15}>
            <p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
              Ամեն օր նոր ուրախություն, ամեն հանդիպում — նոր ընկերական։
              Սկսեք հիմա — մի օր կձեզ երջանիկ կդարձնի, որ որոշեցիք։
            </p>
          </FadeUp>
          <FadeUp delay={0.25}>
            <Link to="/auth?mode=register">
              <Button size="lg" className="rounded-full px-12 text-lg font-semibold">
                Գրանցվել Անվճար
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-white/50 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/60 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
              </svg>
            </div>
            <span className="text-white/60 font-serif font-semibold">Կանաչ Կամուրջ</span>
          </div>
          <p className="text-sm">© 2025 Հասմիկ Մկրտչյան։ Բոլոր իրավունքները պաշտպանված են։</p>
          <div className="flex items-center gap-5 text-sm">
            <Link to="/events" className="hover:text-white transition-colors">Միջոցառումներ</Link>
            <Link to="/subscription" className="hover:text-white transition-colors">Պլաններ</Link>
            <Link to="/auth" className="hover:text-white transition-colors">Մուտք</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
