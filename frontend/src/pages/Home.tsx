import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuthStore } from '@/store/authStore'
import { Heart, Calendar, Users, Star, Gift, MessageCircle, ChevronRight, CheckCircle } from 'lucide-react'
import { formatAMD } from '@/lib/utils'

const FEATURES_BASIC = [
  'Հանդիպում ամեն 2 շաբաթը մեկ',
  'Ջերմ ու ընկերական մթնոլորտ',
  'Հետաքրքիր ծրագրեր և զեղչեր',
  'Հայկական ավանդույթների տոնակատարություն',
  'Ֆոտոնկարահանում և հիշատակություններ',
]

const FEATURES_PREMIUM = [
  ...FEATURES_BASIC,
  'Հատուկ Telegram-ի խումբ',
  'Անմիջական կապ Հասմիկի հետ',
  'Վաղ մուտք դեպի նոր ծրագրեր',
  'Անձնական ոգևորություն և աջակցություն',
]

const TESTIMONIALS = [
  {
    name: 'Մարինե Ս.',
    age: 68,
    text: 'Սա ամենաջերմ վայրն է, որ գտել եմ։ Ամեն հանդիպումից հետո ուրախ եմ վերադառնում տուն։',
  },
  {
    name: 'Վարդանուհի Ա.',
    age: 74,
    text: 'Հասմիկն ամեն ինչ անում է, որ մենք ուրախ լինենք։ Շատ կհուշեի բոլոր ընկերուհիներիս։',
  },
  {
    name: 'Գոհար Մ.',
    age: 70,
    text: 'Premium-ի Telegram-ի խումբը ամենօրյա ուրախություն է ինձ համար։ Ասես ընտանիք ենք։',
  },
]

export default function Home() {
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-50 via-background to-rose-50 pt-16 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-rose-400 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/80 rounded-full px-5 py-2.5 mb-8 shadow-sm border border-border">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-400" />
            <span className="text-lg font-medium text-foreground">Հասմիկ Մկրտչյանի հատուկ համայնքը</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
            Կանաչ Կամուրջ
            <span className="block text-primary mt-2">Ուրախ կյանք, ջերմ ընկերներ</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Սա ձեր համայնքն է — ուր կիսում ենք ջերմ պահեր, նոր բարեկամություններ ենք կառուցում,
            և ապրում ենք ամեն օրը ուրախությամբ ու գեղեցկությամբ։
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link to="/events">
                <Button size="xl" className="w-full sm:w-auto shadow-lg">
                  📅 Տեսնել Միջոցառումները
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/auth">
                  <Button size="xl" className="w-full sm:w-auto shadow-lg">
                    ✨ Միանալ Համայնքին
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                </Link>
                <Link to="/subscription">
                  <Button size="xl" variant="outline" className="w-full sm:w-auto">
                    Տեսնել Պլանները
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-16 max-w-lg mx-auto">
            {[
              { num: '200+', label: 'Երջանիկ Անդամ' },
              { num: '50+', label: 'Անցկացված Հանդիպում' },
              { num: '2', label: 'Ծրագիր ձեզ համար' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-primary">{stat.num}</p>
                <p className="text-base text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="w-full aspect-square max-w-sm mx-auto bg-gradient-to-br from-purple-100 to-rose-100 rounded-3xl flex items-center justify-center shadow-xl">
                <div className="text-center p-8">
                  <div className="text-8xl mb-4">👵</div>
                  <p className="text-2xl font-bold text-primary">Հասմիկ Մկրտչյան</p>
                  <p className="text-lg text-muted-foreground mt-2">72 տարեկան • Instagram ինֆլյուենսեր</p>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-6 text-foreground">Ի՞նչ է Կանաչ Կամուրջը</h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Հասմիկ Մկրտչյանն իր 72 տարվա կյանքի փորձով, ջերմ սրտով ու Instagram-ի բազայով
                ստեղծել է հատուկ տարածք — ուր 60+ տարեկան կանայք գտնում են ընկերություն, ոգևորություն
                և ամեն կյանքի երջանիկ պահ։
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Ամեն 2 շաբաթը մեկ հանդիպում, ամեն օր ջերմ զրույց — սա ձեր ընտանիքի ընդլայնումն է։
              </p>
              <div className="space-y-3">
                {['Ջերմ, ընկերական մթնոլորտ', 'Հայկական ավանդույթներ ու տոներ', 'Ամեն տարիքի համար հասկանալի'].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-lg text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-purple-50 to-background" id="pricing">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4 text-foreground">Ընտրեք Ձեր Ծրագիրը</h2>
          <p className="text-xl text-muted-foreground mb-12">
            Ամսական մատչելի գնով — լիարժեք մասնակցություն
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Basic Plan */}
            <Card className="border-2 border-border hover:border-primary/50 transition-colors">
              <CardContent className="p-8">
                <div className="text-5xl mb-4">🌸</div>
                <h3 className="text-2xl font-bold mb-2">Հիմնական</h3>
                <p className="text-muted-foreground mb-6 text-lg">Ջերմ ու ուրախ</p>
                <div className="mb-8">
                  <span className="text-4xl font-bold text-primary">{formatAMD(40000)}</span>
                  <span className="text-muted-foreground text-lg"> / ամիս</span>
                </div>
                <ul className="space-y-3 mb-8 text-left">
                  {FEATURES_BASIC.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-lg">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to={isAuthenticated ? '/subscription' : '/auth'}>
                  <Button variant="outline" size="lg" className="w-full">
                    Ընտրել Հիմնական
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="border-2 border-primary bg-gradient-to-b from-purple-50 to-white shadow-xl relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-white px-6 py-2 rounded-full text-base font-bold shadow-md">
                  ⭐ Ամենատարածված
                </span>
              </div>
              <CardContent className="p-8 pt-10">
                <div className="text-5xl mb-4">👑</div>
                <h3 className="text-2xl font-bold mb-2">Պրեմիում</h3>
                <p className="text-muted-foreground mb-6 text-lg">Առավելագույն հաղordfrak</p>
                <div className="mb-8">
                  <span className="text-4xl font-bold text-primary">{formatAMD(55000)}</span>
                  <span className="text-muted-foreground text-lg"> / ամիս</span>
                </div>
                <ul className="space-y-3 mb-8 text-left">
                  {FEATURES_PREMIUM.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-lg">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to={isAuthenticated ? '/subscription' : '/auth'}>
                  <Button size="lg" className="w-full shadow-md">
                    Ընտրել Պրեմիում
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Gift Card CTA */}
          <div className="mt-12 p-8 bg-amber-50 rounded-2xl border-2 border-amber-200">
            <Gift className="w-12 h-12 text-amber-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-3">Նվիրեք Ուրախություն</h3>
            <p className="text-lg text-muted-foreground mb-6">
              Նվիրատու քարտ — կատարյալ նվեր ձեր սիրելի կնոջ, մոր կամ տատի համար
            </p>
            <Link to={isAuthenticated ? '/gift-cards' : '/auth'}>
              <Button variant="warm" size="lg">
                🎁 Գնել Նվիրատու Քարտ
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Մեր Անդամները Ասում Են</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} className="p-6">
                <CardContent className="p-0">
                  <div className="text-4xl mb-4">💬</div>
                  <p className="text-lg text-muted-foreground mb-6 italic leading-relaxed">
                    «{t.text}»
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-xl">
                      👩
                    </div>
                    <div>
                      <p className="font-bold text-lg">{t.name}</p>
                      <p className="text-muted-foreground">{t.age} տարեկան</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Պատրաստ Ե՞ք Միանալ</h2>
          <p className="text-xl opacity-90 mb-10 leading-relaxed">
            Ամեն օր նոր ուրախություն, ամեն հանդիպում — նոր ընկերություն։
            Սկսեք հիմա — մի օր ձեզ երջանիկ կզգաք, որ որոշեցիք։
          </p>
          <Link to="/auth">
            <Button size="xl" variant="secondary" className="shadow-xl">
              ✨ Միանալ Այժմ — Անվճար Գրանցում
              <ChevronRight className="w-6 h-6" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="w-8 h-8 text-rose-400 fill-rose-400" />
            <span className="text-2xl font-bold">Կանաչ Կամուրջ</span>
          </div>
          <p className="text-lg opacity-70">© 2025 Հասմիկ Մկրտչյան։ Բոլոր իրավունքները պաշտպանված են։</p>
        </div>
      </footer>
    </div>
  )
}
