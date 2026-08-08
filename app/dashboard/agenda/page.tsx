'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Plus, ChevronLeft, ChevronRight, Clock, MapPin, Calendar as CalendarIcon, User, CheckCircle2, XCircle, Check, Filter, LayoutGrid, Columns, List } from 'lucide-react'
import Link from 'next/link'
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, 
  parseISO, isToday, addWeeks, subWeeks, subDays
} from 'date-fns'
import { pt } from 'date-fns/locale'

type CalendarItem = {
  id: string
  title: string
  start_date: Date
  end_date: Date | null
  address: string | null
  type: 'event' | 'reservation'
  status: string
  client_name?: string
  ref_id: string
}

type AvailabilitySlot = {
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
}

type ViewMode = 'month' | 'week' | 'day'

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7) // 07:00 to 22:00

export default function DashboardAgendaPage() {
  const router = useRouter()
  const [items, setItems] = useState<CalendarItem[]>([])
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([])
  const [loading, setLoading] = useState(true)
  const [actionKey, setActionKey] = useState<string | null>(null)
  
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [itemFilter, setItemFilter] = useState<'all' | 'event' | 'reservation'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'published' | 'cancelled' | 'completed'>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('month')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      // 1. Fetch Events
      const { data: eventsData } = await supabase
        .from('events')
        .select('id, title, start_date, end_date, address, status')
        .eq('created_by', user.id)

      // 2. Fetch Reservations
      const { data: prof } = await supabase.from('professionals').select('id').eq('user_id', user.id).maybeSingle()
      const { data: spaces } = await supabase.from('sport_spaces').select('id').eq('owner_user_id', user.id)

      if (prof?.id) {
        const { data: availData } = await supabase
          .from('professional_availability')
          .select('day_of_week, start_time, end_time, is_active')
          .eq('professional_id', prof.id)
        setAvailability((availData || []) as AvailabilitySlot[])
      }
      
      let resQuery = supabase.from('reservations').select('*, user:platform_users(full_name)')
      
      const orConditions: string[] = []
      if (prof) orConditions.push(`professional_id.eq.${prof.id}`)
      if (spaces && spaces.length > 0) {
        const spaceIds = spaces.map(s => s.id).join(',')
        orConditions.push(`space_id.in.(${spaceIds})`)
      }
      
      let reservationsData: any[] = []
      if (orConditions.length > 0) {
        const { data: resData } = await resQuery.or(orConditions.join(','))
        if (resData) reservationsData = resData
      }

      // Merge and map
      const merged: CalendarItem[] = []
      
      if (eventsData) {
        eventsData.forEach(e => {
          merged.push({
            id: `evt_${e.id}`,
            title: e.title,
            start_date: parseISO(e.start_date),
            end_date: e.end_date ? parseISO(e.end_date) : null,
            address: e.address,
            type: 'event',
            status: e.status,
            ref_id: e.id
          })
        })
      }

      if (reservationsData) {
        reservationsData.forEach(r => {
          const dateStr = `${r.date}T${r.start_time}`
          const startDate = new Date(dateStr)
          merged.push({
            id: `res_${r.id}`,
            title: `Reserva - ${r.user?.full_name || 'Cliente'}`,
            start_date: startDate,
            end_date: new Date(`${r.date}T${r.end_time}`),
            address: null,
            type: 'reservation',
            status: r.status,
            client_name: r.user?.full_name || 'Desconhecido',
            ref_id: r.id
          })
        })
      }

      setItems(merged)
      setLoading(false)
    }
    load()
  }, [router])

  const applyItemStatus = (itemId: string, status: string) => {
    setItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, status } : it)))
  }

  const updateReservationStatus = async (item: CalendarItem, newStatus: 'confirmed' | 'cancelled' | 'completed') => {
    const supabase = createClient()
    setActionKey(`${item.id}-${newStatus}`)
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status: newStatus })
        .eq('id', item.ref_id)
      if (!error) applyItemStatus(item.id, newStatus)
    } finally {
      setActionKey(null)
    }
  }

  const updateEventStatus = async (item: CalendarItem, newStatus: 'published' | 'cancelled' | 'completed') => {
    const supabase = createClient()
    setActionKey(`${item.id}-${newStatus}`)
    try {
      const { error } = await supabase
        .from('events')
        .update({ status: newStatus })
        .eq('id', item.ref_id)
      if (!error) applyItemStatus(item.id, newStatus)
    } finally {
      setActionKey(null)
    }
  }

  // Navigation
  const navigateNext = () => {
    if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1))
    else if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1))
    else setCurrentDate(addDays(currentDate, 1))
  }
  const navigatePrev = () => {
    if (viewMode === 'month') setCurrentDate(subMonths(currentDate, 1))
    else if (viewMode === 'week') setCurrentDate(subWeeks(currentDate, 1))
    else setCurrentDate(subDays(currentDate, 1))
  }
  const goToToday = () => setCurrentDate(new Date())

  const handleDateClick = (day: Date) => {
    setSelectedDate(day)
    setIsModalOpen(true)
  }

  const filteredItems = items
    .filter((item) => (itemFilter === 'all' ? true : item.type === itemFilter))
    .filter((item) => (statusFilter === 'all' ? true : item.status === statusFilter))

  const reservationSummary = {
    pending: items.filter((i) => i.type === 'reservation' && i.status === 'pending').length,
    confirmed: items.filter((i) => i.type === 'reservation' && i.status === 'confirmed').length,
  }

  const eventSummary = {
    draft: items.filter((i) => i.type === 'event' && (i.status === 'draft' || i.status === 'pending')).length,
    published: items.filter((i) => i.type === 'event' && i.status === 'published').length,
  }

  const selectedDayItems = selectedDate
    ? filteredItems
        .filter(item => isSameDay(item.start_date, selectedDate))
        .sort((a,b) => a.start_date.getTime() - b.start_date.getTime())
    : []

  const selectedDayAvailability = selectedDate
    ? availability.find((a) => a.day_of_week === selectedDate.getDay() && a.is_active)
    : null

  // =========================
  // HEADER with navigation
  // =========================
  const getHeaderTitle = () => {
    if (viewMode === 'month') return format(currentDate, 'MMMM yyyy', { locale: pt })
    if (viewMode === 'week') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
      return `${format(weekStart, 'd MMM', { locale: pt })} — ${format(weekEnd, 'd MMM yyyy', { locale: pt })}`
    }
    return format(currentDate, 'EEEE, d MMMM yyyy', { locale: pt })
  }

  const renderNavHeader = () => (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-bold text-foreground capitalize">{getHeaderTitle()}</h2>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={navigatePrev}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={goToToday}>Hoje</Button>
        <Button variant="outline" size="sm" onClick={navigateNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  // =========================
  // MONTHLY VIEW
  // =========================
  const renderMonthDayNames = () => {
    const days = []
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 })
    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center font-semibold text-sm py-2 text-muted-foreground uppercase">
          {format(addDays(startDate, i), 'EEEE', { locale: pt }).substring(0, 3)}
        </div>
      )
    }
    return <div className="grid grid-cols-7 border-b border-border mb-2">{days}</div>
  }

  const renderMonthCells = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const rows = []
    let days = []
    let day = startDate

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, 'd')
        const cloneDay = day
        const dayItems = filteredItems.filter(item => isSameDay(item.start_date, cloneDay))
        const visibleItems = dayItems.slice(0, 3)
        const hasMore = dayItems.length > 3

        days.push(
          <div
            key={day.toString()}
            onClick={() => handleDateClick(cloneDay)}
            className={`min-h-[100px] sm:min-h-[120px] border border-border/50 p-1 sm:p-2 flex flex-col transition-colors cursor-pointer hover:bg-muted/30 ${
              !isSameMonth(day, monthStart)
                ? 'bg-muted/10 text-muted-foreground'
                : isToday(day)
                ? 'bg-primary/5'
                : 'bg-card'
            }`}
          >
            <div className="flex justify-end mb-1">
              <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${isToday(day) ? 'bg-primary text-primary-foreground' : ''}`}>
                {formattedDate}
              </span>
            </div>
            <div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar flex-1">
              {visibleItems.map(item => (
                <div 
                  key={item.id} 
                  className={`text-[10px] sm:text-xs truncate px-1.5 py-0.5 rounded border shadow-sm font-medium ${
                    item.type === 'event' 
                      ? 'bg-primary/10 text-primary border-primary/20' 
                      : 'bg-amber-500/10 text-amber-700 border-amber-500/20'
                  }`}
                  title={item.title}
                >
                  {format(item.start_date, 'HH:mm')} - {item.title}
                </div>
              ))}
              {hasMore && (
                <div className="text-[10px] text-muted-foreground font-semibold text-center mt-0.5">
                  +{dayItems.length - 3} mais
                </div>
              )}
            </div>
          </div>
        )
        day = addDays(day, 1)
      }
      rows.push(<div className="grid grid-cols-7" key={day.toString()}>{days}</div>)
      days = []
    }
    return <div>{rows}</div>
  }

  // =========================
  // WEEKLY VIEW
  // =========================
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

    return (
      <div className="border border-border rounded-xl overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border bg-muted/30">
          <div className="p-2 text-xs font-semibold text-muted-foreground border-r border-border" />
          {weekDays.map((day, i) => (
            <div 
              key={i} 
              className={`p-3 text-center border-r border-border last:border-r-0 cursor-pointer hover:bg-muted/50 transition-colors ${
                isToday(day) ? 'bg-primary/5' : ''
              }`}
              onClick={() => { setCurrentDate(day); setViewMode('day') }}
            >
              <div className="text-xs font-semibold text-muted-foreground uppercase">
                {format(day, 'EEE', { locale: pt })}
              </div>
              <div className={`text-lg font-bold mt-0.5 ${isToday(day) ? 'text-primary' : 'text-foreground'}`}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>

        {/* Time grid */}
        <div className="max-h-[600px] overflow-y-auto">
          {HOURS.map(hour => (
            <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border/50 min-h-[60px]">
              <div className="p-1 text-xs text-muted-foreground text-right pr-2 border-r border-border font-medium">
                {`${hour.toString().padStart(2, '0')}:00`}
              </div>
              {weekDays.map((day, dayIdx) => {
                const dayHourItems = filteredItems.filter(item => {
                  if (!isSameDay(item.start_date, day)) return false
                  const itemHour = item.start_date.getHours()
                  return itemHour === hour
                })

                return (
                  <div 
                    key={dayIdx} 
                    className={`border-r border-border/50 last:border-r-0 p-0.5 relative cursor-pointer hover:bg-muted/20 transition-colors ${
                      isToday(day) ? 'bg-primary/[0.02]' : ''
                    }`}
                    onClick={() => handleDateClick(day)}
                  >
                    {dayHourItems.map(item => (
                      <div 
                        key={item.id}
                        className={`text-[10px] leading-tight px-1.5 py-1 rounded border mb-0.5 font-medium truncate ${
                          item.type === 'event'
                            ? 'bg-primary/10 text-primary border-primary/20'
                            : item.status === 'confirmed' 
                              ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
                              : item.status === 'pending'
                              ? 'bg-amber-500/10 text-amber-700 border-amber-500/20'
                              : 'bg-muted text-muted-foreground border-border'
                        }`}
                        title={`${format(item.start_date, 'HH:mm')} ${item.title}`}
                      >
                        <span className="font-bold">{format(item.start_date, 'HH:mm')}</span> {item.title}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // =========================
  // DAILY VIEW
  // =========================
  const renderDayView = () => {
    const dayItems = filteredItems
      .filter(item => isSameDay(item.start_date, currentDate))
      .sort((a, b) => a.start_date.getTime() - b.start_date.getTime())

    const dayAvailability = availability.find(a => a.day_of_week === currentDate.getDay() && a.is_active)

    return (
      <div className="space-y-4">
        {/* Day summary header */}
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-foreground capitalize">
              {format(currentDate, 'EEEE, d MMMM yyyy', { locale: pt })}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {dayItems.length === 0 ? 'Sem atividades agendadas' : `${dayItems.length} atividade${dayItems.length > 1 ? 's' : ''} agendada${dayItems.length > 1 ? 's' : ''}`}
            </p>
          </div>
          {dayAvailability && (
            <div className="flex items-center gap-2 text-sm bg-emerald-500/10 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-500/20 font-medium">
              <Clock className="h-4 w-4" />
              Disponível: {dayAvailability.start_time.substring(0, 5)} — {dayAvailability.end_time.substring(0, 5)}
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="border border-border rounded-xl overflow-hidden">
          {HOURS.map(hour => {
            const hourItems = dayItems.filter(item => item.start_date.getHours() === hour)

            return (
              <div key={hour} className="grid grid-cols-[70px_1fr] border-b border-border/50 last:border-b-0 min-h-[64px]">
                <div className="p-2 text-sm text-muted-foreground font-semibold text-right pr-3 border-r border-border bg-muted/20 flex items-start justify-end pt-3">
                  {`${hour.toString().padStart(2, '0')}:00`}
                </div>
                <div className="p-2 space-y-2">
                  {hourItems.map(item => (
                    <div 
                      key={item.id}
                      className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                        item.type === 'event'
                          ? 'bg-primary/5 border-primary/20'
                          : item.status === 'confirmed'
                          ? 'bg-emerald-500/5 border-emerald-500/20'
                          : item.status === 'pending'
                          ? 'bg-amber-500/5 border-amber-500/20'
                          : 'bg-muted/30 border-border'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-muted-foreground">
                            {format(item.start_date, 'HH:mm')}
                            {item.end_date && ` — ${format(item.end_date, 'HH:mm')}`}
                          </span>
                          <Badge variant="outline" className={`text-[10px] ${
                            item.type === 'event' ? 'bg-primary/10 text-primary' : 'bg-amber-500/10 text-amber-700'
                          }`}>
                            {item.type === 'event' ? 'Evento' : 'Reserva'}
                          </Badge>
                          <Badge variant="outline" className={`text-[10px] ${
                            item.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' :
                            item.status === 'pending' ? 'bg-amber-500/10 text-amber-700 border-amber-500/20' :
                            item.status === 'cancelled' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {item.status === 'confirmed' ? 'Confirmado' :
                             item.status === 'pending' ? 'Pendente' :
                             item.status === 'cancelled' ? 'Cancelado' :
                             item.status === 'completed' ? 'Concluído' :
                             item.status}
                          </Badge>
                        </div>
                        <h4 className="text-sm font-bold text-foreground">{item.title}</h4>
                        {item.client_name && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <User className="h-3 w-3" /> {item.client_name}
                          </p>
                        )}
                        {item.address && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" /> {item.address}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-1.5 shrink-0">
                        {item.type === 'reservation' && (item.status === 'pending' || item.status === 'paid') && (
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs h-8"
                            disabled={actionKey === `${item.id}-confirmed`}
                            onClick={() => updateReservationStatus(item, 'confirmed')}>
                            <Check className="mr-1 h-3 w-3" /> Confirmar
                          </Button>
                        )}
                        {item.type === 'reservation' && item.status === 'confirmed' && (
                          <Button size="sm" className="bg-primary hover:bg-primary/90 text-xs h-8"
                            disabled={actionKey === `${item.id}-completed`}
                            onClick={() => updateReservationStatus(item, 'completed')}>
                            <CheckCircle2 className="mr-1 h-3 w-3" /> Concluir
                          </Button>
                        )}
                        {item.type === 'reservation' && item.status !== 'cancelled' && item.status !== 'completed' && (
                          <Button size="sm" variant="outline" className="text-destructive text-xs h-8"
                            disabled={actionKey === `${item.id}-cancelled`}
                            onClick={() => updateReservationStatus(item, 'cancelled')}>
                            <XCircle className="mr-1 h-3 w-3" /> Cancelar
                          </Button>
                        )}
                        {item.type === 'event' && (item.status === 'draft' || item.status === 'pending') && (
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs h-8"
                            disabled={actionKey === `${item.id}-published`}
                            onClick={() => updateEventStatus(item, 'published')}>
                            <Check className="mr-1 h-3 w-3" /> Publicar
                          </Button>
                        )}
                        <Button size="sm" variant="outline" className="text-xs h-8" asChild>
                          <Link href={item.type === 'event' ? `/dashboard/eventos/${item.ref_id}/editar` : `/dashboard/reservas`}>
                            Detalhes
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-muted rounded"></div>
        <div className="h-[600px] bg-muted rounded-xl"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agenda</h1>
          <p className="text-sm text-muted-foreground">Calendário de eventos e marcações.</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-4 text-xs font-medium mr-4">
             <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-primary/20 border border-primary/30 inline-block"></span> Eventos</div>
             <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/30 inline-block"></span> Reservas</div>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard/agenda/disponibilidade">Gerir Disponibilidade</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/eventos/criar">
              <Plus className="mr-2 h-4 w-4" /> Novo Evento
            </Link>
          </Button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Reservas Pendentes</p><p className="text-2xl font-bold text-foreground">{reservationSummary.pending}</p></CardContent></Card>
        <Card className="border-border"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Reservas Confirmadas</p><p className="text-2xl font-bold text-foreground">{reservationSummary.confirmed}</p></CardContent></Card>
        <Card className="border-border"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Eventos por Publicar</p><p className="text-2xl font-bold text-foreground">{eventSummary.draft}</p></CardContent></Card>
        <Card className="border-border"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Eventos Publicados</p><p className="text-2xl font-bold text-foreground">{eventSummary.published}</p></CardContent></Card>
      </div>

      {/* Filters + View Mode Switcher */}
      <Card className="mb-6 border-border">
        <CardContent className="p-4 sm:p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Filter className="h-4 w-4 text-primary" /> Filtros
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Button size="sm" variant={itemFilter === 'all' ? 'default' : 'outline'} onClick={() => setItemFilter('all')}>Tudo</Button>
              <Button size="sm" variant={itemFilter === 'reservation' ? 'default' : 'outline'} onClick={() => setItemFilter('reservation')}>Reservas</Button>
              <Button size="sm" variant={itemFilter === 'event' ? 'default' : 'outline'} onClick={() => setItemFilter('event')}>Eventos</Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Button size="sm" variant={statusFilter === 'all' ? 'default' : 'outline'} onClick={() => setStatusFilter('all')}>Todos</Button>
              <Button size="sm" variant={statusFilter === 'pending' ? 'default' : 'outline'} onClick={() => setStatusFilter('pending')}>Pendentes</Button>
              <Button size="sm" variant={statusFilter === 'confirmed' ? 'default' : 'outline'} onClick={() => setStatusFilter('confirmed')}>Confirmados</Button>
            </div>
          </div>

          {/* View Mode Selector */}
          <div className="flex bg-muted rounded-lg p-1 gap-0.5">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'month' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Mês
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'week' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Columns className="h-3.5 w-3.5" /> Semana
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'day' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="h-3.5 w-3.5" /> Dia
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Content */}
      <Card className="shadow-sm border-border overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          {renderNavHeader()}

          {viewMode === 'month' && (
            <>
              {renderMonthDayNames()}
              <div className="border-l border-t border-border/50 rounded-lg overflow-hidden bg-muted/20">
                {renderMonthCells()}
              </div>
            </>
          )}

          {viewMode === 'week' && renderWeekView()}

          {viewMode === 'day' && renderDayView()}
        </CardContent>
      </Card>

      {/* Day Detail Modal (from month/week click) */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedDate ? format(selectedDate, 'EEEE, d MMMM yyyy', { locale: pt }) : ''}
            </DialogTitle>
            <DialogDescription>
              Atividades agendadas para este dia.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl border border-border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
            {selectedDayAvailability
              ? `Disponibilidade ativa: ${selectedDayAvailability.start_time.substring(0,5)} - ${selectedDayAvailability.end_time.substring(0,5)}`
              : 'Dia sem disponibilidade definida para serviço.'}
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button size="sm" variant="outline" onClick={() => {
              if (selectedDate) {
                setCurrentDate(selectedDate)
                setViewMode('day')
                setIsModalOpen(false)
              }
            }}>
              <List className="h-3.5 w-3.5 mr-1.5" /> Ver vista diária
            </Button>
          </div>
          
          <div className="max-h-[60vh] overflow-y-auto space-y-3 py-2">
            {selectedDayItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
                <CalendarIcon className="h-10 w-10 mb-3 opacity-20" />
                <p>Nenhuma atividade planeada para este dia.</p>
              </div>
            ) : (
              selectedDayItems.map(item => (
                <div key={item.id} className={`p-4 rounded-xl border ${
                  item.type === 'event' 
                    ? 'bg-primary/5 border-primary/20' 
                    : 'bg-amber-500/5 border-amber-500/20'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-sm text-foreground">{item.title}</h3>
                    <Badge variant="outline" className={
                      item.type === 'event' ? 'bg-primary/10 text-primary' : 'bg-amber-500/10 text-amber-700'
                    }>
                      {item.type === 'event' ? 'Evento' : 'Reserva'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1.5 mt-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" />
                      {format(item.start_date, 'HH:mm')}
                      {item.end_date && ` - ${format(item.end_date, 'HH:mm')}`}
                    </div>
                    {item.type === 'reservation' && item.client_name && (
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5" /> Cliente: {item.client_name}
                      </div>
                    )}
                    {item.type === 'event' && item.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5" /> {item.address}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-border/50 flex justify-end">
                    <div className="flex flex-wrap gap-2">
                      {item.type === 'reservation' && (item.status === 'pending' || item.status === 'paid') && (
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700"
                          disabled={actionKey === `${item.id}-confirmed`}
                          onClick={() => updateReservationStatus(item, 'confirmed')}>
                          <Check className="mr-1 h-3.5 w-3.5" /> Confirmar
                        </Button>
                      )}
                      {item.type === 'reservation' && item.status !== 'cancelled' && item.status !== 'completed' && (
                        <Button size="sm" variant="outline" className="text-destructive"
                          disabled={actionKey === `${item.id}-cancelled`}
                          onClick={() => updateReservationStatus(item, 'cancelled')}>
                          <XCircle className="mr-1 h-3.5 w-3.5" /> Cancelar
                        </Button>
                      )}
                      <Button size="sm" variant="outline" asChild>
                        <Link href={item.type === 'event' ? `/dashboard/eventos/${item.ref_id}/editar` : `/dashboard/reservas`}>
                          Detalhes
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
