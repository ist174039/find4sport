'use client';
import { BadgeCheck, Building2, Flag, Globe, Heart, MapPin, MessageSquare, MoreVertical, Share2, User } from 'lucide-react'
import { useModal } from '@/components/providers/modal-provider'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { UserAvatar } from '@/components/user-avatar'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'
import { toggleLikeAction, addCommentAction } from '@/app/actions/feed'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

// Helper function to resolve user link
const resolveUserLink = (u: any) => {
  if (!u) return '#'
  if (u.type === 'professional' || u.type === 'profissional') {
    return `/profissionais/${u.professionals?.[0]?.public_slug || u.id}`
  } else if (u.type === 'espaco' || u.type === 'venue_manager' || u.type === 'sport_space' || u.type === 'gestor_espaco') {
    return `/espacos/${u.sport_spaces?.[0]?.slug || u.id}`
  }
  return `/utilizadores/${u.id}`
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

export default function PostCard({
  post,
  initialIsLiked = false,
  isAuthenticated = false,
}: {
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
  
  // Resolve link properly using public_slug if available, otherwise fallback to id
  const authorSlug = post.professional_id 
    ? (post.professionals?.public_slug || post.professional_id)
    : post.sport_space_id
    ? (post.sport_spaces?.slug || post.sport_space_id)
    : null
  
  const authorLink = authorSlug 
    ? (post.professional_id ? `/profissionais/${authorSlug}` : `/espacos/${authorSlug}`)
    : '#'
  
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR })

  const postUrl = typeof window !== 'undefined' ? `${window.location.origin}/feed#post-${post.id}` : ''

  const guardAuth = () => {
    if (!isAuthenticated) {
      showAlert('Inicia sessão', 'Precisas de iniciar sessão para interagir com publicações.', 'error')
      return false
    }
    return true
  }

  const handleLike = async () => {
    if (!guardAuth() || liking) return

    setLiking(true)
    const nextLiked = !isLiked

    // Optimistic UI update
    setIsLiked(nextLiked)
    setLikesCount((prev: number) => nextLiked ? prev + 1 : Math.max(0, prev - 1))
    
    try {
      const result = await toggleLikeAction(post.id)
      setIsLiked(result.liked)
      setLikesCount((prev: number) => {
        if (result.liked && !nextLiked) return prev + 1
        if (!result.liked && nextLiked) return Math.max(0, prev - 1)
        return prev
      })
    } catch (err) {
      // Revert if error
      setIsLiked(isLiked)
      setLikesCount((prev: number) => isLiked ? prev + 1 : Math.max(0, prev - 1))
      showAlert('Erro', 'Não foi possível atualizar o gosto.', 'error')
    } finally {
      setLiking(false)
    }
  }

  const handleShare = async () => {
    if (!postUrl) return

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Publicação de ${authorName} - FIND4SPORT`,
          url: postUrl,
        })
      } else {
        await navigator.clipboard.writeText(postUrl)
        showAlert('Sucesso', 'Link copiado para a área de transferência!', 'success')
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleCopyLink = async () => {
    if (!postUrl) return
    try {
      await navigator.clipboard.writeText(postUrl)
      showAlert('Sucesso', 'Link da publicação copiado.', 'success')
    } catch {
      showAlert('Erro', 'Não foi possível copiar o link.', 'error')
    }
  }

  const handleReport = () => {
    showAlert('Obrigado', 'Publicação sinalizada para revisão.', 'success')
  }

  const fetchComments = async () => {
    setLoadingComments(true)
    try {
      const supabase = createClient()
      
      // Step 1: Get comments
      const { data: commentsData } = await supabase
        .from('post_comments')
        .select('*')
        .eq('post_id', post.id)
        .order('created_at', { ascending: true })

      if (commentsData && commentsData.length > 0) {
        const userIds = commentsData.map((c: any) => c.user_id)
        
        // Step 2: Get user details for comments
        const { data: usersData } = await supabase
          .from('platform_users')
          .select(`
            id, full_name, avatar_url, type,
            professionals (public_slug),
            sport_spaces (slug)
          `)
          .in('id', userIds)

        if (usersData) {
          // Combine comments with their user profiles
          const combined = commentsData.map((comment: any) => {
            return {
              ...comment,
              platform_users: usersData.find(u => u.id === comment.user_id) || null
            }
          })
          setCommentsList(combined)
        } else {
          setCommentsList(commentsData)
        }
      } else {
        setCommentsList([])
      }
    } catch (e) {
      console.error('Error fetching comments:', e)
    } finally {
      setLoadingComments(false)
    }
  }

  const fetchLikesList = async () => {
    setLoadingLikes(true)
    try {
      const supabase = createClient()
      
      // Step 1: get user_ids of likes
      const { data: likesData } = await supabase
        .from('post_likes')
        .select('id, user_id')
        .eq('post_id', post.id)

      if (likesData && likesData.length > 0) {
        const userIds = likesData.map((l: any) => l.user_id)
        
        // Step 2: get platform_users with nested profiles
        const { data: usersData } = await supabase
          .from('platform_users')
          .select(`
            id, full_name, avatar_url, type,
            professionals (public_slug),
            sport_spaces (slug)
          `)
          .in('id', userIds)

        if (usersData) {
          // Map back to the shape expected by the UI
          const combined = likesData.map(like => {
            return {
              id: like.id,
              platform_users: usersData.find(u => u.id === like.user_id) || null
            }
          })
          setLikesList(combined)
        } else {
          setLikesList([])
        }
      } else {
        setLikesList([])
      }
    } catch (e) {
      console.error('Error fetching likes:', e)
    } finally {
      setLoadingLikes(false)
    }
  }

  const handleOpenLikesModal = () => {
    setShowLikesModal(true)
    fetchLikesList()
  }

  const handleComment = () => {
    const nextState = !showComments
    setShowComments(nextState)
    if (nextState) {
      fetchComments()
    }
  }

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!guardAuth()) return
    if (!commentText.trim()) return

    setCommenting(true)
    try {
      await addCommentAction(post.id, commentText)
      setCommentsCount((prev: number) => prev + 1)
      setCommentText('')
      await fetchComments()
    } catch (err: any) {
      showAlert('Erro', err.message || 'Erro ao comentar', 'error')
    } finally {
      setCommenting(false)
    }
  }

  return (
    <article id={`post-${post.id}`} className="mb-6 overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between border-b border-border/70 p-4">
        <div className="flex items-center gap-3">
          <Link href={authorLink} className="relative block hover:opacity-80 transition-opacity">
            <UserAvatar name={authorName} src={authorAvatar} className="size-10" />
            {!authorAvatar && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                {post.professional_id ? (
                  <User className="h-5 w-5 text-primary" />
                ) : (
                  <Building2 className="h-5 w-5 text-primary" />
                )}
              </div>
            )}
            {post.professional_id && post.professionals?.is_verified && (
              <BadgeCheck className="absolute -bottom-1 -right-1 bg-emerald-100 text-emerald-700 text-[10px] rounded-full p-0.5 border border-emerald-200" />
            )}
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Link href={authorLink}>
                <h3 className="text-sm font-semibold text-foreground hover:underline">{authorName}</h3>
              </Link>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${post.professional_id ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                {authorType}
              </span>
            </div>
            <p className="text-muted-foreground text-xs flex items-center gap-1 font-medium mt-0.5">
              {timeAgo} • {post.professional_id ? <Globe className="h-3 w-3 inline" /> : <MapPin className="h-3 w-3 inline" />} {post.professional_id ? 'Público' : 'Local'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleReport} className="text-muted-foreground hover:text-destructive transition-colors w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center" title="Denunciar">
            <Flag className="text-[20px]" />
          </button>
          <button onClick={handleCopyLink} className="text-muted-foreground hover:text-primary transition-colors w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center" title="Copiar link">
            <MoreVertical className="text-[20px]" />
          </button>
        </div>
      </div>
      
      <div className="px-4 pt-3 pb-3">
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: renderPostContent(post.content || '') }}></p>
      </div>
      
      {post.media_url && (
        <div className="relative group aspect-video overflow-hidden border-y border-border bg-muted" onDoubleClick={handleLike}>
          {post.media_type === 'video' ? (
            <video className="w-full h-full object-contain bg-black/5" src={post.media_url} controls playsInline />
          ) : (
            <img className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.015]" src={post.media_url} alt="Post media" />
          )}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-black/35 via-black/10 to-transparent" />
        </div>
      )}
      
      <div className="px-4 py-3">
        {/* Interaction Buttons */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/35 px-2 py-1">
            <button 
              onClick={handleLike}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition-transform active:scale-75 ${isLiked ? 'bg-destructive/10 text-destructive' : 'text-foreground hover:bg-background hover:text-muted-foreground'}`}
              disabled={liking}
              title={isAuthenticated ? 'Gostar' : 'Inicia sessão para gostar'}
            >
              <Heart className={`h-5 w-5 transition-all ${isLiked ? 'fill-current scale-110' : ''}`} />
            </button>
            <button 
              onClick={handleComment}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-foreground transition-transform hover:bg-background hover:text-muted-foreground active:scale-90"
            >
              <MessageSquare className="h-5 w-5" />
            </button>
            <button 
              onClick={handleShare}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-foreground transition-transform hover:bg-background hover:text-muted-foreground active:scale-90"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
          {post.sport_space_id && (
             <Link href={authorLink} className="rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary transition-all hover:bg-primary hover:text-primary-foreground active:scale-95">
               Reservar
             </Link>
          )}
        </div>

        {/* Likes Social Text */}
        {likesCount > 0 && (
          <div className="mb-2">
            <button onClick={handleOpenLikesModal} className="cursor-pointer text-sm font-semibold hover:underline">
              {likesCount} {likesCount === 1 ? 'gosto' : 'gostos'}
            </button>
          </div>
        )}

        {/* Comments Section */}
        {commentsCount > 0 && !showComments && (
          <button onClick={handleComment} className="text-sm text-muted-foreground mb-2 hover:underline">
            Ver {commentsCount === 1 ? 'o comentário' : `todos os ${commentsCount} comentários`}
          </button>
        )}

        {showComments && (
          <div className="mb-3 animate-in fade-in duration-300">
            {loadingComments ? (
              <div className="flex justify-center py-2">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            ) : commentsList.length > 0 ? (
              <div className="space-y-1 mt-2">
                {commentsList.map(c => {
                  const u = c.platform_users
                  const name = u?.full_name || 'Utilizador'
                  
                  return (
                    <div key={c.id} className="text-sm leading-tight mb-1">
                      <Link href={resolveUserLink(u)} className="font-semibold hover:underline mr-1.5">{name}</Link>
                      <span>{c.content}</span>
                    </div>
                  )
                })}
              </div>
            ) : null}
          </div>
        )}

        {/* Always visible comment input */}
        <form onSubmit={submitComment} className="mt-2 flex items-center gap-2 rounded-xl border border-border/70 bg-muted/25 px-3 py-2">
          <input 
            type="text"
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            placeholder="Adiciona um comentário..."
            className="flex-1 border-none bg-transparent px-0 text-sm focus:outline-none focus:ring-0 placeholder:text-muted-foreground"
          />
          {commentText.trim() && (
            <button 
              type="submit"
              disabled={commenting}
              className="text-primary font-semibold text-sm hover:text-primary/80 transition-colors"
            >
              {commenting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publicar'}
            </button>
          )}
        </form>
      </div>

      {/* Likes Modal */}
      <Dialog open={showLikesModal} onOpenChange={setShowLikesModal}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Gostos</DialogTitle>
          </DialogHeader>
          <div className="max-h-[300px] overflow-y-auto mt-4 pr-2 space-y-4">
            {loadingLikes ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : likesList.length > 0 ? (
              likesList.map((like) => {
                const u = like.platform_users
                if (!u) return null
                const name = u.full_name || 'Utilizador'
                const avatar = u.avatar_url
                const userLink = resolveUserLink(u)

                return (
                  <div key={like.id} className="flex items-center gap-3">
                    <Link href={userLink} className="hover:opacity-80 transition-opacity">
                      <UserAvatar name={name} src={avatar} className="size-10" />
                    </Link>
                    <Link href={userLink} className="font-semibold text-sm text-foreground hover:underline">
                      {name}
                    </Link>
                  </div>
                )
              })
            ) : (
              <p className="text-center text-sm text-muted-foreground">Nenhum gosto encontrado.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </article>
  )
}
