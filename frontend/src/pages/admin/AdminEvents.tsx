import { useEffect, useState } from 'react'
import { adminApi, eventApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDateTime, formatDate } from '@/lib/utils'
import { Plus, Edit, Trash2, Users, Eye, EyeOff, Save, X } from 'lucide-react'

interface Event {
  id: string
  title: string
  description?: string
  location?: string
  starts_at: string
  ends_at?: string
  max_capacity?: number
  registered_count: number
  spots_left?: number
  status: string
  plan_requirement: string
}

const EMPTY_FORM = {
  title: '',
  description: '',
  location: '',
  starts_at: '',
  ends_at: '',
  max_capacity: '',
  plan_requirement: 'basic',
  status: 'draft',
  is_recurring: false,
  telegram_link: '',
}

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [isLoading, setIsLoading] = useState(false)
  const [viewRegs, setViewRegs] = useState<string | null>(null)
  const [registrations, setRegistrations] = useState<any[]>([])

  useEffect(() => { fetchEvents() }, [])

  const fetchEvents = async () => {
    try {
      const resp = await eventApi.list({ limit: 100, upcoming: false })
      setEvents(resp.data)
    } catch {}
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const data: any = {
        ...form,
        max_capacity: form.max_capacity ? parseInt(form.max_capacity) : null,
        ends_at: form.ends_at || null,
        telegram_link: form.telegram_link || null,
      }
      if (editId) {
        await adminApi.updateEvent(editId, data)
      } else {
        await adminApi.createEvent(data)
      }
      await fetchEvents()
      setShowForm(false)
      setEditId(null)
      setForm({ ...EMPTY_FORM })
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Ձախողվեց')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (event: Event) => {
    setEditId(event.id)
    setForm({
      title: event.title,
      description: event.description || '',
      location: event.location || '',
      starts_at: event.starts_at.slice(0, 16),
      ends_at: event.ends_at ? event.ends_at.slice(0, 16) : '',
      max_capacity: event.max_capacity?.toString() || '',
      plan_requirement: event.plan_requirement,
      status: event.status,
      is_recurring: false,
      telegram_link: '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Վստա՞հ եք ջնջելու')) return
    await adminApi.deleteEvent(id)
    await fetchEvents()
  }

  const toggleStatus = async (event: Event) => {
    const newStatus = event.status === 'published' ? 'draft' : 'published'
    await adminApi.updateEvent(event.id, { status: newStatus })
    await fetchEvents()
  }

  const loadRegistrations = async (eventId: string) => {
    try {
      const resp = await adminApi.getEventRegistrations(eventId)
      setRegistrations(resp.data)
      setViewRegs(eventId)
    } catch {}
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">📅 Mijocararumner</h2>
          <p className="text-muted-foreground">{events.length} yntdamen</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditId(null); setForm({ ...EMPTY_FORM }) }} className="gap-2">
          <Plus className="w-5 h-5" /> Nor Mijocararum
        </Button>
      </div>

      {/* Event Form */}
      {showForm && (
        <Card className="mb-6 border-2 border-primary/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{editId ? '✏️ Khetararkel' : '✨ Nor Mijocararum'}</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
              <X className="w-5 h-5" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="elder-label">Anvanumy</label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Mijocararman anvanumy" />
              </div>
              <div className="sm:col-span-2">
                <label className="elder-label">Nkaragrutyun</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="elder-input h-24 resize-none"
                  placeholder="Mijocararman masin..."
                />
              </div>
              <div>
                <label className="elder-label">Venue</label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Hasce, hanrayin kuzn" />
              </div>
              <div>
                <label className="elder-label">Maksimal masnakicner</label>
                <Input type="number" value={form.max_capacity} onChange={(e) => setForm({ ...form, max_capacity: e.target.value })} placeholder="20" />
              </div>
              <div>
                <label className="elder-label">Skizb</label>
                <Input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
              </div>
              <div>
                <label className="elder-label">Avart</label>
                <Input type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} />
              </div>
              <div>
                <label className="elder-label">Bjanordagrutyan pahanj</label>
                <select
                  value={form.plan_requirement}
                  onChange={(e) => setForm({ ...form, plan_requirement: e.target.value })}
                  className="elder-input"
                >
                  <option value="basic">🌸 Himnakin</option>
                  <option value="premium">👑 Premium</option>
                  <option value="all">🌍 Bolor</option>
                </select>
              </div>
              <div>
                <label className="elder-label">Kazm</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="elder-input"
                >
                  <option value="draft">📝 Nakapatrastvel</option>
                  <option value="published">✅ Hraparakvel</option>
                  <option value="cancelled">❌ Chelakarvel</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="elder-label">Telegram Link <span className="text-muted-foreground font-normal">(kamamntir)</span></label>
                <Input value={form.telegram_link} onChange={(e) => setForm({ ...form, telegram_link: e.target.value })} placeholder="https://t.me/..." />
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleSubmit} disabled={isLoading}>
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Pahvum...' : editId ? 'Patcenatel' : 'Stexcel'}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Chelakarkel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Events List */}
      <div className="space-y-3">
        {events.map((event) => (
          <Card key={event.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <Badge variant={event.status === 'published' ? 'success' : event.status === 'cancelled' ? 'destructive' : 'outline'}>
                      {event.status === 'published' ? '✅ Live' : event.status === 'cancelled' ? '❌' : '📝 Draft'}
                    </Badge>
                    <Badge variant="secondary">{event.plan_requirement}</Badge>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{event.title}</h3>
                  <p className="text-base text-muted-foreground">{formatDateTime(event.starts_at)}</p>
                  {event.location && <p className="text-base text-muted-foreground">📍 {event.location}</p>}
                  <div className="flex items-center gap-2 mt-2 text-base text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{event.registered_count} gracanvac</span>
                    {event.max_capacity && <span>/ {event.max_capacity} teg</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button variant="ghost" size="icon" onClick={() => loadRegistrations(event.id)} title="Tesnelbardzrel gracanvacner">
                    <Users className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => toggleStatus(event)}>
                    {event.status === 'published' ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(event)}>
                    <Edit className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(event.id)}>
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Registrations Panel */}
              {viewRegs === event.id && (
                <div className="mt-4 border-t border-border pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-lg">Gracanvacner ({registrations.length})</h4>
                    <Button variant="ghost" size="sm" onClick={() => setViewRegs(null)}>Ket</Button>
                  </div>
                  {registrations.length === 0 ? (
                    <p className="text-muted-foreground">Gracanvacner chken</p>
                  ) : (
                    <div className="space-y-2">
                      {registrations.map((r) => (
                        <div key={r.id} className="flex items-center justify-between bg-muted rounded-lg px-4 py-3">
                          <div>
                            <p className="font-semibold">{r.user.name}</p>
                            <p className="text-sm text-muted-foreground">{r.user.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {r.attended && <Badge variant="success">✅ Masznakel</Badge>}
                            <Button
                              size="sm"
                              variant={r.attended ? 'outline' : 'default'}
                              onClick={async () => {
                                await adminApi.markAttendance(event.id, r.id, !r.attended)
                                await loadRegistrations(event.id)
                              }}
                            >
                              {r.attended ? 'Hanik' : 'Masznakel'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
