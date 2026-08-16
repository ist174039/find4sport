import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, Camera, Globe, Lock, MessageSquare, ShieldCheck, Trash2, UserMinus, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess } from '@/lib/auth/access'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { TaxonomyFormField } from '@/components/taxonomy-form-field'
import type { TaxonomyOption } from '@/components/taxonomy-combobox'
import { DashboardEmptyState, DashboardPage, DashboardPageHeader, DashboardSection, DashboardStat, DashboardStatGrid } from '@/components/patterns/dashboard-page'
import { reviewCommunityJoinRequestAction } from '@/app/actions/community'
import { deleteCommunityMediaAction, deleteCommunityPostAction, removeCommunityMemberAction, updateCommunityAction, uploadCommunityMediaAction } from '../actions'

export default async function ManageCommunityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/auth/login?redirect=/dashboard/comunidades/${id}`)
  const access = await resolveSessionAccess(supabase, user)
  if (access?.role !== 'professional') redirect('/dashboard')

  const { data: membership } = await supabase.from('community_members').select('id, role').eq('community_id', id).eq('user_id', user.id).eq('role', 'admin').maybeSingle()
  if (!membership) notFound()

  const [communityResult, membersResult, postsResult, requestsResult, mediaResult, categoriesResult] = await Promise.all([
    supabase.from('communities').select('*').eq('id', id).maybeSingle(),
    supabase.from('community_members').select('id, user_id, role, joined_at, platform_users(id, full_name, avatar_url, type)').eq('community_id', id).order('joined_at', { ascending: true }),
    supabase.from('posts').select('id, content, media_url, media_type, created_at, professional_id, sport_space_id').eq('community_id', id).order('created_at', { ascending: false }).limit(50),
    supabase.from('community_join_requests').select('id, user_id, status, created_at, platform_users:user_id(full_name, avatar_url)').eq('community_id', id).eq('status', 'pending').order('created_at', { ascending: true }),
    supabase.from('community_media').select('id, storage_path, caption, is_featured, created_at').eq('community_id', id).order('created_at', { ascending: false }),
    supabase.from('categories').select('*').order('name'),
  ])

  const community = communityResult.data
  if (!community) notFound()
  const members = membersResult.data || []
  const posts = postsResult.data || []
  const requests = requestsResult.data || []
  const media = mediaResult.data || []
  const categories: TaxonomyOption[] = (categoriesResult.data || []).map(row => {
    const candidate = row as unknown as Record<string, unknown>
    return { id: String(candidate.id), name: String(candidate.name || ''), slug: String(candidate.slug || ''), emoji: typeof candidate.emoji === 'string' ? candidate.emoji : null, parent_id: typeof candidate.parent_id === 'string' ? candidate.parent_id : null }
  })
  const currentCategoryId = categories.find(category => category.name.toLocaleLowerCase('pt-PT') === String(community.sport_category || '').toLocaleLowerCase('pt-PT') || category.slug.toLocaleLowerCase('pt-PT') === String(community.sport_category || '').toLocaleLowerCase('pt-PT'))?.id || ''

  const admin = createAdminClient()
  const mediaWithUrls = await Promise.all(media.map(async (item: any) => {
    const { data } = await admin.storage.from('community-media').createSignedUrl(item.storage_path, 3600)
    return { ...item, signedUrl: data?.signedUrl || null }
  }))

  return <DashboardPage>
    <DashboardPageHeader title={community.name} description="Gere informação, pedidos de adesão, membros, publicações e galeria da comunidade." action={<div className="flex gap-2"><Button asChild variant="outline"><Link href="/dashboard/comunidades"><ArrowLeft className="mr-2 h-4 w-4" />Comunidades</Link></Button><Button asChild><Link href={`/comunidades/${community.slug || community.id}`}>Ver página pública</Link></Button></div>} />

    <DashboardStatGrid><DashboardStat label="Membros" value={members.length} icon={<Users className="h-5 w-5" />} /><DashboardStat label="Pedidos" value={requests.length} icon={<ShieldCheck className="h-5 w-5" />} /><DashboardStat label="Publicações" value={posts.length} icon={<MessageSquare className="h-5 w-5" />} /><DashboardStat label="Imagens" value={media.length} icon={<Camera className="h-5 w-5" />} /></DashboardStatGrid>

    <DashboardSection title="Informação pública" description="Tudo o que for guardado aqui aparece na página pública da comunidade.">
      <form action={updateCommunityAction.bind(null, community.id)} className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="name">Nome</Label><Input id="name" name="name" defaultValue={community.name || ''} className="min-h-11 text-base" required /></div><div className="relative z-20 space-y-2"><Label>Modalidade / tema</Label><TaxonomyFormField name="category_id" options={categories} defaultValue={currentCategoryId} required placeholder="Pesquisar modalidade" /></div></div>
        <div className="space-y-2"><Label htmlFor="description">Descrição</Label><Textarea id="description" name="description" defaultValue={community.description || ''} className="min-h-32 text-base" /></div>
        <label className="flex min-h-14 items-center justify-between gap-4 rounded-xl border border-border p-3"><div><p className="flex items-center gap-2 text-sm font-semibold">{community.is_private ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />}Comunidade privada</p><p className="text-xs text-muted-foreground">Quando ativa, novos membros precisam de aprovação.</p></div><input type="checkbox" name="is_private" defaultChecked={Boolean(community.is_private)} className="h-5 w-5" /></label>
        <div><Button type="submit" className="min-h-11 w-full sm:w-auto">Guardar informação</Button></div>
      </form>
    </DashboardSection>

    <DashboardSection title="Pedidos de adesão" description="Aprove ou recuse pedidos de entrada em comunidades privadas.">{requests.length === 0 ? <DashboardEmptyState icon={<ShieldCheck className="h-10 w-10" />} title="Sem pedidos pendentes" description="Novos pedidos aparecerão aqui." /> : <div className="divide-y divide-border">{requests.map((request: any) => <div key={request.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-bold text-primary">{request.platform_users?.avatar_url ? <img src={request.platform_users.avatar_url} alt="" className="h-full w-full object-cover" /> : request.platform_users?.full_name?.charAt(0) || 'U'}</div><div><p className="text-sm font-semibold">{request.platform_users?.full_name || 'Utilizador'}</p><p className="text-xs text-muted-foreground">{new Date(request.created_at).toLocaleDateString('pt-PT')}</p></div></div><div className="grid grid-cols-2 gap-2 sm:flex"><form action={reviewCommunityJoinRequestAction.bind(null, request.id, 'reject')}><Button type="submit" variant="outline" className="min-h-11 w-full">Recusar</Button></form><form action={reviewCommunityJoinRequestAction.bind(null, request.id, 'approve')}><Button type="submit" className="min-h-11 w-full">Aprovar</Button></form></div></div>)}</div>}</DashboardSection>

    <DashboardSection title="Membros" description="A administração da comunidade mantém controlo sobre os membros ativos."><div className="grid gap-3 md:grid-cols-2">{members.map((member: any) => <article key={member.id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"><div className="flex min-w-0 items-center gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-bold text-primary">{member.platform_users?.avatar_url ? <img src={member.platform_users.avatar_url} alt="" className="h-full w-full object-cover" /> : member.platform_users?.full_name?.charAt(0) || 'U'}</div><div className="min-w-0"><p className="truncate text-sm font-semibold">{member.platform_users?.full_name || 'Utilizador'}</p><p className="text-xs text-muted-foreground">{member.role === 'admin' ? 'Administrador' : 'Membro'}</p></div></div>{member.user_id !== user.id && <form action={removeCommunityMemberAction.bind(null, community.id, member.user_id)}><Button type="submit" variant="ghost" size="icon" className="h-11 w-11 text-destructive" aria-label="Remover membro"><UserMinus className="h-4 w-4" /></Button></form>}</article>)}</div></DashboardSection>

    <DashboardSection title="Publicações" description="Modere apenas o feed desta comunidade, sem misturar esta área com a moderação global da plataforma.">{posts.length === 0 ? <DashboardEmptyState icon={<MessageSquare className="h-10 w-10" />} title="Sem publicações" description="As publicações criadas na comunidade aparecerão aqui." /> : <div className="space-y-3">{posts.map((post: any) => <article key={post.id} className="flex items-start justify-between gap-4 rounded-xl border border-border p-4"><div className="min-w-0"><p className="line-clamp-3 whitespace-pre-line text-sm">{post.content || 'Publicação com media'}</p><p className="mt-2 text-xs text-muted-foreground">{new Date(post.created_at).toLocaleString('pt-PT')}</p></div><form action={deleteCommunityPostAction.bind(null, community.id, post.id)}><Button type="submit" variant="ghost" size="icon" className="h-11 w-11 shrink-0 text-destructive" aria-label="Eliminar publicação"><Trash2 className="h-4 w-4" /></Button></form></article>)}</div>}</DashboardSection>

    <DashboardSection title="Media" description="Galeria própria da comunidade. Imagens não são guardadas na base de dados; ficam no Supabase Storage.">
      <form action={uploadCommunityMediaAction.bind(null, community.id)} className="grid gap-3 rounded-xl border border-dashed border-border p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end" encType="multipart/form-data"><div className="space-y-2"><Label htmlFor="file">Imagem</Label><Input id="file" name="file" type="file" accept="image/jpeg,image/png,image/webp" className="min-h-11 text-base" required /></div><div className="space-y-2"><Label htmlFor="caption">Legenda</Label><Input id="caption" name="caption" className="min-h-11 text-base" /></div><Button type="submit" className="min-h-11">Adicionar</Button></form>
      {mediaWithUrls.length === 0 ? <div className="mt-4"><DashboardEmptyState icon={<Camera className="h-10 w-10" />} title="Galeria vazia" description="Adicione imagens da comunidade de forma organizada." /></div> : <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{mediaWithUrls.map((item: any) => <figure key={item.id} className="overflow-hidden rounded-xl border border-border bg-card"><div className="aspect-square bg-muted">{item.signedUrl ? <img src={item.signedUrl} alt={item.caption || ''} className="h-full w-full object-cover" /> : null}</div><figcaption className="flex items-center justify-between gap-2 p-2"><span className="min-w-0 truncate text-xs text-muted-foreground">{item.caption || 'Sem legenda'}</span><form action={deleteCommunityMediaAction.bind(null, community.id, item.id)}><Button type="submit" variant="ghost" size="icon" className="h-10 w-10 text-destructive" aria-label="Eliminar imagem"><Trash2 className="h-4 w-4" /></Button></form></figcaption></figure>)}</div>}
    </DashboardSection>
  </DashboardPage>
}
