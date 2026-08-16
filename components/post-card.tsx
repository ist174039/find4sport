'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BadgeCheck, Building2, Flag, Globe, Heart, Loader2, MapPin, MessageSquare, MoreVertical, Share2, User } from 'lucide-react'
import { addCommentAction, reportPostAction, toggleLikeAction } from '@/app/actions/feed'
import { useModal } from '@/components/providers/modal-provider'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { UserAvatar } from '@/components/user-avatar'
import { createClient } from '@/lib/supabase/client'
import { normalizePlatformRole } from '@/lib/auth/roles'

const resolveUserLink = (u: any) => {
  if (!u) return '#'
  const role = normalizePlatformRole(u.type)
  if (role === 'professional') return `/profissionais/${u.professionals?.[0]?.public_slug || u.id}`
  if (role === 'venue_manager') return `/espacos/${u.sport_spaces?.[0]?.slug || u.id}`
  return `/utilizadores/${u.id}`
}

const resolveUserInfo = (u: any) => {
  const role = normalizePlatformRole(u?.type)
  let name = u?.full_name || 'Utilizador'
  let avatar = u?.avatar_url || null

  if (role === 'professional') {
    name = u?.professionals?.[0]?.full_name || name
    avatar = u?.professionals?.[0]?.avatar_url || avatar
  } else if (role === 'venue_manager') {
    name = u?.sport_spaces?.[0]?.name || name
    avatar = u?.sport_spaces?.[0]?.logo_url || avatar
  }

  return { name, avatar }
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const renderPostContent = (value: string) =>
  escapeHtml(value).replace(/#([\wÀ-ÿ]+)/g, (_, tag: string) => {
    const encodedTag = encodeURIComponent(tag)
    return `<a href="/pesquisa?q=${encodedTag}" class="text-primary font-semibold hover:underline">#${tag}</a>`
  })

export default function PostCard({ post, initialIsLiked = false, isAuthenticated = false }: {
  post: any
  initialIsLiked?: boolean
  isAuthenticated?: boolean
}) {
  const { showAlert } = useModal()
  const [likesCount, setLikesCount] = useState(post.likes?.[0]?.count || 0)
  const [commentsCount, setCommentsCount] = useState(post.comments?.[0]?.count || 0)
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [liking, setLiking] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [loadingComments, setLoadingComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [commenting, setCommenting] = useState(false)
  const [commentsList, setCommentsList] = useState<any[]>([])
  const [showLikesModal, setShowLikesModal] = useState(false)
  const [likesList, setLikesList] = useState<any[]>([])
  const [loadingLikes, setLoadingLikes] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState<'spam' | 'harassment' | 'hate' | 'nudity' | 'violence' | 'fraud' | 'other'>('spam')
  const [reportDetails, setReportDetails] = useState('')
  const [reporting, setReporting] = useState(false)

  const authorName = post.professional_id
    ? post.professionals?.full_name
    : post.sport_space_id
      ? post.sport_spaces?.name
      : post.platform_users?.full_name || 'Utilizador'

  const authorAvatar = post.professional_id
    ? post.professionals?.avatar_url
    : post.sport_space_id
      ? post.sport_spaces?.logo_url
      : post.platform_users?.avatar_url

  const authorType = post.professional_id ? 'PRO' : post.sport_space_id ? 'ESPAÇO' : 'MEMBRO'
  const authorSlug = post.professional_id
    ? (post.professionals?.public_slug || post.professional_id)
    : post.sport_space_id
      ? (post.sport_spaces?.slug || post.sport_space_id)
      : null
  const authorLink = authorSlug
    ? (post.professional_id ? `/profissionais/${authorSlug}` : `/espacos/${authorSlug}`)
    : post.platform_users?.id ? `/utilizadores/${post.platform_users.id}` : '#'

  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR })
  const postUrl = typeof window !== 'undefined' ? `${window.location.origin}/feed#post-${post.id}` : ''

  const guardAuth = () => {
    if (!isAuthenticated) {
      showAlert('Inicia sessão', 'Precisas de iniciar sessão para interagir com publicações.', 'info')
      return false
    }
    return true
  }

  const handleLike = async () => {
    if (!guardAuth() || liking) return
    setLiking(true)
    const previous = isLiked
    const next = !previous
    setIsLiked(next)
    setLikesCount((value: number) => Math.max(0, value + (next ? 1 : -1)))

    try {
      const result = await toggleLikeAction(post.id)
      if (result.liked !== next) {
        setIsLiked(result.liked)
        setLikesCount((value: number) => Math.max(0, value + (result.liked ? 1 : -1)))
      }
    } catch {
      setIsLiked(previous)
      setLikesCount((value: number) => Math.max(0, value + (previous ? 1 : -1)))
      showAlert('Erro', 'Não foi possível atualizar o gosto.', 'error')
    } finally {
      setLiking(false)
    }
  }

  const handleShare = async () => {
    if (!postUrl) return
    try {
      if (navigator.share) await navigator.share({ title: `Publicação de ${authorName} - FIND4SPORT`, url: postUrl })
      else {
        await navigator.clipboard.writeText(postUrl)
        showAlert('Link copiado', 'O link da publicação foi copiado.', 'success')
      }
    } catch (error: any) {
      if (error?.name !== 'AbortError') showAlert('Erro', 'Não foi possível partilhar a publicação.', 'error')
    }
  }

  const handleCopyLink = async () => {
    if (!postUrl) return
    try {
      await navigator.clipboard.writeText(postUrl)
      showAlert('Link copiado', 'O link da publicação foi copiado.', 'success')
    } catch {
      showAlert('Erro', 'Não foi possível copiar o link.', 'error')
    }
  }

  const submitReport = async () => {
    if (!guardAuth() || reporting) return
    setReporting(true)
    try {
      const result = await reportPostAction(post.id, reportReason, reportDetails)
      setShowReportModal(false)
      setReportDetails('')
      showAlert(
        result.duplicate ? 'Denúncia já registada' : 'Denúncia enviada',
        result.duplicate ? 'Já tinhas denunciado esta publicação. A denúncia existente continua em análise.' : 'A publicação foi enviada para moderação.',
        'success',
      )
    } catch (error: any) {
      showAlert('Erro', error?.message || 'Não foi possível enviar a denúncia.', 'error')
    } finally {
      setReporting(false)
    }
  }

  const fetchComments = async () => {
    setLoadingComments(true)
    try {
      const supabase = createClient()
      const { data: commentsData, error } = await supabase
        .from('post_comments').select('*').eq('post_id', post.id).order('created_at', { ascending: true })
      if (error) throw error

      if (!commentsData?.length) {
        setCommentsList([])
        return
      }

      const userIds = [...new Set(commentsData.map((c: any) => c.user_id))]
      const { data: usersData } = await supabase
        .from('platform_users')
        .select('id, full_name, avatar_url, type, professionals (public_slug, full_name, avatar_url), sport_spaces (slug, name, logo_url)')
        .in('id', userIds)

      setCommentsList(commentsData.map((comment: any) => ({
        ...comment,
        platform_users: usersData?.find((u: any) => u.id === comment.user_id) || null,
      })))
    } catch (error) {
      console.error('Error fetching comments:', error)
      showAlert('Erro', 'Não foi possível carregar os comentários.', 'error')
    } finally {
      setLoadingComments(false)
    }
  }

  const fetchLikesList = async () => {
    setLoadingLikes(true)
    try {
      const supabase = createClient()
      const { data: likesData, error } = await supabase.from('post_likes').select('id, user_id').eq('post_id', post.id)
      if (error) throw error
      if (!likesData?.length) {
        setLikesList([])
        return
      }

      const userIds = [...new Set(likesData.map((l: any) => l.user_id))]
      const { data: usersData } = await supabase
        .from('platform_users')
        .select('id, full_name, avatar_url, type, professionals (public_slug, full_name, avatar_url), sport_spaces (slug, name, logo_url)')
        .in('id', userIds)

      setLikesList(likesData.map((like: any) => ({ ...like, platform_users: usersData?.find((u: any) => u.id === like.user_id) || null })))
    } catch (error) {
      console.error('Error fetching likes:', error)
      showAlert('Erro', 'Não foi possível carregar os gostos.', 'error')
    } finally {
      setLoadingLikes(false)
    }
  }

  const submitComment = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!guardAuth() || !commentText.trim() || commenting) return
    setCommenting(true)
    try {
      await addCommentAction(post.id, commentText)
      setCommentsCount((value: number) => value + 1)
      setCommentText('')
      if (!showComments) setShowComments(true)
      await fetchComments()
    } catch (error: any) {
      showAlert('Erro', error?.message || 'Erro ao comentar.', 'error')
    } finally {
      setCommenting(false)
    }
  }

  return (
    <article id={`post-${post.id}`} className="mb-6 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between border-b border-border/70 p-4">
        <div className="flex items-center gap-3">
          <Link href={authorLink} className="relative block transition-opacity hover:opacity-80">
            <UserAvatar name={authorName} src={authorAvatar} className="size-10" />
            {!authorAvatar && <div className="pointer-events-none absolute inset-0 flex items-center justify-center">{post.professional_id ? <User className="h-5 w-5 text-primary" /> : <Building2 className="h-5 w-5 text-primary" />}</div>}
            {post.professional_id && post.professionals?.is_verified && <BadgeCheck className="absolute -bottom-1 -right-1 rounded-full border border-emerald-200 bg-emerald-100 p-0.5 text-emerald-700" />}
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Link href={authorLink}><h3 className="text-sm font-semibold text-foreground hover:underline">{authorName}</h3></Link>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">{authorType}</span>
            </div>
            <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-muted-foreground">
              {timeAgo} • {post.professional_id ? <Globe className="h-3 w-3" /> : <MapPin className="h-3 w-3" />} {post.professional_id ? 'Público' : 'Local'}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={() => guardAuth() && setShowReportModal(true)} className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive" title="Denunciar">
            <Flag className="h-4 w-4" />
          </button>
          <button onClick={handleCopyLink} className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-primary" title="Copiar link">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="px-4 py-3"><p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground" dangerouslySetInnerHTML={{ __html: renderPostContent(post.content || '') }} /></div>

      {post.media_url && (
        <div className="relative aspect-video overflow-hidden border-y border-border bg-muted" onDoubleClick={handleLike}>
          {post.media_type?.startsWith('video') ? <video className="h-full w-full bg-black/5 object-contain" src={post.media_url} controls playsInline /> : <img className="h-full w-full object-cover" src={post.media_url} alt="Conteúdo da publicação" />}
        </div>
      )}

      <div className="px-4 py-3">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/35 px-2 py-1">
            <button onClick={handleLike} disabled={liking} className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${isLiked ? 'bg-destructive/10 text-destructive' : 'text-foreground hover:bg-background'}`} title="Gostar">
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            <button onClick={() => { const next = !showComments; setShowComments(next); if (next) void fetchComments() }} className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-background"><MessageSquare className="h-5 w-5" /></button>
            <button onClick={handleShare} className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-background"><Share2 className="h-5 w-5" /></button>
          </div>
          {post.sport_space_id && <Link href={authorLink} className="rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground">Reservar</Link>}
        </div>

        {likesCount > 0 && <button onClick={() => { setShowLikesModal(true); void fetchLikesList() }} className="mb-2 text-sm font-semibold hover:underline">{likesCount} {likesCount === 1 ? 'gosto' : 'gostos'}</button>}
        {commentsCount > 0 && !showComments && <button onClick={() => { setShowComments(true); void fetchComments() }} className="mb-2 block text-sm text-muted-foreground hover:underline">Ver {commentsCount === 1 ? 'o comentário' : `todos os ${commentsCount} comentários`}</button>}

        {showComments && (
          <div className="mb-3">
            {loadingComments ? <div className="flex justify-center py-3"><Loader2 className="h-4 w-4 animate-spin" /></div> : commentsList.map((comment) => {
              const user = comment.platform_users
              const { name, avatar } = resolveUserInfo(user)
              const userLink = resolveUserLink(user)
              return <div key={comment.id} className="mb-3 flex gap-2.5"><Link href={userLink}><UserAvatar name={name} src={avatar} className="size-7" /></Link><div className="flex-1 rounded-2xl bg-muted/40 px-3.5 py-2 text-sm"><Link href={userLink} className="mb-0.5 block font-bold hover:underline">{name}</Link><span className="whitespace-pre-wrap break-words text-[13px] text-muted-foreground">{comment.content}</span></div></div>
            })}
          </div>
        )}

        <form onSubmit={submitComment} className="mt-2 flex items-center gap-2 rounded-xl border border-border/70 bg-muted/25 px-3 py-2">
          <input value={commentText} onChange={(e) => setCommentText(e.target.value)} maxLength={2000} placeholder="Adiciona um comentário..." className="flex-1 border-none bg-transparent text-sm focus:outline-none" />
          {commentText.trim() && <button type="submit" disabled={commenting} className="text-sm font-semibold text-primary">{commenting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Publicar'}</button>}
        </form>
      </div>

      <Dialog open={showLikesModal} onOpenChange={setShowLikesModal}>
        <DialogContent className="sm:max-w-[400px]"><DialogHeader><DialogTitle>Gostos</DialogTitle></DialogHeader><div className="max-h-[300px] space-y-4 overflow-y-auto pt-2">{loadingLikes ? <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : likesList.length ? likesList.map((like) => { const user = like.platform_users; if (!user) return null; const { name, avatar } = resolveUserInfo(user); const href = resolveUserLink(user); return <div key={like.id} className="flex items-center gap-3"><Link href={href}><UserAvatar name={name} src={avatar} className="size-10" /></Link><Link href={href} className="text-sm font-semibold hover:underline">{name}</Link></div> }) : <p className="text-center text-sm text-muted-foreground">Nenhum gosto encontrado.</p>}</div></DialogContent>
      </Dialog>

      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader><DialogTitle>Denunciar publicação</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div><label className="mb-1.5 block text-sm font-medium">Motivo</label><select value={reportReason} onChange={(e) => setReportReason(e.target.value as any)} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"><option value="spam">Spam</option><option value="harassment">Assédio</option><option value="hate">Discurso de ódio</option><option value="nudity">Conteúdo sexual/nudez</option><option value="violence">Violência</option><option value="fraud">Fraude</option><option value="other">Outro</option></select></div>
            <div><label className="mb-1.5 block text-sm font-medium">Detalhes opcionais</label><textarea value={reportDetails} onChange={(e) => setReportDetails(e.target.value)} maxLength={2000} rows={4} className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm" placeholder="Ajuda a equipa de moderação a perceber o problema." /></div>
            <button onClick={submitReport} disabled={reporting} className="w-full rounded-xl bg-destructive px-4 py-2.5 text-sm font-bold text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50">{reporting ? 'A enviar...' : 'Enviar denúncia'}</button>
          </div>
        </DialogContent>
      </Dialog>
    </article>
  )
}
