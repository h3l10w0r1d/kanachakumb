import { useEffect, useState } from 'react'
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { adminApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatAMD } from '@/lib/utils'
import {
  Users, Calendar, CreditCard, TrendingUp, Gift,
  BarChart3, Settings, Home, ChevronRight
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

interface Overview {
  total_users: number
  active_subscriptions: { basic: number; premium: number; total: number }
  monthly_revenue_amd: number
  events: { total: number; upcoming: number; total_registrations: number }
  new_users_this_month: number
}

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [overview, setOverview] = useState<Overview | null>(null)
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return }
    fetchData()
  }, [user])

  const fetchData = async () => {
    try {
      const [ovResp, chartResp] = await Promise.all([
        adminApi.overview(),
        adminApi.subscriptionsOverTime(30),
      ])
      setOverview(ovResp.data)
      const raw = chartResp.data
      const grouped: Record<string, any> = {}
      raw.forEach((r: any) => {
        const date = r.date.split('T')[0]
        if (!grouped[date]) grouped[date] = { date, basic: 0, premium: 0 }
        grouped[date][r.plan_type] = r.count
      })
      setChartData(Object.values(grouped).slice(-14))
    } catch {}
  }

  const isOnSubpath = location.pathname !== '/admin'

  if (isOnSubpath) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNav />
        <Outlet />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">⚙️ Կառավարման Վահanakboard</h1>
          <p className="text-lg text-muted-foreground mt-1">Կանաչ Կամուրջ — Վիճakagrak</p>
        </div>

        {overview && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { icon: '👥', label: 'Ընդhannup օgtagordakner', value: overview.total_users, sub: `+${overview.new_users_this_month} ամessengersym` },
                { icon: '⭐', label: ' Aktiv bajanordagrner', value: overview.active_subscriptions.total, sub: `${overview.active_subscriptions.basic} basic + ${overview.active_subscriptions.premium} premium` },
                { icon: '💰', label: 'Amsakan Ekamutyun', value: formatAMD(overview.monthly_revenue_amd), sub: 'Amssakan' },
                { icon: '📅', label: 'Arlajka Mijocararumner', value: overview.events.upcoming, sub: `${overview.events.total_registrations} gracanvac` },
              ].map((kpi) => (
                <Card key={kpi.label}>
                  <CardContent className="p-5">
                    <div className="text-3xl mb-2">{kpi.icon}</div>
                    <p className="text-2xl font-bold text-primary">{kpi.value}</p>
                    <p className="text-sm text-muted-foreground mt-1 leading-tight">{kpi.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{kpi.sub}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Chart */}
            {chartData.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Bajanordagrner — Verjin 14 or</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="basic" name="Himnakin" fill="hsl(280 45% 70%)" radius={4} />
                      <Bar dataKey="premium" name="Premium" fill="hsl(280 45% 45%)" radius={4} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { to: '/admin/events', icon: Calendar, label: 'Kararavel Mijocararumner', color: 'bg-purple-50 hover:bg-purple-100' },
            { to: '/admin/users', icon: Users, label: 'Tesnelbardzrel Ogtagordakner', color: 'bg-blue-50 hover:bg-blue-100' },
            { to: '/admin/gift-cards', icon: Gift, label: 'Nviratagir Kartner', color: 'bg-amber-50 hover:bg-amber-100' },
          ].map(({ to, icon: Icon, label, color }) => (
            <Link key={to} to={to}>
              <Card className={`cursor-pointer border-2 border-transparent hover:border-primary/30 transition-all ${color}`}>
                <CardContent className="p-6 flex items-center gap-4">
                  <Icon className="w-8 h-8 text-primary" />
                  <span className="text-lg font-semibold">{label}</span>
                  <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function AdminNav() {
  const location = useLocation()
  const links = [
    { to: '/admin', label: 'Dashboard', icon: BarChart3 },
    { to: '/admin/events', label: 'Mijocararumner', icon: Calendar },
    { to: '/admin/users', label: 'Ogtagordakner', icon: Users },
    { to: '/admin/gift-cards', label: 'Gift Cards', icon: Gift },
  ]

  return (
    <div className="bg-white border-b border-border">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto py-1">
          {links.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to}>
              <Button
                variant={location.pathname === to ? 'default' : 'ghost'}
                size="sm"
                className="gap-2 whitespace-nowrap text-base"
              >
                <Icon className="w-4 h-4" />
                {label}
              </Button>
            </Link>
          ))}
          <Link to="/" className="ml-auto">
            <Button variant="ghost" size="sm" className="gap-2">
              <Home className="w-4 h-4" /> Glavor
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
