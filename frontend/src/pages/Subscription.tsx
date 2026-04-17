import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { subscriptionApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { userApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { formatAMD, formatDate } from '@/lib/utils'
import { CheckCircle, XCircle, AlertCircle, Gift } from 'lucide-react'

const FEATURES = {
  basic: [
    'Հանդիպում ամեն 2 շաբաթը մեկ',
    'Ջերմ ու ընկերական մթնոլորտ',
    'Հետաքրքիր ծրագրեր և զեղչեր',
    'Հայկական ավանդույթների տոնակատարություն',
    'Ֆոտոնկարահանում և հիշատակություններ',
  ],
  premium: [
    'Ամեն ինչ Հիմնական ծրագրից',
    '👑 Հատուկ Telegram-ի խումբ',
    '💬 Անմիջական կապ Հասմիկի հետ',
    '🌟 Վաղ մուտք դեպի նոր ծրագրեր',
    '💝 Անձնական ոգևորություն',
  ],
}

export default function Subscription() {
  const { user, isAuthenticated, setUser } = useAuthStore()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [giftCode, setGiftCode] = useState('')
  const [giftMessage, setGiftMessage] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'premium' | null>(null)
  const subscription = user?.subscription

  useEffect(() => {
    if (!isAuthenticated) { navigate('/auth'); return }
    refreshUser()
  }, [isAuthenticated])

  const refreshUser = async () => {
    try {
      const resp = await userApi.getMe()
      setUser(resp.data)
    } catch {}
  }

  const handleSubscribe = async (plan: 'basic' | 'premium') => {
    setIsLoading(true)
    try {
      await subscriptionApi.subscribe(plan)
      await refreshUser()
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Բաժանորդագրությունն ձախողվեց')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpgrade = async () => {
    if (!confirm('Հաստատո՞ւմ եք Պրեմիում ծրագրին անցնելը')) return
    setIsLoading(true)
    try {
      await subscriptionApi.upgrade('premium')
      await refreshUser()
    } catch {
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Հաստատո՞ւմ եք բաժանորդագրությունը չեղարկելը')) return
    setIsLoading(true)
    try {
      await subscriptionApi.cancel()
      await refreshUser()
    } catch {
    } finally {
      setIsLoading(false)
    }
  }

  const handleRedeemGiftCard = async () => {
    if (!giftCode.trim()) return
    setIsLoading(true)
    setGiftMessage('')
    try {
      await subscriptionApi.redeemGiftCard(giftCode.trim())
      await refreshUser()
      setGiftMessage('✅ Նվիրատու քարտն ակտիվացված է!')
      setGiftCode('')
    } catch (e: any) {
      setGiftMessage('❌ ' + (e.response?.data?.detail || 'Քարտն անվավեր է'))
    } finally {
      setIsLoading(false)
    }
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge variant="success">✅ Ակտիվ</Badge>
      case 'cancelled': return <Badge variant="destructive">❌ Չեղարկված</Badge>
      case 'expired': return <Badge variant="warning">⏰ Ժամկետն անցած</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-purple-50 to-rose-50 border-b border-border py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-3">⭐ Բաժանորդագրություն</h1>
          <p className="text-xl text-muted-foreground">Կառավարեք ձեր անդամությունը</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        {/* Current Subscription Status */}
        {subscription && (
          <Card className={`border-2 ${subscription.status === 'active' ? 'border-green-300' : 'border-border'}`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between flex-wrap gap-3">
                <span>Ձեր Ծրագիրը</span>
                {statusBadge(subscription.status)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-muted rounded-xl p-4">
                  <p className="text-base text-muted-foreground mb-1">Ծրագիր</p>
                  <p className="text-xl font-bold">
                    {subscription.plan_type === 'premium' ? '👑 Պրեմիում' : '🌸 Հիմնական'}
                  </p>
                </div>
                <div className="bg-muted rounded-xl p-4">
                  <p className="text-base text-muted-foreground mb-1">Ամսական արժեք</p>
                  <p className="text-xl font-bold text-primary">
                    {formatAMD(subscription.plan_type === 'premium' ? 55000 : 40000)}
                  </p>
                </div>
                {subscription.expires_at && (
                  <div className="bg-muted rounded-xl p-4">
                    <p className="text-base text-muted-foreground mb-1">Ժամկետ</p>
                    <p className="text-xl font-bold">{formatDate(subscription.expires_at)}</p>
                  </div>
                )}
                {subscription.telegram_chat_invited && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-base text-blue-700 font-medium">✅ Telegram-ի խմբում եք</p>
                  </div>
                )}
              </div>

              {subscription.status === 'active' && (
                <div className="flex flex-wrap gap-3 pt-2">
                  {subscription.plan_type === 'basic' && (
                    <Button onClick={handleUpgrade} disabled={isLoading} variant="default">
                      ⬆️ Անցնել Պրեմիում
                    </Button>
                  )}
                  <Button onClick={handleCancel} disabled={isLoading} variant="outline"
                    className="border-red-200 text-red-700 hover:bg-red-50">
                    Չեղարկել Բաժանորդագրությունը
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Plan Selection */}
        {(!subscription || subscription.status !== 'active') && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Ընտրեք Ծրագիրը</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {(['basic', 'premium'] as const).map((plan) => (
                <Card
                  key={plan}
                  className={`cursor-pointer border-2 transition-all hover:shadow-lg ${
                    selectedPlan === plan ? 'border-primary bg-purple-50' : 'hover:border-primary/40'
                  } ${plan === 'premium' ? 'ring-2 ring-primary/20' : ''}`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <CardContent className="p-6">
                    <div className="text-4xl mb-3">{plan === 'premium' ? '👑' : '🌸'}</div>
                    <h3 className="text-xl font-bold mb-2">
                      {plan === 'premium' ? 'Պրեմիում' : 'Հիմնական'}
                    </h3>
                    <p className="text-2xl font-bold text-primary mb-4">
                      {formatAMD(plan === 'premium' ? 55000 : 40000)}
                      <span className="text-base text-muted-foreground font-normal"> /ամիս</span>
                    </p>
                    <ul className="space-y-2">
                      {FEATURES[plan].map((f) => (
                        <li key={f} className="flex items-start gap-2 text-base">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
            {selectedPlan && (
              <div className="mt-6">
                <Button
                  size="xl"
                  className="w-full"
                  onClick={() => handleSubscribe(selectedPlan)}
                  disabled={isLoading}
                >
                  {isLoading ? '⏳ Սպասեք...' : `✅ Բաժանորդագրվել — ${selectedPlan === 'premium' ? 'Պրեմիում' : 'Հիմնական'}`}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Gift Card Redemption */}
        <Card className="border-2 border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Gift className="w-7 h-7 text-amber-600" />
              Ակտիվացնել Նվիրատու Քարտ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg text-muted-foreground">
              Ստացե՞լ եք նվիրատու քարտ։ Մուտքագրեք կոդն ստորև և ակտիվացրեք ձեր բաժանորդագրությունը։
            </p>
            <div className="flex gap-3">
              <Input
                value={giftCode}
                onChange={(e) => setGiftCode(e.target.value.toUpperCase())}
                placeholder="XXXX-XXXX-XXXX"
                className="text-xl font-mono tracking-widest"
                maxLength={20}
              />
              <Button onClick={handleRedeemGiftCard} disabled={isLoading || !giftCode.trim()} size="lg">
                {isLoading ? '⏳' : '✅ Ակտիվ'}
              </Button>
            </div>
            {giftMessage && (
              <p className={`text-lg font-medium ${giftMessage.startsWith('✅') ? 'text-green-700' : 'text-red-700'}`}>
                {giftMessage}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
