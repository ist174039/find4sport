import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Building2, Camera, ExternalLink, MapPin, UserRound } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { resolveSessionAccess } from '@/lib/auth/access'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DashboardPage, DashboardPageHeader, DashboardSection } from '@/components/patterns/dashboard-page'
import { updateProfileAction, uploadAvatarAction, uploadBannerAction } from './actions'
import { QualificationsManager } from '@/components/dashboard/qualifications-manager'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/dashboard/perfil')
  const access = await resolveSessionAccess(supabase, user)
  if (!access?.role) redirect('/auth/login')

  const [{ data: platformUser }, { data: categories }] = await Promise.all([
    supabase.from('platform_users').select('id, full_name, avatar_url, banner_url, location, language').eq('id', user.id).maybeSingle(),
    access.role === 'professional' ? supabase.from('categories').select('id, name, emoji').order('name') : Promise.resolve({ data: [] as any[] }),
  ])

  let professional: any = null
  let selectedCategoryIds: string[] = []
  if (access.role === 'professional') {
    const { data } = await supabase.from('professionals').select('*, professional_categories(category_id)').eq('user_id', user.id).maybeSingle()
    professional = data
    selectedCategoryIds = (data?.professional_categories || []).map((row: any) => row.category_id)
  }

  const avatarUrl = professional?.avatar_url || platformUser?.avatar_url || user.user_metadata?.avatar_url || null
  const bannerUrl = professional?.cover_url || platformUser?.banner_url || null
  const publicProfileHref = access.role === 'professional' && professional ? `/profissionais/${professional.public_slug || professional.id}` : access.role === 'venue_manager' ? '/dashboard/espaco' : null

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="O Meu Perfil"
        description={access.role === 'professional' ? 'Identidade pessoal e informação pública do seu perfil profissional.' : access.role === 'venue_manager' ? 'Dados pessoais da conta. A informação comercial do espaço é gerida em “O Meu Espaço”.' : 'Dados pessoais da sua conta Find4Sport.'}
        action={publicProfileHref ? <Button asChild variant="outline" className="min-h-11"><Link href={publicProfileHref} target={access.role === 'professional' ? '_blank' : undefined}>{access.role === 'professional' ? 'Ver perfil público' : 'Gerir espaço'}<ExternalLink className="ml-2 h-4 w-4" /></Link></Button> : undefined}
      />

      <DashboardSection title="Imagem e capa" description="JPEG, PNG ou WebP até 5 MB. Os ficheiros são guardados no Storage; a base de dados guarda apenas os URLs.">
        <div className="grid gap-5 md:grid-cols-[180px_1fr]">
          <div className="space-y-3">
            <div className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-border bg-primary/10 text-3xl font-bold text-primary md:mx-0">{avatarUrl ? <img src={avatarUrl} alt="Foto de perfil" className="h-full w-full object-cover" /> : (platformUser?.full_name || 'U').charAt(0)}</div>
            <form action={uploadAvatarAction} className="space-y-2"><Input type="file" name="file" accept="image/jpeg,image/png,image/webp" required className="min-h-11 text-base" /><Button type="submit" variant="outline" className="min-h-11 w-full"><Camera className="mr-2 h-4 w-4" />Atualizar foto</Button></form>
          </div>
          <div className="space-y-3">
            <div className="aspect-[3/1] min-h-32 overflow-hidden rounded-2xl border border-border bg-muted">{bannerUrl ? <img src={bannerUrl} alt="Capa" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Sem imagem de capa</div>}</div>
            <form action={uploadBannerAction} className="grid gap-2 sm:grid-cols-[1fr_auto]"><Input type="file" name="file" accept="image/jpeg,image/png,image/webp" required className="min-h-11 text-base" /><Button type="submit" variant="outline" className="min-h-11">Atualizar capa</Button></form>
          </div>
        </div>
      </DashboardSection>

      <DashboardSection title="Informação do perfil" description="A informação é guardada no servidor e sincronizada com a identidade da conta.">
        <form action={updateProfileAction} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="full_name">Nome *</Label><Input id="full_name" name="full_name" defaultValue={professional?.full_name || platformUser?.full_name || user.user_metadata?.full_name || ''} required className="min-h-11 text-base" /></div>
            <div className="space-y-2"><Label>Email</Label><Input value={user.email || ''} disabled className="min-h-11 text-base" /><p className="text-xs text-muted-foreground">O email de autenticação não é alterado nesta página.</p></div>
            <div className="space-y-2"><Label htmlFor="phone">Telefone</Label><Input id="phone" name="phone" defaultValue={professional?.phone || user.user_metadata?.phone || ''} className="min-h-11 text-base" autoComplete="tel" /></div>
            <div className="space-y-2"><Label htmlFor="location">Localização</Label><Input id="location" name="location" defaultValue={platformUser?.location || ''} className="min-h-11 text-base" /></div>
            <div className="space-y-2"><Label htmlFor="language">Idioma</Label><select id="language" name="language" defaultValue={platformUser?.language || 'pt'} className="min-h-11 w-full rounded-lg border border-input bg-background px-3 text-base"><option value="pt">Português</option><option value="en">English</option><option value="fr">Français</option></select></div>
            <div className="space-y-2"><Label htmlFor="nif">NIF</Label><Input id="nif" name="nif" defaultValue={professional?.nif || user.user_metadata?.nif || ''} className="min-h-11 text-base" inputMode="numeric" /></div>
          </div>

          {access.role === 'professional' && professional && <>
            <div className="border-t border-border pt-5"><h3 className="font-semibold">Perfil profissional</h3><p className="mt-1 text-sm text-muted-foreground">Dados apresentados aos clientes na página pública.</p></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="professional_name">Nome profissional</Label><Input id="professional_name" name="professional_name" defaultValue={professional.professional_name || ''} className="min-h-11 text-base" /></div>
              <div className="space-y-2"><Label htmlFor="service_radius_km">Raio de serviço (km)</Label><Input id="service_radius_km" name="service_radius_km" type="number" min="1" max="200" defaultValue={professional.service_radius_km || 10} className="min-h-11 text-base" /></div>
              <div className="space-y-2"><Label htmlFor="whatsapp">WhatsApp</Label><Input id="whatsapp" name="whatsapp" defaultValue={professional.whatsapp || ''} className="min-h-11 text-base" /></div>
              <div className="space-y-2"><Label htmlFor="website">Website</Label><Input id="website" name="website" type="url" defaultValue={professional.website || ''} className="min-h-11 text-base" /></div>
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="address">Morada / zona de atendimento</Label><Input id="address" name="address" defaultValue={professional.address || ''} className="min-h-11 text-base" /></div>
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="bio">Biografia</Label><Textarea id="bio" name="bio" defaultValue={professional.bio || ''} className="min-h-36 text-base" maxLength={3000} /></div>
            </div>

            {(categories || []).length > 0 && <div className="space-y-2"><Label>Modalidades</Label><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{(categories || []).map((category: any) => <label key={category.id} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-border px-3 py-2 text-sm"><input type="checkbox" name="category_ids" value={category.id} defaultChecked={selectedCategoryIds.includes(category.id)} className="h-5 w-5" /><span>{category.emoji ? `${category.emoji} ` : ''}{category.name}</span></label>)}</div></div>}
          </>}

          {access.role === 'venue_manager' && <div className="rounded-2xl border border-border bg-muted/30 p-4"><div className="flex items-start gap-3"><Building2 className="mt-0.5 h-5 w-5 text-primary" /><div><p className="font-semibold">Informação do espaço separada</p><p className="mt-1 text-sm text-muted-foreground">Nome, descrição, contactos, comodidades, morada e instalações são geridos em “O Meu Espaço”, evitando misturar identidade pessoal e entidade comercial.</p><Button asChild variant="link" className="mt-2 h-auto p-0"><Link href="/dashboard/espaco">Gerir o meu espaço</Link></Button></div></div></div>}

          <Button type="submit" className="min-h-11 w-full sm:w-auto"><UserRound className="mr-2 h-4 w-4" />Guardar perfil</Button>
        </form>
      </DashboardSection>

      {access.role === 'professional' && professional && <DashboardSection title="Qualificações" description="Certificações e formação associadas ao perfil profissional."><QualificationsManager professionalId={professional.id} /></DashboardSection>}
    </DashboardPage>
  )
}
