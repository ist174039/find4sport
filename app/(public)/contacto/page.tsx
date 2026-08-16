import { notFound } from 'next/navigation'
import { MessageSquareText } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ContactForm } from '@/components/contact-form'
import { NormalizedContentPage } from '@/components/cms/normalized-page'

export default async function ContactPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('cms_pages')
    .select('title, description, content, is_published')
    .eq('slug', 'contacto')
    .maybeSingle()

  if (!data?.is_published) notFound()

  return (
    <div className="min-h-screen bg-background">
      <NormalizedContentPage
        title={data.title || 'Contacto'}
        description={data.description || undefined}
        content={data.content}
        loading={false}
        backUrl="/"
        backText="Voltar ao início"
      />

      <section className="mx-auto -mt-12 max-w-4xl px-4 pb-20 sm:px-6">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6 md:p-8">
          <div className="mb-6 flex items-start gap-3">
            <div className="rounded-xl bg-primary/10 p-3 text-primary"><MessageSquareText className="h-5 w-5" /></div>
            <div><h2 className="text-xl font-bold">Enviar mensagem</h2><p className="mt-1 text-sm text-muted-foreground">Use este formulário para suporte, faturação, parcerias, privacidade ou feedback.</p></div>
          </div>
          <ContactForm />
        </div>
      </section>
    </div>
  )
}
