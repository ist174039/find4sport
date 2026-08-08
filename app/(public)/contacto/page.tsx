'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2, Clock, Globe, Loader2, Mail, MapPin, Share2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [cmsData, setCmsData] = useState<any>(null)
  
  useEffect(() => {
    async function loadCms() {
      const supabase = createClient()
      const { data } = await supabase.from('cms_pages').select('*').eq('slug', 'contacto').single()
      if (data) setCmsData(data)
    }
    loadCms()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const fullName = formData.get('fullName') as string
    const email = formData.get('email') as string
    const subject = formData.get('subject') as string
    const message = formData.get('message') as string

    try {
      const supabase = createClient()
      const { error: dbError } = await supabase.from('contact_messages').insert({
        full_name: fullName,
        email: email,
        subject: subject,
        message: message
      })

      if (dbError) throw dbError

      setIsSuccess(true)
      e.currentTarget.reset()
    } catch (err) {
      console.error(err)
      setError('Ocorreu um erro ao enviar a mensagem. Tente novamente mais tarde.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-background">
      <main className="flex-1 py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {cmsData?.title || 'Contactos — FIND4SPORT'}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl whitespace-pre-wrap">
              {cmsData?.content?.body || 'Estamos aqui para ajudar a impulsionar a sua performance desportiva. Entre em contacto connosco para dúvidas, parcerias ou suporte.'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Side: Enviar Mensagem Form */}
            <section className="lg:col-span-7 bg-card p-6 md:p-10 rounded-2xl border border-border shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-8">Enviar Mensagem</h2>
              
              {isSuccess ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-8 rounded-xl text-center space-y-4">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <div>
                    <h3 className="text-lg font-bold">Mensagem enviada com sucesso!</h3>
                    <p className="text-sm mt-1">Obrigado pelo seu contacto. Iremos responder o mais breve possível.</p>
                  </div>
                  <button 
                    onClick={() => setIsSuccess(false)}
                    className="mt-6 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
                  >
                    Enviar nova mensagem
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="fullName">Nome Completo</Label>
                      <Input 
                        id="fullName"
                        name="fullName"
                        required
                        placeholder="Ex: João Silva" 
                        type="text"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input 
                        id="email"
                        name="email"
                        required
                        placeholder="joao@exemplo.pt" 
                        type="email"
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="subject">Assunto</Label>
                    <select 
                      id="subject"
                      name="subject"
                      required
                      className="h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="Suporte Técnico">Suporte Técnico</option>
                      <option value="Dúvidas sobre Subscrição">Dúvidas sobre Subscrição</option>
                      <option value="Parcerias Comerciais">Parcerias Comerciais</option>
                      <option value="Feedback e Sugestões">Feedback e Sugestões</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="message">Mensagem</Label>
                    <Textarea 
                      id="message"
                      name="message"
                      required
                      placeholder="Como podemos ajudar?" 
                      rows={5}
                    />
                  </div>
                  
                  {error && (
                    <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                      {error}
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full h-11"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        A enviar mensagem...
                      </>
                    ) : (
                      'Enviar Mensagem'
                    )}
                  </Button>
                </form>
              )}
            </section>
            
            {/* Right Side: Suporte Direto Card */}
            <aside className="lg:col-span-5 space-y-8">
              <div className="bg-primary text-primary-foreground p-8 rounded-2xl shadow-lg relative overflow-hidden">
                {/* Decorative element */}
                <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <h2 className="text-2xl font-bold mb-8 relative z-10">Suporte Direto</h2>
                
                <div className="space-y-6 relative z-10">
                  <div className="flex items-start gap-4">
                    <Mail className="bg-white/20 p-2 rounded-xl backdrop-blur-sm h-5 w-5" />
                    <div>
                      <p className="text-xs font-bold opacity-80 uppercase tracking-wider mb-1">Email</p>
                      <p className="font-medium">ajuda@find4sport.pt</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <MapPin className="bg-white/20 p-2 rounded-xl backdrop-blur-sm h-5 w-5" />
                    <div>
                      <p className="text-xs font-bold opacity-80 uppercase tracking-wider mb-1">Morada</p>
                      <p className="font-medium">Avenida da Liberdade, 110<br/>1269-046 Lisboa, Portugal</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Clock className="bg-white/20 p-2 rounded-xl backdrop-blur-sm h-5 w-5" />
                    <div>
                      <p className="text-xs font-bold opacity-80 uppercase tracking-wider mb-1">Horário</p>
                      <p className="font-medium">Segunda – Sexta: 09:00 – 19:00<br/>Sábado: 10:00 – 14:00</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-10 pt-6 border-t border-white/20 flex gap-4 relative z-10">
                  <a className="bg-white text-primary w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors shadow-sm" href="#">
                    <Share2 className="text-[20px]" />
                  </a>
                  <a className="bg-white text-primary w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors shadow-sm" href="#">
                    <Users className="text-[20px]" />
                  </a>
                  <a className="bg-white text-primary w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors shadow-sm" href="#">
                    <Globe className="text-[20px]" />
                  </a>
                </div>
              </div>
              
              {/* Small Map Graphic */}
              <div className="rounded-2xl overflow-hidden border border-border h-[240px] relative group shadow-sm bg-muted">
                <img 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  alt="Lisboa, Portugal" 
                  src="https://images.unsplash.com/photo-1555881400-74d7acaacd8b?q=80&w=1470&auto=format&fit=crop"
                />
                <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-colors"></div>
                <div className="absolute bottom-4 left-4 bg-background px-4 py-2 rounded-xl shadow-md flex items-center gap-2">
                  <MapPin className="text-primary text-[20px]" />
                  <span className="text-sm font-semibold text-foreground">Lisboa, Portugal</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  )
}
