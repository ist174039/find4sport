'use client'

import { useState } from 'react'
import { Users, X } from 'lucide-react'
import Link from 'next/link'

export function CommunityMembersList({ 
  members, 
  memberCount 
}: { 
  members: any[]
  memberCount: number 
}) {
  const [open, setOpen] = useState(false)

  // Show only top 5 in the preview
  const displayMembers = members.slice(0, 5)
  const remaining = Math.max(0, memberCount - 5)

  return (
    <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-foreground">Membros Ativos</h3>
        <button 
          onClick={() => setOpen(true)}
          className="text-primary text-xs font-bold cursor-pointer hover:underline"
        >
          Ver Todos
        </button>
      </div>
      
      {members.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sem membros visíveis ainda.</p>
      ) : (
        <div className="flex -space-x-4">
          {displayMembers.map((m: any, i: number) => {
            const user = m.platform_users
            const userId = user?.id || m.user_id
            return (
              <Link 
                key={m.id || i} 
                href={userId ? `/utilizadores/${userId}` : '#'}
                title={user?.full_name || 'Membro'} 
                className="w-12 h-12 rounded-full border-2 border-background bg-muted overflow-hidden relative shadow-sm hover:scale-110 hover:z-20 transition-all cursor-pointer"
              >
                <img 
                  src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'U')}&background=random`} 
                  alt={user?.full_name || 'Membro'} 
                  className="w-full h-full object-cover" 
                />
              </Link>
            )
          })}
          {remaining > 0 && (
            <div 
              onClick={() => setOpen(true)}
              className="w-12 h-12 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shadow-sm relative z-10 cursor-pointer hover:brightness-90 transition-all"
            >
              +{remaining}
            </div>
          )}
        </div>
      )}

      {/* Modal - Ver Todos */}
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-3xl overflow-hidden shadow-xl relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
              <div className="flex items-center gap-2">
                <Users className="text-primary h-5 w-5" />
                <h3 className="text-lg font-bold text-foreground">Todos os Membros</h3>
              </div>
              <button 
                onClick={() => setOpen(false)}
                className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {members.map((m: any) => {
                const user = m.platform_users
                const userId = user?.id || m.user_id
                return (
                  <Link 
                    key={m.id} 
                    href={userId ? `/utilizadores/${userId}` : '#'}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted transition-colors border border-transparent hover:border-border cursor-pointer group"
                  >
                    <img 
                      src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'U')}&background=random`} 
                      alt={user?.full_name || 'Membro'} 
                      className="w-12 h-12 rounded-full object-cover border border-border group-hover:border-primary/50 transition-colors"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">{user?.full_name || 'Utilizador'}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {m.role === 'admin' ? 'Administrador' : 'Membro'}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
            
          </div>
        </div>
      )}
    </div>
  )
}
