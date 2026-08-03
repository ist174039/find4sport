'use client';
import { Bell, CheckCircle, Clock, FileText, HelpCircle, Image as ImageIcon, Info, LogOut, MapPin, Navigation, PlusCircle, Search, Settings, Trash2, Upload, X, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    category_slug: '',
    capacity: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    price: '',
    location: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.date || !formData.location) {
      alert("Por favor preencha os campos obrigatórios (Título, Data, Localização).")
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
         alert("É necessário ter sessão iniciada para criar eventos.")
         setLoading(false)
         return
      }

      // Check if user is a professional
      const { data: profs } = await supabase.from('professionals').select('id, full_name').eq('user_id', user.id).single()
      
      let category_id = null
      if (formData.category_slug) {
         const { data: cat } = await supabase.from('categories').select('id').eq('slug', formData.category_slug).single()
         if (cat) category_id = cat.id
      }

      const newEvent = {
        title: formData.title,
        description: formData.description,
        address: formData.location,
        start_date: formData.date ? new Date(`${formData.date}T${formData.startTime || '00:00'}`).toISOString() : new Date().toISOString(),
        end_date: (formData.date && formData.endTime) ? new Date(`${formData.date}T${formData.endTime}`).toISOString() : null,
        capacity: parseInt(formData.capacity) || null,
        price_min: parseFloat(formData.price) || 0,
        price_max: parseFloat(formData.price) || 0,
        status: 'pending', // Requires admin approval
        category_id: category_id,
        professional_id: profs?.id || null,
        organizer_name: profs?.full_name || user.user_metadata?.full_name || 'Profissional',
        image_url: 'https://images.unsplash.com/photo-1517649763962-0c623266010b?q=80&w=600',
        created_by: user.id,
        source: 'find4sport'
      }
      
      const { error } = await supabase.from('events').insert(newEvent)
      
      if (error) {
        console.error('Error creating event:', error)
        alert("Erro ao criar evento: " + error.message)
      } else {
        const toast = document.getElementById('toast')
        if (toast) {
          toast.classList.remove('translate-y-24', 'opacity-0')
          setTimeout(() => {
             toast.classList.add('translate-y-24', 'opacity-0')
             router.push('/admin/eventos')
          }, 3000)
        } else {
          router.push('/admin/eventos')
        }
      }
    } catch(err) {
       console.error(err)
       alert("Erro inesperado.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* SideNavBar */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-background dark:bg-foreground border-r border-border dark:border-border flex flex-col py-8 px-4 z-50">
        <div className="mb-10 px-2">
          <h1 className="font-semibold text-xl font-bold text-primary dark:text-primary-fixed-dim tracking-tight">FIND4SPORT</h1>
          <p className="font-medium text-sm text-muted-foreground opacity-70">Painel do Profissional</p>
        </div>

        <button className="mt-4 mb-8 w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg font-medium text-sm hover:bg-primary/10 transition-all flex items-center justify-center gap-2 shadow-sm">
          <PlusCircle className="text-[18px]" />
          Criar Novo Evento
        </button>
        <div className="pt-6 border-t border-border space-y-1">
          <a className="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 ease-in-out text-muted-foreground hover:bg-secondary" href="#">
            <Settings className="h-5 w-5" />
            <span className="font-medium text-sm">Configurações</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 ease-in-out text-muted-foreground hover:bg-destructive/10 hover:text-destructive" href="#">
            <LogOut className="h-5 w-5" />
            <span className="font-medium text-sm">Sair</span>
          </a>
        </div>
      </aside>
      
      {/* Main Content Area */}
      <main className="ml-64 flex flex-col min-h-screen">
        {/* TopAppBar */}
        <header className="sticky top-0 z-40 bg-card border-b border-border h-16 flex justify-between items-center px-12 transition-all duration-200">
          <div className="flex items-center gap-8"></div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 border-r border-border pr-6">
              <button className="relative p-2 text-muted-foreground hover:text-primary transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
              </button>
              <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
                <HelpCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button className="font-medium text-sm text-primary font-bold hover:underline">Ver Perfil Público</button>
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-fixed ring-2 ring-surface">
                <img alt="Avatar do Profissional" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlC9LdaJcj-4CJv6n9bUc2XkccKBuZAcqHx-qw5u-CA347htb6LlBNtuWbG_Qswmp8OnqOzY0Kxs24Ws0JG5LzR2_BclR7Xpaxy0YTCT3aw3H2wn7V6e1fLiKfgS-H9fxO2ZpQQS1G-MdpHBgfUX04IPv-tlJg-9_o0O9FX4G-rvRoG4KBm-OF24LfCGfGPR9F1iNB3YqjG6PGTI1SeuFBcqsLpt5y_ySSWD4XTnaGj5pipzYRd-SsFf18NV2uxRd74QowuRJd" />
              </div>
            </div>
          </div>
        </header>
        
        {/* Form Canvas */}
        <section className="p-12 max-w-[1400px] mx-auto w-full">
          <div className="mb-8">
            <h2 className="font-bold text-2xl text-primary mb-2">Criar Novo Evento Desportivo</h2>
            <p className="text-muted-foreground text-base">Preencha os detalhes abaixo para submeter o seu evento para aprovação.</p>
          </div>
          
          {/* Warning Banner */}
          <div className="bg-amber-500/10 border-l-4 border-amber-500 p-6 rounded-r-xl mb-10 flex items-start gap-4">
            <Info className="text-amber-500 h-5 w-5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-xl text-amber-600 dark:text-amber-500 leading-none mb-2">Informação Importante</h4>
              <p className="text-sm text-amber-700 dark:text-amber-400">Para garantir a qualidade e segurança da nossa comunidade, todos os novos eventos passam por uma revisão manual da nossa equipa de administração. A aprovação ocorre normalmente num prazo de 24 a 48 horas úteis.</p>
            </div>
          </div>
          
          <form className="space-y-10" id="eventForm" onSubmit={handleSubmit}>
            {/* Section 1: Basic Info */}
            <div className="bg-card p-8 rounded-2xl border border-border shadow-sm">
              <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
                <FileText className="text-primary h-5 w-5" />
                <h3 className="font-semibold text-xl">Informações Gerais</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block font-medium text-sm text-muted-foreground mb-2" htmlFor="eventTitle">Título do Evento *</label>
                  <input required value={formData.title} onChange={e => setFormData(p => ({...p, title: e.target.value}))} className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-muted-foreground" id="eventTitle" placeholder="Ex: Maratona da Primavera 2024" type="text" />
                </div>
                <div>
                  <label className="block font-medium text-sm text-muted-foreground mb-2" htmlFor="eventCategory">Categoria</label>
                  <select value={formData.category_slug} onChange={e => setFormData(p => ({...p, category_slug: e.target.value}))} className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all cursor-pointer" id="eventCategory">
                    <option disabled value="">Selecionar Categoria</option>
                    <option value="corrida">Corrida</option>
                    <option value="yoga">Yoga</option>
                    <option value="padel">Padel</option>
                    <option value="crossfit">Crossfit</option>
                    <option value="natacao">Natação</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-sm text-muted-foreground mb-2" htmlFor="eventCapacity">Capacidade Máxima</label>
                  <input value={formData.capacity} onChange={e => setFormData(p => ({...p, capacity: e.target.value}))} className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" id="eventCapacity" placeholder="Número de participantes" type="number" />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-medium text-sm text-muted-foreground mb-2" htmlFor="eventDescription">Descrição Detalhada</label>
                  <textarea value={formData.description} onChange={e => setFormData(p => ({...p, description: e.target.value}))} className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all custom-scrollbar" id="eventDescription" placeholder="Descreva os objetivos, percurso, requisitos e o que está incluído..." rows={5}></textarea>
                </div>
              </div>
            </div>

            {/* Section 2: Image Upload */}
            <div className="bg-card p-8 rounded-2xl border border-border shadow-sm">
              <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
                <ImageIcon className="text-primary h-5 w-5" />
                <h3 className="font-semibold text-xl">Imagem de Capa</h3>
              </div>
              <div className="relative border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center justify-center bg-background hover:bg-primary/5 transition-colors group cursor-pointer overflow-hidden">
                <input accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" id="coverUpload" type="file" />
                <div className="text-center group-hover:scale-105 transition-transform">
                  <Upload className="text-4xl text-muted-foreground group-hover:text-primary mb-3 h-5 w-5 mx-auto" />
                  <p className="font-medium text-sm text-muted-foreground">Arraste uma imagem ou clique para carregar</p>
                  <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">PNG, JPG até 5MB</p>
                </div>
              </div>
            </div>

            {/* Section 3: Time & Location */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-card p-8 rounded-2xl border border-border shadow-sm flex flex-col">
                <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
                  <Clock className="text-primary h-5 w-5" />
                  <h3 className="font-semibold text-xl">Data e Hora</h3>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block font-medium text-sm text-muted-foreground mb-2" htmlFor="eventDate">Data do Evento *</label>
                    <input required value={formData.date} onChange={e => setFormData(p => ({...p, date: e.target.value}))} className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary outline-none" id="eventDate" type="date" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium text-sm text-muted-foreground mb-2" htmlFor="startTime">Hora de Início</label>
                      <input value={formData.startTime} onChange={e => setFormData(p => ({...p, startTime: e.target.value}))} className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary outline-none" id="startTime" type="time" />
                    </div>
                    <div>
                      <label className="block font-medium text-sm text-muted-foreground mb-2" htmlFor="endTime">Hora de Fim (Opcional)</label>
                      <input value={formData.endTime} onChange={e => setFormData(p => ({...p, endTime: e.target.value}))} className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary outline-none" id="endTime" type="time" />
                    </div>
                  </div>
                  <div className="pt-4 mt-auto">
                    <label className="block font-medium text-sm text-muted-foreground mb-2" htmlFor="eventPrice">Preço de Inscrição (€)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-primary">€</span>
                      <input value={formData.price} onChange={e => setFormData(p => ({...p, price: e.target.value}))} className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-primary outline-none" id="eventPrice" placeholder="0.00" step="0.01" type="number" />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 italic">Deixe em branco ou zero para eventos gratuitos.</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-card p-8 rounded-2xl border border-border shadow-sm">
                <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
                  <MapPin className="text-primary h-5 w-5" />
                  <h3 className="font-semibold text-xl">Localização</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block font-medium text-sm text-muted-foreground mb-2" htmlFor="eventLocation">Local do Evento *</label>
                    <div className="relative">
                      <input required value={formData.location} onChange={e => setFormData(p => ({...p, location: e.target.value}))} className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-primary outline-none" id="eventLocation" placeholder="Rua, Parque, Estádio ou Cidade" type="text" />
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    </div>
                  </div>
                  {/* Map Suggestion UI */}
                  <div className="w-full h-48 rounded-xl overflow-hidden border border-border relative group">
                    <img alt="Mapa de localização" className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvRG13QQ8kUHrgz4a-TO639X3RDFuZCz8VYkx6sRk5TN-aV4E_0dFCXdaQBQbiWRZ9_8AUusXFFmW5QhGEPzMtfl34eVRgsMPO2tDV6KdYj_iCPrvhMotdrrjWypXSd8JAFxymyEKsJ6-bDm1fjwIkH57IjHdF3mCgZjvzTPpf-56ObGkJ_gErB4L425KXzVPFOi7yOiXvs0d-3QtvH_c8petOSS2vx-4FR6TOaDs26OdAZ8Mj_gd-trfCnAfDNiWi3O-ezf7t" />
                    <div className="absolute inset-0 bg-black/5 flex items-center justify-center pointer-events-none group-hover:bg-transparent transition-all">
                      <div className="bg-white/90 px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                        <Navigation className="text-primary h-5 w-5" />
                        <span className="text-xs font-semibold text-foreground">Confirmar Localização</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-10 border-t border-border">
              <button className="text-muted-foreground hover:text-destructive transition-colors font-medium text-sm flex items-center gap-2" type="button" onClick={() => router.back()}>
                <X className="h-5 w-5" />
                Cancelar e Descartar
              </button>
              <div className="flex gap-4 w-full md:w-auto">
                <button className="flex-1 md:flex-none border border-primary text-primary px-8 py-3 rounded-xl font-medium text-sm hover:bg-primary/10 transition-colors" type="button">
                  Guardar Rascunho
                </button>
                <button disabled={loading} className="flex-1 md:flex-none bg-primary text-primary-foreground px-10 py-3 rounded-xl font-semibold text-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center" type="submit">
                  {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  Submeter para Revisão
                </button>
              </div>
            </div>
          </form>
        </section>
      </main>
      
      {/* Floating Toast for UI Feedback */}
      <div className="fixed bottom-8 right-8 bg-foreground text-background px-6 py-4 rounded-xl shadow-2xl translate-y-24 opacity-0 transition-all duration-300 flex items-center gap-3 z-[60]" id="toast">
        <CheckCircle className="text-emerald-500 h-5 w-5" />
        <span className="text-sm font-medium" id="toastMessage">Evento submetido com sucesso!</span>
      </div>
    </>
  )
}

