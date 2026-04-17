import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { giftCardApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatAMD, formatDate } from '@/lib/utils'
import { Gift, Copy, CheckCheck } from 'lucide-react'

interface GiftCard {
  id: string
  code: string
  plan_type: string
  duration_months: number
  status: string
  recipient_email?: string
  recipient_name?: string
  message?: string
  price_amd: number
  created_at: string
  expires_at?: string
}

export default function GiftCards() {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [cards, setCards] = useState<GiftCard[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [form, setForm] = useState({
    plan_type: 'basic',
    duration_months: 1,
    recipient_name: '',
    recipient_email: '',
    message: '',
  })

  useEffect(() => {
    if (!isAuthenticated) { navigate('/auth'); return }
    fetchCards()
  }, [isAuthenticated])

  const fetchCards = async () => {
    try {
      const resp = await giftCardApi.myPurchases()
      setCards(resp.data)
    } catch {}
  }

  const handleCreate = async () => {
    setCreating(true)
    try {
      await giftCardApi.create(form)
      await fetchCards()
      setForm({ plan_type: 'basic', duration_months: 1, recipient_name: '', recipient_email: '', message: '' })
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Ձախողվեց')
    } finally {
      setCreating(false)
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  const price = (form.plan_type === 'premium' ? 55000 : 40000) * form.duration_months

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-amber-50 to-rose-50 border-b border-border py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-3">🎁 Նվիրատու Քարտեր</h1>
          <p className="text-xl text-muted-foreground">
            Նվիրեք ուրախ ամիսներ ձեր սիրելիներին
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        {/* Create Gift Card */}
        <Card className="border-2 border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Gift className="w-7 h-7 text-amber-600" />
              Նոր Նվիրատու Քարտ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="elder-label">Ծրագիր</label>
                <div className="flex gap-3">
                  {(['basic', 'premium'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setForm({ ...form, plan_type: p })}
                      className={`flex-1 py-3 px-4 rounded-xl border-2 text-lg font-semibold transition-all ${
                        form.plan_type === p
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-input hover:border-primary/40'
                      }`}
                    >
                      {p === 'premium' ? '👑 Պրեմիում' : '🌸 Հիմնական'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="elder-label">Ամիսների քանակ</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 6, 12].map((m) => (
                    <button
                      key={m}
                      onClick={() => setForm({ ...form, duration_months: m })}
                      className={`flex-1 py-3 rounded-xl border-2 text-lg font-semibold transition-all ${
                        form.duration_months === m
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-input hover:border-primary/40'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="elder-label">Ստացողի անունը <span className="text-muted-foreground font-normal">(կամընտիր)</span></label>
              <Input
                value={form.recipient_name}
                onChange={(e) => setForm({ ...form, recipient_name: e.target.value })}
                placeholder="Անի Հովհաննիսյան"
              />
            </div>
            <div>
              <label className="elder-label">Ստացողի Email <span className="text-muted-foreground font-normal">(կամընտիր)</span></label>
              <Input
                type="email"
                value={form.recipient_email}
                onChange={(e) => setForm({ ...form, recipient_email: e.target.value })}
                placeholder="ani@example.com"
              />
            </div>
            <div>
              <label className="elder-label">Ձեր նամակը <span className="text-muted-foreground font-normal">(կամընտիր)</span></label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Սիրելի Անի, ուզում եմ նվիրել քեզ ուրախ ամիսներ Կանաչ Կամուրջ համայնքում..."
                className="elder-input h-28 resize-none"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between flex-wrap gap-4 bg-muted rounded-xl p-5">
              <div>
                <p className="text-base text-muted-foreground">Արժեքը</p>
                <p className="text-3xl font-bold text-primary">{formatAMD(price)}</p>
                <p className="text-base text-muted-foreground">
                  {form.duration_months} ամիս × {formatAMD(form.plan_type === 'premium' ? 55000 : 40000)}
                </p>
              </div>
              <Button size="lg" onClick={handleCreate} disabled={creating}>
                {creating ? '⏳ Ստեղծվում...' : '🎁 Ստեղծել Քարտ'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* My Gift Cards */}
        {cards.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-5">Իմ Քարտերը</h2>
            <div className="space-y-4">
              {cards.map((card) => (
                <Card key={card.id} className={card.status === 'redeemed' ? 'opacity-60' : ''}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <Badge variant={card.status === 'unused' ? 'success' : card.status === 'redeemed' ? 'secondary' : 'warning'}>
                            {card.status === 'unused' ? '✅ Ազատ' : card.status === 'redeemed' ? '✓ Օգտագործված' : '⏰ Ժամկ. անց'}
                          </Badge>
                          <Badge variant="outline">
                            {card.plan_type === 'premium' ? '👑 Պրեմիում' : '🌸 Հիմնական'}
                          </Badge>
                          <span className="text-base text-muted-foreground">{card.duration_months} ամիս</span>
                        </div>

                        <div className="flex items-center gap-3 mb-2">
                          <code className="text-2xl font-mono font-bold tracking-widest bg-muted px-4 py-2 rounded-xl">
                            {card.code}
                          </code>
                          {card.status === 'unused' && (
                            <button
                              onClick={() => copyCode(card.code)}
                              className="p-2 rounded-lg hover:bg-muted transition-colors min-h-0 min-w-0"
                              title="Պատճenate"
                            >
                              {copied === card.code
                                ? <CheckCheck className="w-6 h-6 text-green-600" />
                                : <Copy className="w-6 h-6 text-muted-foreground" />}
                            </button>
                          )}
                        </div>

                        {card.recipient_name && (
                          <p className="text-base text-muted-foreground">
                            👤 Ստացող. {card.recipient_name}
                          </p>
                        )}
                        <p className="text-base text-muted-foreground mt-1">
                          Ստեղծված. {formatDate(card.created_at)} • {formatAMD(card.price_amd)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
