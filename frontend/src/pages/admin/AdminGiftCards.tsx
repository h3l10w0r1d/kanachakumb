import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatAMD, formatDate } from '@/lib/utils'
import { Gift, Plus, Copy, CheckCheck } from 'lucide-react'

export default function AdminGiftCards() {
  const [cards, setCards] = useState<any[]>([])
  const [generating, setGenerating] = useState(false)
  const [form, setForm] = useState({ plan_type: 'basic', count: 1, duration_months: 1 })
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => { fetchCards() }, [])

  const fetchCards = async () => {
    try {
      const resp = await adminApi.listGiftCards()
      setCards(resp.data)
    } catch {}
  }

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      await adminApi.generateGiftCards(form.plan_type, form.count, form.duration_months)
      await fetchCards()
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Erzhakel')
    } finally {
      setGenerating(false)
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">🎁 Nviratagir Kartner</h2>
      </div>

      <Card className="mb-6 border-2 border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" /> Nox Kartner Stexcel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="elder-label">Plan</label>
              <select
                value={form.plan_type}
                onChange={(e) => setForm({ ...form, plan_type: e.target.value })}
                className="elder-input"
              >
                <option value="basic">🌸 Himnakin</option>
                <option value="premium">👑 Premium</option>
              </select>
            </div>
            <div>
              <label className="elder-label">Qanak</label>
              <input
                type="number"
                min={1}
                max={100}
                value={form.count}
                onChange={(e) => setForm({ ...form, count: parseInt(e.target.value) || 1 })}
                className="elder-input"
              />
            </div>
            <div>
              <label className="elder-label">Amisner</label>
              <select
                value={form.duration_months}
                onChange={(e) => setForm({ ...form, duration_months: parseInt(e.target.value) })}
                className="elder-input"
              >
                {[1, 2, 3, 6, 12].map((m) => <option key={m} value={m}>{m} ams</option>)}
              </select>
            </div>
          </div>
          <Button onClick={handleGenerate} disabled={generating} className="gap-2">
            <Gift className="w-5 h-5" />
            {generating ? 'Stexvum...' : `Stexcel ${form.count} kart`}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {cards.map((card) => (
          <Card key={card.id} className={card.status !== 'unused' ? 'opacity-60' : ''}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge variant={card.status === 'unused' ? 'success' : 'secondary'}>
                      {card.status === 'unused' ? '✅ Azat' : card.status === 'redeemed' ? '✓ Ogtag.' : '⏰'}
                    </Badge>
                    <Badge variant="outline">{card.plan_type}</Badge>
                    <span className="text-sm text-muted-foreground">{card.duration_months} ams</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-xl font-mono font-bold tracking-widest bg-muted px-3 py-1 rounded-lg">
                      {card.code}
                    </code>
                    <button
                      onClick={() => copyCode(card.code)}
                      className="p-1 rounded hover:bg-muted min-h-0 min-w-0"
                    >
                      {copied === card.code
                        ? <CheckCheck className="w-5 h-5 text-green-600" />
                        : <Copy className="w-5 h-5 text-muted-foreground" />}
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatAMD(card.price_amd)} • {formatDate(card.created_at)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
