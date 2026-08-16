'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { addDays, addMonths, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek, subDays, subMonths } from 'date-fns'
import { pt } from 'date-fns/locale'
import { CalendarDays, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type AgendaItem = {
  id: string
  kind: 'event' | 'reservation'
  title: string
  at: string
  endAt?: string | null
  status: string
  location?: string | null
  href: string
}

type ViewMode = 'day' | 'week' | 'month'

function ItemCard({ item, compact = false }: { item: AgendaItem; compact?: boolean }) {
  const at = new Date(item.at)
  const endAt = item.endAt ? new Date(item.endAt) : null
  return (
    <Link href={item.href} className={`block min-w-0 rounded-xl border border-border bg-card transition hover:border-primary/40 hover:bg-muted/30 ${compact ? 'p-2' : 'p-3'}`}>
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="min-w-0"><p className={`${compact ? 'text-xs' : 'text-sm'} truncate font-semibold`}>{item.title}</p><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3 shrink-0" />{format(at, 'HH:mm')}{endAt ? `–${format(endAt, 'HH:mm')}` : ''}</p></div>
        {!compact && <Badge variant="outline" className="shrink-0 text-[10px]">{item.kind === 'reservation' ? 'Reserva' : 'Evento'}</Badge>}
      </div>
      {!compact && item.location && <p className="mt-1 flex min-w-0 items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3 shrink-0" /><span className="truncate">{item.location}</span></p>}
    </Link>
  )
}

export function AgendaCalendar({ items }: { items: AgendaItem[] }) {
  const [view, setView] = useState<ViewMode>('week')
  const [cursor, setCursor] = useState(() => new Date())
  const parsed = useMemo(() => items.map(item => ({ ...item, date: new Date(item.at) })).filter(item => !Number.isNaN(item.date.getTime())), [items])

  const move = (direction: -1 | 1) => {
    setCursor(current => view === 'month' ? (direction > 0 ? addMonths(current, 1) : subMonths(current, 1)) : view === 'week' ? addDays(current, direction * 7) : (direction > 0 ? addDays(current, 1) : subDays(current, 1)))
  }

  const weekStart = startOfWeek(cursor, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))
  const monthStart = startOfMonth(cursor)
  const monthGridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const monthGridEnd = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 })
  const monthDays: Date[] = []
  for (let date = monthGridStart; date <= monthGridEnd; date = addDays(date, 1)) monthDays.push(date)

  const itemsForDay = (date: Date) => parsed.filter(item => isSameDay(item.date, date)).sort((a, b) => a.date.getTime() - b.date.getTime())
  const title = view === 'day' ? format(cursor, "EEEE, d 'de' MMMM", { locale: pt }) : view === 'week' ? `${format(weekStart, 'd MMM', { locale: pt })} – ${format(addDays(weekStart, 6), 'd MMM yyyy', { locale: pt })}` : format(cursor, 'MMMM yyyy', { locale: pt })

  return (
    <div className="min-w-0 space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">{(['day', 'week', 'month'] as ViewMode[]).map(mode => <Button key={mode} type="button" size="sm" variant={view === mode ? 'default' : 'ghost'} onClick={() => setView(mode)} className="min-h-10">{mode === 'day' ? 'Dia' : mode === 'week' ? 'Semana' : 'Mês'}</Button>)}</div>
        <div className="flex min-w-0 items-center justify-between gap-2 sm:justify-end"><Button type="button" variant="outline" size="icon" onClick={() => move(-1)} aria-label="Período anterior"><ChevronLeft className="h-4 w-4" /></Button><Button type="button" variant="ghost" onClick={() => setCursor(new Date())} className="min-w-0 max-w-[220px] flex-1 truncate px-2 font-semibold capitalize sm:flex-none">{title}</Button><Button type="button" variant="outline" size="icon" onClick={() => move(1)} aria-label="Período seguinte"><ChevronRight className="h-4 w-4" /></Button></div>
      </div>

      {view === 'day' && <div className="min-w-0 rounded-2xl border border-border bg-card p-4"><div className="mb-4 flex items-center gap-2"><CalendarDays className="h-5 w-5 text-primary" /><h3 className="font-semibold capitalize">{format(cursor, "EEEE, d 'de' MMMM", { locale: pt })}</h3></div><div className="space-y-2">{itemsForDay(cursor).length ? itemsForDay(cursor).map(item => <ItemCard key={item.id} item={item} />) : <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Sem compromissos neste dia.</p>}</div></div>}

      {view === 'week' && <div className="grid min-w-0 gap-3 lg:grid-cols-7">{weekDays.map(day => { const dayItems = itemsForDay(day); return <section key={day.toISOString()} className={`min-w-0 rounded-2xl border bg-card p-3 ${isSameDay(day, new Date()) ? 'border-primary/40' : 'border-border'}`}><div className="mb-3 flex items-center justify-between lg:block"><div><p className="text-xs font-semibold uppercase text-muted-foreground">{format(day, 'EEE', { locale: pt })}</p><p className="text-xl font-bold">{format(day, 'd')}</p></div><Badge variant="secondary" className="lg:mt-2">{dayItems.length}</Badge></div><div className="space-y-2">{dayItems.length ? dayItems.map(item => <ItemCard key={item.id} item={item} compact />) : <p className="py-3 text-xs text-muted-foreground">Livre</p>}</div></section> })}</div>}

      {view === 'month' && <div className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card"><div className="grid grid-cols-7 border-b bg-muted/30">{['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map(day => <div key={day} className="p-2 text-center text-[10px] font-bold uppercase text-muted-foreground sm:text-xs">{day}</div>)}</div><div className="grid grid-cols-7">{monthDays.map(day => { const dayItems = itemsForDay(day); return <button key={day.toISOString()} type="button" onClick={() => { setCursor(day); setView('day') }} className={`min-h-20 min-w-0 border-b border-r p-1.5 text-left transition hover:bg-muted/30 sm:min-h-28 sm:p-2 ${!isSameMonth(day, cursor) ? 'bg-muted/10 text-muted-foreground/50' : ''}`}><span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${isSameDay(day, new Date()) ? 'bg-primary text-primary-foreground' : ''}`}>{format(day, 'd')}</span>{dayItems.length > 0 && <div className="mt-1 space-y-1"><div className="h-1.5 w-1.5 rounded-full bg-primary sm:hidden" />{dayItems.slice(0, 2).map(item => <div key={item.id} className="hidden truncate rounded bg-muted px-1.5 py-1 text-[10px] sm:block">{format(item.date, 'HH:mm')} {item.title}</div>)}{dayItems.length > 2 && <p className="hidden text-[10px] text-muted-foreground sm:block">+{dayItems.length - 2}</p>}</div>}</button> })}</div></div>}
    </div>
  )
}
