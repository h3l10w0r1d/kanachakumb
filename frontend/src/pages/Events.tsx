import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { eventApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDateTime, formatAMD } from '@/lib/utils'
import { MapPin, Clock, Users, CalendarCheck, CalendarX, Lock, ChevronRight } from 'lucide-react'

interface Event {
  id: string
  title: string
  description: string
  location?: string
  starts_at: string
  ends_at?: string
  max_capacity?: number
  registered_count: number
  spots_left?: number
  is_registered: boolean
  plan_requirement: 'basic' | 'premium' | 'all'
  status: string
  image_url?: string
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [registering, setRegistering] = useState<string | null>(null)
  const { user, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const resp = await eventApi.list({ upcoming: true })
      setEvents(resp.data)
    } catch {
    } finally {
      setIsLoading(false)
    }
  }

  const canRegister = (event: Event) => {
    if (!isAuthenticated) return false
    const sub = user?.subscription
    if (!sub || sub.status !== 'active') return false
    if (event.plan_requirement === 'all') return true
    if (event.plan_requirement === 'premium') return sub.plan_type === 'premium'
    return true
  }

  const handleRegister = async (eventId: string) => {
    if (!isAuthenticated) { navigate('/auth'); return }
    setRegistering(eventId)
    try {
      await eventApi.register(eventId)
      await fetchEvents()
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Գրանցումն ձախողվեց')
    } finally {
      setRegistering(null)
    }
  }

  const handleCancel = async (eventId: string) => {
    if (!confirm('Հաստատո՞ւմ եք մասնակցությունից հրաժարվելը')) return
    setRegistering(eventId)
    try {
      await eventApi.cancelRegistration(eventId)
      await fetchEvents()
    } catch {
    } finally {
      setRegistering(null)
    }
  }

  const getPlanBadge = (req: string) => {
    if (req === 'premium') return <Badge variant="default" className="gap-1">👑 Պրեմիում</Badge>
    if (req === 'basic') return <Badge variant="secondary" className="gap-1">🌸 Հիմնական</Badge>
    return <Badge variant="outline" className="gap-1">🌍 Բոլորի համար</Badge>
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">🌸</div>
          <p className="text-2xl text-muted-foreground">Բեռնվում է...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-rose-50 border-b border-border py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-3">📅 Միջոցառումներ</h1>
          <p className="text-xl text-muted-foreground">
            Բոլոր առաջիկա հանդիպումներն ու ծրագրերը
          </p>
          {!isAuthenticated && (
            <div className="mt-6 p-5 bg-amber-50 border-2 border-amber-200 rounded-2xl inline-block">
              <p className="text-lg text-amber-800">
                ⚠️ Մասնակցելու համար{' '}
                <button onClick={() => navigate('/auth')} className="font-bold underline min-h-0 min-w-0">
                  մուտք գործեք
                </button>{' '}
                և բաժանորդագրվեք
              </p>
            </div>
          )}
          {isAuthenticated && !user?.subscription && (
            <div className="mt-6 p-5 bg-amber-50 border-2 border-amber-200 rounded-2xl inline-block">
              <p className="text-lg text-amber-800">
                ⚠️ Մասնակցելու համար{' '}
                <button onClick={() => navigate('/subscription')} className="font-bold underline min-h-0 min-w-0">
                  բաժանորդագրվեք
                </button>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        {events.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-8xl mb-6">📭</div>
            <p className="text-2xl font-bold mb-3">Առաջիկա միջոցառումներ չկան</p>
            <p className="text-xl text-muted-foreground">Շուտով կհայտնվեն նոր ծրագրեր</p>
          </div>
        ) : (
          <div className="space-y-6">
            {events.map((event) => {
              const registered = canRegister(event)
              const isRegistered = event.is_registered
              const isFull = event.spots_left === 0
              const isRegistering = registering === event.id

              return (
                <Card key={event.id} className={`overflow-hidden transition-all hover:shadow-lg ${isRegistered ? 'border-2 border-green-300 bg-green-50/30' : ''}`}>
                  <CardContent className="p-0">
                    <div className="p-6 sm:p-8">
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div className="flex flex-wrap gap-2 items-center">
                          {getPlanBadge(event.plan_requirement)}
                          {isRegistered && (
                            <Badge variant="success" className="gap-1">✅ Գրանցված եք</Badge>
                          )}
                          {isFull && !isRegistered && (
                            <Badge variant="warning" className="gap-1">🔴 Տեղեր լի</Badge>
                          )}
                        </div>
                        {event.spots_left !== undefined && event.spots_left !== null && (
                          <div className="flex items-center gap-2 text-base text-muted-foreground bg-muted px-4 py-2 rounded-xl">
                            <Users className="w-5 h-5" />
                            <span className="font-semibold">
                              {event.spots_left > 0
                                ? `${event.spots_left} տեղ ազատ`
                                : 'Տեղ չկա'
                              }
                            </span>
                          </div>
                        )}
                      </div>

                      <h2 className="text-2xl font-bold mb-3">{event.title}</h2>

                      {event.description && (
                        <p className="text-lg text-muted-foreground mb-5 leading-relaxed">
                          {event.description}
                        </p>
                      )}

                      <div className="grid sm:grid-cols-2 gap-3 mb-6">
                        <div className="flex items-center gap-3 text-base text-muted-foreground">
                          <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                          <span>{formatDateTime(event.starts_at)}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-3 text-base text-muted-foreground">
                            <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-3 text-base text-muted-foreground">
                          <Users className="w-5 h-5 text-primary flex-shrink-0" />
                          <span>{event.registered_count} մարդ գրանցված</span>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="flex flex-wrap gap-3">
                        {!isAuthenticated ? (
                          <Button onClick={() => navigate('/auth')} size="lg" className="gap-2">
                            Մուտք գործեք <ChevronRight className="w-5 h-5" />
                          </Button>
                        ) : isRegistered ? (
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={() => handleCancel(event.id)}
                            disabled={isRegistering}
                            className="gap-2 border-red-200 text-red-700 hover:bg-red-50"
                          >
                            <CalendarX className="w-5 h-5" />
                            {isRegistering ? 'Սպասեք...' : 'Հրաժարվել'}
                          </Button>
                        ) : !registered ? (
                          <div className="flex items-center gap-3 bg-muted rounded-xl px-5 py-3">
                            <Lock className="w-5 h-5 text-muted-foreground" />
                            <span className="text-base text-muted-foreground">
                              {event.plan_requirement === 'premium'
                                ? 'Պրեմիում բաժանորդագրություն անհրաժեշտ է'
                                : 'Բաժանորդագրություն անհրաժեշտ է'}
                            </span>
                            <Button size="sm" onClick={() => navigate('/subscription')} className="ml-2">
                              Բաժանորդագրվել
                            </Button>
                          </div>
                        ) : isFull ? (
                          <div className="flex items-center gap-2 text-lg text-muted-foreground">
                            <span>😔 Ցավոք, տեղ չկա</span>
                          </div>
                        ) : (
                          <Button
                            size="lg"
                            onClick={() => handleRegister(event.id)}
                            disabled={isRegistering}
                            className="gap-2"
                          >
                            <CalendarCheck className="w-5 h-5" />
                            {isRegistering ? 'Սպասեք...' : 'Գրանցվել'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
