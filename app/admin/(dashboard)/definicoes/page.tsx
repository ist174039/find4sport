'use client'

import { useEffect, useState } from 'react'
import { Image as ImageIcon, Loader2, Plus, Settings, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useModal } from '@/components/providers/modal-provider'
import { DashboardPage, DashboardPageHeader, DashboardSection } from '@/components/patterns/dashboard-page'
import { createCarouselSlideAction, deleteCarouselSlideAction, getRealAdminSettingsAction, saveOperationalSettingsAction, saveRegistrationApprovalAction, toggleCarouselSlideAction } from './actions'

type Slide = {
  id: string
  image_url: string
  title: string | null
  subtitle: string | null
  button_text: string | null
  button_link: string | null
  display_order: number
  is_active: boolean
}

export default function AdminSettingsPage() {
  const { showAlert, showConfirm } = useModal()
  const [loading, setLoading] = useState(true)
  const [savingApproval, setSavingApproval] = useState(false)
  const [manualApproval, setManualApproval] = useState(true)
  const [slides, setSlides] = useState<Slide[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ imageUrl: '', title: '', subtitle: '', buttonText: '', buttonLink: '', displayOrder: 0 })
  const [operational,setOperational]=useState({maintenanceMode:false,registrationsEnabled:true,claimsEnabled:true,eventsRequireApproval:false,supportEmail:'',maxUploadMb:10,claimReviewDays:5})
  const [savingOperational,setSavingOperational]=useState(false)

  useEffect(() => {
    getRealAdminSettingsAction()
      .then(result => {
        setManualApproval(result.manualProfileApproval)
        setSlides(result.slides as Slide[])
        setOperational(result.operational)
      })
      .catch(error => showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível carregar as definições.', 'error'))
      .finally(() => setLoading(false))
  }, [showAlert])

  async function updateApproval(enabled: boolean) {
    setSavingApproval(true)
    try {
      await saveRegistrationApprovalAction(enabled)
      setManualApproval(enabled)
      showAlert('Guardado', enabled ? 'Novos perfis precisam de aprovação administrativa.' : 'Novos perfis ficam ativos automaticamente.', 'success')
    } catch (error) {
      showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível guardar a definição.', 'error')
    } finally {
      setSavingApproval(false)
    }
  }

  async function createSlide() {
    setCreating(true)
    try {
      const slide = await createCarouselSlideAction(form)
      setSlides(current => [...current, slide as Slide].sort((a, b) => a.display_order - b.display_order))
      setForm({ imageUrl: '', title: '', subtitle: '', buttonText: '', buttonLink: '', displayOrder: 0 })
      setDialogOpen(false)
      showAlert('Criado', 'Slide adicionado à homepage.', 'success')
    } catch (error) {
      showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível criar o slide.', 'error')
    } finally {
      setCreating(false)
    }
  }

  async function toggleSlide(slide: Slide, enabled: boolean) {
    try {
      await toggleCarouselSlideAction(slide.id, enabled)
      setSlides(current => current.map(item => item.id === slide.id ? { ...item, is_active: enabled } : item))
    } catch (error) {
      showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível alterar o estado do slide.', 'error')
    }
  }

  async function removeSlide(slide: Slide) {
    const confirmed = await showConfirm('Eliminar slide', `Eliminar “${slide.title || 'slide sem título'}” da homepage?`, { confirmLabel: 'Eliminar', destructive: true })
    if (!confirmed) return
    try {
      await deleteCarouselSlideAction(slide.id)
      setSlides(current => current.filter(item => item.id !== slide.id))
      showAlert('Eliminado', 'Slide removido.', 'success')
    } catch (error) {
      showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível eliminar o slide.', 'error')
    }
  }
  async function saveOperational(){setSavingOperational(true);try{await saveOperationalSettingsAction(operational);showAlert('Guardado','Os parâmetros operacionais foram atualizados.','success')}catch(error){showAlert('Erro',error instanceof Error?error.message:'Não foi possível guardar.','error')}finally{setSavingOperational(false)}}

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

  return (
    <DashboardPage>
      <DashboardPageHeader title="Definições" description="Apenas configurações que têm efeito real no runtime da plataforma são apresentadas aqui." />

      <DashboardSection title="Aprovação de perfis" description="Esta regra é consumida diretamente pelo registo de profissionais e gestores de espaço.">
        <Card>
          <CardContent className="flex min-h-20 items-center justify-between gap-4 p-4 sm:p-5">
            <div className="flex min-w-0 items-start gap-3"><div className="rounded-xl bg-primary/10 p-3 text-primary"><Settings className="h-5 w-5" /></div><div><p className="font-semibold">Aprovação manual</p><p className="mt-1 text-sm text-muted-foreground">Quando ativa, novos perfis não são verificados/ativados automaticamente.</p></div></div>
            <Switch checked={manualApproval} disabled={savingApproval} onCheckedChange={updateApproval} />
          </CardContent>
        </Card>
      </DashboardSection>

      <DashboardSection title="Operação da plataforma" description="Controlo central de disponibilidade, registos, moderação e limites operacionais.">
        <Card><CardContent className="grid gap-5 p-4 sm:grid-cols-2 sm:p-5"><SettingToggle label="Modo de manutenção" description="Assinala a plataforma como temporariamente indisponível." value={operational.maintenanceMode} onChange={value=>setOperational(current=>({...current,maintenanceMode:value}))}/><SettingToggle label="Novos registos" description="Permite a criação de novas contas." value={operational.registrationsEnabled} onChange={value=>setOperational(current=>({...current,registrationsEnabled:value}))}/><SettingToggle label="Reivindicações de espaços" description="Permite novos pedidos de gestão." value={operational.claimsEnabled} onChange={value=>setOperational(current=>({...current,claimsEnabled:value}))}/><SettingToggle label="Aprovação de eventos" description="Exige validação administrativa antes de publicar." value={operational.eventsRequireApproval} onChange={value=>setOperational(current=>({...current,eventsRequireApproval:value}))}/><div><Label>Email de suporte</Label><Input className="mt-2" type="email" value={operational.supportEmail} onChange={event=>setOperational(current=>({...current,supportEmail:event.target.value}))}/></div><div className="grid grid-cols-2 gap-3"><div><Label>Upload máximo (MB)</Label><Input className="mt-2" type="number" min={1} max={50} value={operational.maxUploadMb} onChange={event=>setOperational(current=>({...current,maxUploadMb:Number(event.target.value)}))}/></div><div><Label>Prazo de análise (dias)</Label><Input className="mt-2" type="number" min={1} max={60} value={operational.claimReviewDays} onChange={event=>setOperational(current=>({...current,claimReviewDays:Number(event.target.value)}))}/></div></div><Button className="sm:col-span-2" disabled={savingOperational} onClick={()=>void saveOperational()}>Guardar parâmetros operacionais</Button></CardContent></Card>
      </DashboardSection>

      <DashboardSection
        title="Carrossel da homepage"
        description="Estes slides são lidos diretamente pela página inicial. Não existem slides fictícios ou configuração paralela."
        action={<Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogTrigger render={<Button className="min-h-11"><Plus className="mr-2 h-4 w-4" />Adicionar slide</Button>} /><DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg"><DialogHeader><DialogTitle>Novo slide</DialogTitle></DialogHeader><div className="grid gap-4 pt-2"><div className="space-y-2"><Label>URL da imagem *</Label><Input className="min-h-11 text-base" value={form.imageUrl} onChange={e => setForm(v => ({ ...v, imageUrl: e.target.value }))} /></div><div className="space-y-2"><Label>Título</Label><Input className="min-h-11 text-base" value={form.title} onChange={e => setForm(v => ({ ...v, title: e.target.value }))} /></div><div className="space-y-2"><Label>Subtítulo</Label><Textarea className="min-h-24 text-base" value={form.subtitle} onChange={e => setForm(v => ({ ...v, subtitle: e.target.value }))} /></div><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>Texto do botão</Label><Input className="min-h-11 text-base" value={form.buttonText} onChange={e => setForm(v => ({ ...v, buttonText: e.target.value }))} /></div><div className="space-y-2"><Label>Link do botão</Label><Input className="min-h-11 text-base" value={form.buttonLink} onChange={e => setForm(v => ({ ...v, buttonLink: e.target.value }))} placeholder="/profissionais" /></div></div><div className="space-y-2"><Label>Ordem</Label><Input type="number" className="min-h-11 text-base" value={form.displayOrder} onChange={e => setForm(v => ({ ...v, displayOrder: Number(e.target.value) }))} /></div><Button onClick={createSlide} disabled={creating} className="min-h-11">{creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Guardar slide</Button></div></DialogContent></Dialog>}
      >
        {slides.length === 0 ? <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Sem slides configurados. A homepage deve apresentar um estado vazio próprio.</div> : <div className="grid gap-4 md:grid-cols-2">{slides.map(slide => <Card key={slide.id} className="overflow-hidden"><div className="aspect-[16/8] bg-muted"><img src={slide.image_url} alt={slide.title || ''} className="h-full w-full object-cover" /></div><CardHeader className="pb-3"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><CardTitle className="truncate text-base">{slide.title || 'Sem título'}</CardTitle><CardDescription className="line-clamp-2">{slide.subtitle || 'Sem subtítulo'}</CardDescription></div><Switch checked={slide.is_active} onCheckedChange={enabled => toggleSlide(slide, enabled)} /></div></CardHeader><CardContent className="flex items-center justify-between gap-2 pt-0"><p className="text-xs text-muted-foreground">Ordem {slide.display_order}</p><Button variant="ghost" size="icon" className="h-11 w-11 text-destructive" onClick={() => removeSlide(slide)} aria-label="Eliminar slide"><Trash2 className="h-4 w-4" /></Button></CardContent></Card>)}</div>}
      </DashboardSection>
    </DashboardPage>
  )
}

function SettingToggle({label,description,value,onChange}:{label:string;description:string;value:boolean;onChange:(value:boolean)=>void}){return <label className="flex items-center justify-between gap-4 rounded-xl border p-3"><span><span className="block font-medium">{label}</span><span className="block text-xs text-muted-foreground">{description}</span></span><Switch checked={value} onCheckedChange={onChange}/></label>}
