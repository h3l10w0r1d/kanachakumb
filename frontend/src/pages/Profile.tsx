import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { userApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatAMD } from '@/lib/utils'
import { User, Mail, Phone, Calendar, LogOut, Save } from 'lucide-react'

export default function Profile() {
  const { user, setUser, logout } = useAuthStore()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
  })
  const [saved, setSaved] = useState(false)

  if (!user) { navigate('/auth'); return null }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const resp = await userApi.updateMe(form)
      setUser({ ...user, ...resp.data })
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const sub = user.subscription

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-purple-50 to-rose-50 border-b border-border py-12 px-4">
        <div className="max-w-2xl mx-auto flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-4xl flex-shrink-0">
            {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full rounded-full object-cover" /> : '👩'}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{user.full_name}</h1>
            <p className="text-lg text-muted-foreground mt-1">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        {/* Subscription Status */}
        {sub && (
          <Card className="border-2 border-primary/30 bg-purple-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-base text-muted-foreground mb-1">Ձեր Ծրագիրը</p>
                  <p className="text-2xl font-bold">
                    {sub.plan_type === 'premium' ? '👑 Պրեմիում' : '🌸 Հիմնական'}
                  </p>
                  {sub.expires_at && (
                    <p className="text-base text-muted-foreground mt-1">
                      Ժամկետ. {formatDate(sub.expires_at)}
                    </p>
                  )}
                </div>
                <Button variant="outline" onClick={() => navigate('/subscription')}>
                  Կառավարել
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!sub && (
          <Card className="border-2 border-amber-200 bg-amber-50">
            <CardContent className="p-6 flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-xl font-bold mb-1">Դեռ բաժանորդ չեք</p>
                <p className="text-lg text-muted-foreground">Միացեք մեր ջերմ համայնքին</p>
              </div>
              <Button onClick={() => navigate('/subscription')}>
                ⭐ Բաժանորդագրվել
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Personal Info */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>👤 Անձնական Տվյալներ</CardTitle>
            {!editing ? (
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                ✏️ Խմբագրել
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Չեղարկել</Button>
                <Button size="sm" onClick={handleSave} disabled={isLoading}>
                  <Save className="w-4 h-4 mr-1" />
                  {isLoading ? 'Պահվում...' : 'Պահել'}
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-5">
            {saved && (
              <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 text-lg">
                ✅ Փոփոխությունները պահված են
              </div>
            )}
            <div>
              <label className="elder-label flex items-center gap-2">
                <User className="w-5 h-5" /> Անուն-ազգանուն
              </label>
              {editing ? (
                <Input
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                />
              ) : (
                <p className="text-xl bg-muted rounded-xl px-5 py-3">{user.full_name}</p>
              )}
            </div>
            <div>
              <label className="elder-label flex items-center gap-2">
                <Mail className="w-5 h-5" /> Էլ. հասցե
              </label>
              <p className="text-xl bg-muted rounded-xl px-5 py-3">{user.email}</p>
            </div>
            <div>
              <label className="elder-label flex items-center gap-2">
                <Phone className="w-5 h-5" /> Հեռախոս
              </label>
              {editing ? (
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+374 XX XXX XXX"
                />
              ) : (
                <p className="text-xl bg-muted rounded-xl px-5 py-3">
                  {user.phone || <span className="text-muted-foreground italic">Նշված չէ</span>}
                </p>
              )}
            </div>
            <div>
              <label className="elder-label">Կողմ հաշիվ</label>
              <p className="text-lg text-muted-foreground bg-muted rounded-xl px-5 py-3">
                {user.auth_provider === 'google' ? '🔵 Google' :
                 user.auth_provider === 'apple' ? '⚫ Apple' : '📧 Email/Գաղտնաբառ'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Card className="border-red-100">
          <CardContent className="p-6">
            <Button
              variant="outline"
              size="lg"
              className="w-full border-red-200 text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-2" />
              Ելք համakargnel
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
