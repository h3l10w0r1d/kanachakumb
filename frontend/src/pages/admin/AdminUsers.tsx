import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { Search, Shield, User } from 'lucide-react'

interface UserItem {
  id: string
  email: string
  full_name: string
  role: string
  is_active: boolean
  auth_provider: string
  created_at: string
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async (q?: string) => {
    setIsLoading(true)
    try {
      const resp = await adminApi.listUsers({ search: q, limit: 100 })
      setUsers(resp.data)
    } catch {
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchUsers(search)
  }

  const toggleAdmin = async (user: UserItem) => {
    const newRole = user.role === 'admin' ? 'member' : 'admin'
    if (!confirm(`${user.full_name}-in ${newRole === 'admin' ? 'Admin' : 'Member'} darnank?`)) return
    await adminApi.updateUserRole(user.id, newRole)
    await fetchUsers(search)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">👥 Ogtagordakner</h2>
        <p className="text-muted-foreground">{users.length} ogtagordak</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Anutyan kam email-ov orenuk..."
          className="max-w-md"
        />
        <Button type="submit" variant="outline" className="gap-2">
          <Search className="w-5 h-5" /> Orenuk
        </Button>
      </form>

      <div className="space-y-3">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-xl flex-shrink-0">
                    👩
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-lg font-bold">{user.full_name}</p>
                      {user.role === 'admin' && <Badge variant="default">Admin</Badge>}
                      {!user.is_active && <Badge variant="destructive">Oczroved</Badge>}
                    </div>
                    <p className="text-base text-muted-foreground">{user.email}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.auth_provider === 'google' ? '🔵 Google' :
                       user.auth_provider === 'apple' ? '⚫ Apple' : '📧 Email'} •{' '}
                      Gracanvel {formatDate(user.created_at)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleAdmin(user)}
                  className="gap-2"
                >
                  {user.role === 'admin'
                    ? <><User className="w-4 h-4" /> Member darnank</>
                    : <><Shield className="w-4 h-4" /> Admin darnank</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
