'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { pt } from 'date-fns/locale'
import { Building2, Flag, Globe, Heart, Loader2, MapPin, MessageSquare, MoreVertical, Share2, User } from 'lucide-react'
import { addCommentAction, reportPostAction, toggleLikeAction } from '@/app/actions/feed'
import { loadPostCommentsAction, loadPostLikesAction, type PublicPostComment, type PublicPostLike } from '@/app/actions/feed-interactions'
import { useModal } from '@/components/providers/modal-provider'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { UserAvatar } from '@/components/user-avatar'
import { AppImage } from '@/components/ui/app-image'

export type PostCardPost = {
  id: string
  content: string | null
  created_at: string
  media_url: string | null
  media_type: string | null
  professional_id: string | null
  sport_space_id: string | null
  professionals?: { professional_name?: string | null; full_name?: string | null; avatar_url?: string | null; public_slug?: string | null } | null
  sport_spaces?: { name?: string | null; logo_url?: string | null; slug?: string | null } | null
  platform_users?: { id?: string | null; full_name?: string | null; avatar_url?: string | null } | null
  likes?: Array<{ count: number | string | null }> | null
  comments?: Array<{ count: number | string | null }> | null
}

const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
const renderPostContent = (value: string) => escapeHtml(value).replace(/#([\wÀ-ÿ]+)/g, (_, tag: string) => `<a href="/pesquisa?q=${encodeURIComponent(tag)}" class="font-semibold text-primary hover:underline">#${tag}</a>`)

export default function PostCard({ post, initialIsLiked = false, isAuthenticated = false }: { post: PostCardPost; initialIsLiked?: boolean; isAuthenticated?: boolean }) {
  const { showAlert } = useModal()
  const [likesCount, setLikesCount] = useState(Number(post.likes?.[0]?.count || 0))
  const [commentsCount, setCommentsCount] = useState(Number(post.comments?.[0]?.count || 0))
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [liking, setLiking] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [loadingComments, setLoadingComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [commenting, setCommenting] = useState(false)
  const [commentsList, setCommentsList] = useState<PublicPostComment[]>([])
  const [showLikesModal, setShowLikesModal] = useState(false)
  const [likesList, setLikesList] = useState<PublicPostLike[]>([])
  const [loadingLikes, setLoadingLikes] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState<'spam' | 'harassment' | 'hate' | 'nudity' | 'violence' | 'fraud' | 'other'>('spam')
  const [reportDetails, setReportDetails] = useState('')
  const [reporting, setReporting] = useState(false)

  const authorName = post.professional_id ? (post.professionals?.professional_name || post.professionals?.full_name || 'Profissional') : post.sport_space_id ? (post.sport_spaces?.name || 'Espaço') : (post.platform_users?.full_name || 'Utilizador')
  const authorAvatar = post.professional_id ? post.professionals?.avatar_url : post.sport_space_id ? post.sport_spaces?.logo_url : post.platform_users?.avatar_url
  const authorType = post.professional_id ? 'PRO' : post.sport_space_id ? 'ESPAÇO' : 'MEMBRO'
  const authorLink = post.professional_id ? `/profissionais/${post.professionals?.public_slug || post.professional_id}` : post.sport_space_id ? `/espacos/${post.sport_spaces?.slug || post.sport_space_id}` : post.platform_users?.id ? `/utilizadores/${post.platform_users.id}` : '#'
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: pt })
  const postUrl = typeof window !== 'undefined' ? `${window.location.origin}/feed#post-${post.id}` : ''

  function requireAuth() {
    if (isAuthenticated) return true
    showAlert('Inicia sessão', 'Precisas de iniciar sessão para interagir com publicações.', 'info')
    return false
  }

  async function handleLike() {
    if (!requireAuth() || liking) return
    const previous = isLiked
    const next = !previous
    setLiking(true)
    setIsLiked(next)
    setLikesCount(value => Math.max(0, value + (next ? 1 : -1)))
    try {
      const result = await toggleLikeAction(post.id)
      if (result.liked !== next) {
        setIsLiked(result.liked)
        setLikesCount(value => Math.max(0, value + (result.liked ? 1 : -1)))
      }
    } catch (error) {
      setIsLiked(previous)
      setLikesCount(value => Math.max(0, value + (previous ? 1 : -1)))
      showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível atualizar o gosto.', 'error')
    } finally { setLiking(false) }
  }

  async function fetchComments() {
    setLoadingComments(true)
    try { setCommentsList(await loadPostCommentsAction(post.id)) }
    catch (error) { showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível carregar os comentários.', 'error') }
    finally { setLoadingComments(false) }
  }

  async function fetchLikes() {
    setLoadingLikes(true)
    try { setLikesList(await loadPostLikesAction(post.id)) }
    catch (error) { showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível carregar os gostos.', 'error') }
    finally { setLoadingLikes(false) }
  }

  async function submitComment(event: React.FormEvent) {
    event.preventDefault()
    if (!requireAuth() || !commentText.trim() || commenting) return
    setCommenting(true)
    try {
      await addCommentAction(post.id, commentText)
      setCommentText('')
      setCommentsCount(value => value + 1)
      setShowComments(true)
      await fetchComments()
    } catch (error) { showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível comentar.', 'error') }
    finally { setCommenting(false) }
  }

  async function handleShare() {
    if (!postUrl) return
    try {
      if (navigator.share) await navigator.share({ title: `Publicação de ${authorName}`, url: postUrl })
      else { await navigator.clipboard.writeText(postUrl); showAlert('Link copiado', 'O link da publicação foi copiado.', 'success') }
    } catch (error) { if (!(error instanceof DOMException && error.name === 'AbortError')) showAlert('Erro', 'Não foi possível partilhar.', 'error') }
  }

  async function copyLink() {
    if (!postUrl) return
    try { await navigator.clipboard.writeText(postUrl); showAlert('Link copiado', 'O link da publicação foi copiado.', 'success') }
    catch { showAlert('Erro', 'Não foi possível copiar o link.', 'error') }
  }

  async function submitReport() {
    if (!requireAuth() || reporting) return
    setReporting(true)
    try {
      const result = await reportPostAction(post.id, reportReason, reportDetails)
      setShowReportModal(false)
      setReportDetails('')
      showAlert(result.duplicate ? 'Denúncia já registada' : 'Denúncia enviada', result.duplicate ? 'A denúncia existente continua em análise.' : 'A publicação foi enviada para moderação.', 'success')
    } catch (error) { showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível enviar a denúncia.', 'error') }
    finally { setReporting(false) }
  }

  return <article id={`post-${post.id}`} className="mb-4 min-w-0 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm sm:mb-6">
    <header className="flex min-w-0 items-center justify-between gap-2 border-b border-border/70 p-3 sm:p-4">
      <div className="flex min-w-0 items-center gap-3">
        <Link href={authorLink} className="relative shrink-0"><UserAvatar name={authorName} src={authorAvatar} className="size-10" />{!authorAvatar && <span className="pointer-events-none absolute inset-0 flex items-center justify-center">{post.professional_id ? <User className="h-5 w-5 text-primary" /> : <Building2 className="h-5 w-5 text-primary" />}</span>}</Link>
        <div className="min-w-0"><div className="flex min-w-0 items-center gap-2"><Link href={authorLink} className="min-w-0"><h3 className="truncate text-sm font-semibold hover:underline">{authorName}</h3></Link><span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">{authorType}</span></div><p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">{timeAgo} · {post.professional_id ? <Globe className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}</p></div>
      </div>
      <div className="flex shrink-0"><button type="button" onClick={() => requireAuth() && setShowReportModal(true)} className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Denunciar"><Flag className="h-4 w-4" /></button><button type="button" onClick={copyLink} className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted" aria-label="Copiar link"><MoreVertical className="h-4 w-4" /></button></div>
    </header>

    {post.content && <div className="px-3 py-3 sm:px-4"><p className="break-words whitespace-pre-wrap text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: renderPostContent(post.content) }} /></div>}
    {post.media_url && <div className="relative aspect-video overflow-hidden border-y border-border bg-muted" onDoubleClick={() => void handleLike()}>{String(post.media_type || '').startsWith('video') ? <video src={post.media_url} controls playsInline className="h-full w-full bg-black object-contain" /> : <AppImage src={post.media_url} alt="Conteúdo da publicação" fill sizes="(max-width: 1024px) 100vw, 700px" className="object-cover" />}</div>}

    <div className="px-3 py-3 sm:px-4">
      <div className="mb-2 flex items-center justify-between gap-2"><div className="flex items-center gap-1 rounded-full border border-border/70 bg-muted/35 px-1.5 py-1"><button type="button" onClick={() => void handleLike()} disabled={liking} className={`flex h-8 w-8 items-center justify-center rounded-full ${isLiked ? 'text-destructive' : ''}`} aria-label="Gostar"><Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} /></button><button type="button" onClick={() => { const next = !showComments; setShowComments(next); if (next) void fetchComments() }} className="flex h-8 w-8 items-center justify-center rounded-full" aria-label="Comentários"><MessageSquare className="h-5 w-5" /></button><button type="button" onClick={() => void handleShare()} className="flex h-8 w-8 items-center justify-center rounded-full" aria-label="Partilhar"><Share2 className="h-5 w-5" /></button></div>{post.sport_space_id && <Link href={authorLink} className="shrink-0 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">Ver espaço</Link>}</div>
      <div className="flex gap-3 text-sm"><button type="button" disabled={!likesCount} onClick={() => { if (likesCount) { setShowLikesModal(true); void fetchLikes() } }} className="font-semibold disabled:cursor-default">{likesCount} {likesCount === 1 ? 'gosto' : 'gostos'}</button>{commentsCount > 0 && !showComments && <button type="button" onClick={() => { setShowComments(true); void fetchComments() }} className="text-muted-foreground hover:underline">{commentsCount} {commentsCount === 1 ? 'comentário' : 'comentários'}</button>}</div>
      {showComments && <div className="mt-3 border-t border-border/60 pt-3">{loadingComments ? <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin" /></div> : commentsList.length ? <div className="space-y-3">{commentsList.map(comment => <div key={comment.id} className="flex gap-2.5"><Link href={comment.identity.href} className="shrink-0"><UserAvatar name={comment.identity.name} src={comment.identity.avatar} className="size-8" /></Link><div className="min-w-0 flex-1 rounded-2xl bg-muted/40 px-3 py-2"><Link href={comment.identity.href} className="block truncate text-sm font-bold hover:underline">{comment.identity.name}</Link><p className="break-words whitespace-pre-wrap text-sm text-muted-foreground">{comment.content}</p></div></div>)}</div> : <p className="py-2 text-sm text-muted-foreground">Ainda não existem comentários.</p>}</div>}
      <form onSubmit={submitComment} className="mt-3 flex min-w-0 items-center gap-2 rounded-xl border border-border/70 bg-muted/20 px-3 py-2"><input value={commentText} onChange={event => setCommentText(event.target.value)} maxLength={2000} placeholder="Adicionar comentário…" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />{commentText.trim() && <button type="submit" disabled={commenting} className="shrink-0 text-sm font-semibold text-primary">{commenting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Publicar'}</button>}</form>
    </div>

    <Dialog open={showLikesModal} onOpenChange={setShowLikesModal}><DialogContent className="sm:max-w-sm"><DialogHeader><DialogTitle>Gostos</DialogTitle></DialogHeader><div className="max-h-[55vh] space-y-3 overflow-y-auto">{loadingLikes ? <div className="flex justify-center py-5"><Loader2 className="h-5 w-5 animate-spin" /></div> : likesList.length ? likesList.map(like => <Link key={like.id} href={like.identity.href} className="flex min-h-12 items-center gap-3 rounded-xl p-2 hover:bg-muted"><UserAvatar name={like.identity.name} src={like.identity.avatar} className="size-10" /><span className="truncate text-sm font-semibold">{like.identity.name}</span></Link>) : <p className="py-4 text-center text-sm text-muted-foreground">Sem gostos.</p>}</div></DialogContent></Dialog>
    <Dialog open={showReportModal} onOpenChange={setShowReportModal}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Denunciar publicação</DialogTitle></DialogHeader><div className="space-y-4"><div><label className="mb-1.5 block text-sm font-medium">Motivo</label><select value={reportReason} onChange={event => setReportReason(event.target.value as typeof reportReason)} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"><option value="spam">Spam</option><option value="harassment">Assédio</option><option value="hate">Discurso de ódio</option><option value="nudity">Conteúdo sexual/nudez</option><option value="violence">Violência</option><option value="fraud">Fraude</option><option value="other">Outro</option></select></div><div><label className="mb-1.5 block text-sm font-medium">Detalhes opcionais</label><textarea value={reportDetails} onChange={event => setReportDetails(event.target.value)} maxLength={2000} rows={4} className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm" /></div><button type="button" onClick={() => void submitReport()} disabled={reporting} className="w-full rounded-xl bg-destructive px-4 py-2.5 text-sm font-bold text-destructive-foreground disabled:opacity-50">{reporting ? 'A enviar…' : 'Enviar denúncia'}</button></div></DialogContent></Dialog>
  </article>
}
