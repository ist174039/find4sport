'use client'

import { useState } from 'react'
import { Users, X, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { isPlatformRole } from '@/lib/auth/roles'
import { UserAvatar } from '@/components/user-avatar'

const resolveUserLink = (u: any) => {
  if (!u || !isPlatformRole(u.type)) return '#'
  if (u.type === 'professional' && u.professionals?.[0]?.public_slug) return `/profissionais/${u.professionals[0].public_slug}`
  if (u.type === 'venue_manager' && u.sport_spaces?.[0]?.slug) return `/espacos/${u.sport_spaces[0].slug}`
  return `/utilizadores/${u.id}`
}

const resolveUserInfo = (u: any) => {
  let name = u?.full_name || 'Utilizador'
  let avatar = u?.avatar_url || null
  if (!u || !isPlatformRole(u.type)) return { name, avatar }
  if (u.type === 'professional') {
    name = u.professionals?.[0]?.professional_name || u.professionals?.[0]?.full_name || name
    avatar = u.professionals?.[0]?.avatar_url || avatar
  } else if (u.type === 'venue_manager') {
    name = u.sport_spaces?.[0]?.name || name
    avatar = u.sport_spaces?.[0]?.logo_url || avatar
  }
  return { name, avatar }
}

export function CommunityMembersList({ members, memberCount }: { members: any[]; memberCount: number }) {
  const [open, setOpen] = useState(false)
  const safeCount = Math.max(Number(memberCount || 0), members.length)
  const displayMembers = members.slice(0, 5)
  const remaining = Math.max(0, safeCount - displayMembers.length)

  return (
    <div className="min-w-0">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0"><p className="font-semibold text-foreground">{safeCount} {safeCount === 1 ? 'membro' : 'membros'}</p><p className="text-xs text-muted-foreground">Toca num membro para abrir o perfil.</p></div>
        {members.length > 0 && <button type="button" onClick={() => setOpen(true)} className="shrink-0 text-xs font-bold text-primary hover:underline">Ver todos</button>}
      </div>

      {members.length === 0 ? <p className="text-sm text-muted-foreground">Sem membros visíveis.</p> : (
        <div className="flex -space-x-3">
          {displayMembers.map((m: any, index: number) => { const user = m.platform_users; const { name, avatar } = resolveUserInfo(user); return <Link key={m.id || index} href={resolveUserLink(user)} title={name} className="relative z-0 h-12 w-12 overflow-hidden rounded-full border-2 border-background bg-muted shadow-sm transition hover:z-10 hover:scale-110"><UserAvatar name={name} src={avatar} className="h-full w-full" /></Link> })}
          {remaining > 0 && <button type="button" onClick={() => setOpen(true)} className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-bold text-muted-foreground shadow-sm">+{remaining}</button>}
        </div>
      )}

      {open && <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => setOpen(false)}>
        <div className="flex max-h-[85dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-border bg-card shadow-xl sm:rounded-3xl" onClick={event => event.stopPropagation()}>
          <div className="flex shrink-0 items-center justify-between border-b border-border p-4 sm:p-5"><div><h3 className="font-bold">Membros</h3><p className="text-xs text-muted-foreground">{safeCount} no total</p></div><button type="button" onClick={() => setOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted"><X className="h-5 w-5" /></button></div>
          <div className="flex-1 overflow-y-auto p-2 sm:p-3">{members.map((m: any) => { const user = m.platform_users; const { name, avatar } = resolveUserInfo(user); const href = resolveUserLink(user); return <Link key={m.id} href={href} onClick={() => setOpen(false)} className="flex min-h-16 items-center gap-3 rounded-xl p-3 transition hover:bg-muted"><UserAvatar name={name} src={avatar} size="lg" roleLabel={m.role === 'admin' ? 'Administrador' : undefined} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{name}</p><p className="text-xs text-muted-foreground">{m.role === 'admin' ? 'Administrador' : 'Membro'}</p></div><ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" /></Link> })}</div>
        </div>
      </div>}
    </div>
  )
}
