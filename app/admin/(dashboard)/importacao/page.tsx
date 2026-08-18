'use client'

import { useRef, useState } from 'react'
import { Building2, FileJson, Loader2, MapPin, Search, Trash2, Upload } from 'lucide-react'
import { adminIngestData, searchImportPlacesAction } from '@/app/actions/admin-ingest'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useModal } from '@/components/providers/modal-provider'
import { DashboardEmptyState, DashboardPage, DashboardPageHeader, DashboardSection, DashboardStat, DashboardStatGrid } from '@/components/patterns/dashboard-page'

type QueueItem = {
  id: string
  name: string
  address: string
  type: 'space'
  lat: number
  lon: number
  phone?: string
  description?: string
  source?: string
}

function parseCsvLine(line: string) {
  const values: string[] = []
  let current = ''
  let quoted = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (quoted && line[i + 1] === '"') { current += '"'; i++ } else quoted = !quoted
    } else if (char === ',' && !quoted) {
      values.push(current.trim()); current = ''
    } else current += char
  }
  values.push(current.trim())
  return values
}

function normalizeImportedObject(obj: any, id: string): QueueItem | null {
  const name = String(obj.name || obj.nome || obj.title || '').trim()
  const address = String(obj.address || obj.endereco || obj.location || '').trim()
  const lat = Number(obj.latitude ?? obj.lat)
  const lon = Number(obj.longitude ?? obj.lon ?? obj.lng)
  if (!name || !address || !Number.isFinite(lat) || !Number.isFinite(lon)) return null
  return { id, name, address, type: 'space', lat, lon, phone: obj.phone || obj.telefone || undefined, description: obj.description || obj.descricao || undefined, source: 'Ficheiro' }
}

export default function ImportPage() {
  const { showAlert, showConfirm } = useModal()
  const fileRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<QueueItem[]>([])
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [importing, setImporting] = useState(false)

  const add = (item: QueueItem) => {
    if (queue.some(existing => existing.name.toLowerCase() === item.name.toLowerCase() && existing.address.toLowerCase() === item.address.toLowerCase())) return showAlert('Duplicado na fila', 'Este espaço já foi adicionado à fila atual.', 'info')
    setQueue(current => [...current, item])
  }

  async function searchPlaces() {
    if (query.trim().length < 3) return
    setSearching(true)
    try {
      const data = await searchImportPlacesAction(query)
      setResults(data)
      if (data.length === 0) showAlert('Sem resultados', 'A pesquisa não devolveu locais.', 'info')
    } catch (error) {
      showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível pesquisar locais.', 'error')
    } finally {
      setSearching(false)
    }
  }

  async function readFile(file: File) {
    try {
      const content = await file.text()
      let items: QueueItem[] = []
      if (file.name.toLowerCase().endsWith('.json')) {
        const parsed = JSON.parse(content)
        items = (Array.isArray(parsed) ? parsed : [parsed]).map((obj, index) => normalizeImportedObject(obj, `json-${crypto.randomUUID()}-${index}`)).filter(Boolean) as QueueItem[]
      } else if (file.name.toLowerCase().endsWith('.csv')) {
        const lines = content.split(/\r?\n/).filter(Boolean)
        if (lines.length < 2) throw new Error('O CSV não contém linhas de dados.')
        const headers = parseCsvLine(lines[0]).map(value => value.toLowerCase())
        items = lines.slice(1).map((line, index) => {
          const values = parseCsvLine(line)
          const obj: Record<string, string> = {}
          headers.forEach((header, position) => { obj[header] = values[position] || '' })
          return normalizeImportedObject(obj, `csv-${crypto.randomUUID()}-${index}`)
        }).filter(Boolean) as QueueItem[]
      } else throw new Error('Use um ficheiro CSV ou JSON.')

      if (items.length === 0) throw new Error('Nenhum registo válido. Nome, morada, latitude e longitude são obrigatórios.')
      setQueue(current => [...current, ...items])
      showAlert('Ficheiro processado', `${items.length} espaços válidos foram adicionados à fila.`, 'success')
    } catch (error) {
      showAlert('Ficheiro inválido', error instanceof Error ? error.message : 'Não foi possível ler o ficheiro.', 'error')
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function ingest() {
    if (queue.length === 0) return
    const confirmed = await showConfirm('Importar espaços', `Importar ${queue.length} espaços como pendentes e não verificados?`, { confirmLabel: 'Importar' })
    if (!confirmed) return
    setImporting(true)
    try {
      const result = await adminIngestData(queue)
      if (result.error) throw new Error(result.error)
      setQueue([])
      showAlert('Importação concluída', `${result.countInserted || 0} espaços inseridos. ${result.duplicateCount || 0} duplicados ignorados; ${(result.invalid || []).length} inválidos ignorados.`, 'success')
    } catch (error) {
      showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível importar os espaços.', 'error')
    } finally {
      setImporting(false)
    }
  }

  return (
    <DashboardPage>
      <DashboardPageHeader title="Importação de espaços" description="Pesquisa geográfica e ficheiros servem apenas para criar espaços pendentes. Profissionais entram sempre por onboarding com identidade real." />

      <DashboardStatGrid>
        <DashboardStat label="Na fila" value={queue.length} icon={<Building2 className="h-5 w-5" />} />
        <DashboardStat label="Resultados" value={results.length} icon={<Search className="h-5 w-5" />} />
        <DashboardStat label="Formato" value="CSV / JSON" icon={<FileJson className="h-5 w-5" />} />
        <DashboardStat label="Destino" value="Pendente" icon={<MapPin className="h-5 w-5" />} />
      </DashboardStatGrid>

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardSection title="Pesquisar local" description="Consulta geográfica server-side. Só são usados nome, morada e coordenadas devolvidos pela fonte.">
          <div className="flex flex-col gap-2 sm:flex-row"><Input className="min-h-11 text-base" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') void searchPlaces() }} placeholder="Ex.: Padel Lisboa" /><Button onClick={searchPlaces} disabled={searching || query.trim().length < 3} className="min-h-11 shrink-0">{searching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}Pesquisar</Button></div>
          <div className="mt-4 space-y-2">{results.map(item => <article key={item.id} className="flex items-start justify-between gap-3 rounded-xl border border-border p-3"><div className="min-w-0"><p className="truncate text-sm font-semibold">{item.name}</p><p className="line-clamp-2 text-xs text-muted-foreground">{item.address}</p><p className="mt-1 text-[11px] text-muted-foreground">{item.lat.toFixed(5)}, {item.lon.toFixed(5)}</p></div><Button variant="outline" size="sm" className="min-h-10 shrink-0" onClick={() => add(item)}>Adicionar</Button></article>)}</div>
        </DashboardSection>

        <DashboardSection title="Importar ficheiro" description="Campos obrigatórios: name/nome, address/endereco, latitude/lat e longitude/lon/lng.">
          <input ref={fileRef} type="file" accept=".csv,.json,application/json,text/csv" className="hidden" onChange={e => { const file = e.target.files?.[0]; if (file) void readFile(file) }} />
          <button type="button" onClick={() => fileRef.current?.click()} className="flex min-h-44 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-6 text-center transition-colors hover:border-primary hover:bg-primary/5"><Upload className="h-8 w-8 text-primary" /><p className="mt-3 font-semibold">Selecionar CSV ou JSON</p><p className="mt-1 text-xs text-muted-foreground">Não são inventados ratings, reviews, emails, imagens ou coordenadas.</p></button>
        </DashboardSection>
      </div>

      <DashboardSection title="Fila de validação" description="Revise os dados antes de criar registos na base de dados." action={<Button onClick={ingest} disabled={importing || queue.length === 0} className="min-h-11">{importing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Importar {queue.length || ''}</Button>}>
        {queue.length === 0 ? <DashboardEmptyState icon={<Building2 className="h-10 w-10" />} title="Fila vazia" description="Adicione resultados de pesquisa ou carregue um ficheiro." /> : <div className="grid gap-3 md:grid-cols-2">{queue.map(item => <article key={item.id} className="flex items-start justify-between gap-3 rounded-xl border border-border p-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="truncate text-sm font-semibold">{item.name}</p><Badge variant="outline">{item.source || 'Importação'}</Badge></div><p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.address}</p><p className="mt-1 text-[11px] text-muted-foreground">{item.lat.toFixed(5)}, {item.lon.toFixed(5)}</p></div><Button variant="ghost" size="icon" className="h-11 w-11 shrink-0 text-destructive" onClick={() => setQueue(current => current.filter(row => row.id !== item.id))} aria-label="Remover da fila"><Trash2 className="h-4 w-4" /></Button></article>)}</div>}
      </DashboardSection>
    </DashboardPage>
  )
}
