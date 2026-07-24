'use client';
import {  BadgeCheck, Building2, Flag, Globe, Heart, MapPin, MessageSquare, MoreVertical, Play, Share2, User  } from 'lucide-react'
import { useModal } from '@/components/providers/modal-provider'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'
import { toggleLikeAction, addCommentAction } from '@/app/actions/feed'
import { Loader2 } from 'lucide-react'

export default function PostCard({ post }: { post: any }) {
  const { showAlert } = useModal()
  const [likesCount, setLikesCount] = useState(post.likes?.[0]?.count || 0)
  const [commentsCount, setCommentsCount] = useState(post.comments?.[0]?.count || 0)
  const [isLiked, setIsLiked] = useState(false) // Ideally this should be determined by the backend if user liked it
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [commenting, setCommenting] = useState(false)
  const [commentsList, setCommentsList] = useState<{id: string, content: string}[]>([])

  const authorName = post.professional_id ? post.professionals?.full_name : post.sport_spaces?.name
  const authorAvatar = post.professional_id ? post.professionals?.avatar_url : post.sport_spaces?.logo_url
  const authorType = post.professional_id ? 'PRO' : 'ESPAÇO'
  
  // Resolve link properly using public_slug if available, otherwise fallback to id
  const authorSlug = post.professional_id 
    ? (post.professionals?.public_slug || post.professional_id)
    : (post.sport_spaces?.slug || post.sport_space_id)
  
  const authorLink = post.professional_id ? `/profissionais/${authorSlug}` : `/espacos/${authorSlug}`
  
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR })

  const handleLike = async () => {
    // Optimistic UI update
    setIsLiked(!isLiked)
    setLikesCount((prev: number) => isLiked ? prev - 1 : prev + 1)
    
    try {
      const result = await toggleLikeAction(post.id)
      setIsLiked(result.liked)
    } catch (err) {
      // Revert if error
      setIsLiked(isLiked)
      setLikesCount((prev: number) => isLiked ? prev + 1 : prev - 1)
    }
  }

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/feed#post-${post.id}`
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

  const handleComment = () => {
    setShowComments(!showComments)
  }

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return

    setCommenting(true)
    try {
      await addCommentAction(post.id, commentText)
      
      // Optimistic locally added comment
      setCommentsList([...commentsList, { id: Math.random().toString(), content: commentText }])
      setCommentsCount((prev: number) => prev + 1)
      setCommentText('')
    } catch (err: any) {
      showAlert('Erro', err.message || 'Erro ao comentar', 'error')
    } finally {
      setCommenting(false)
    }
  }

  return (
    <article id={`post-${post.id}`} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow mb-6">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={authorLink} className="relative block hover:opacity-80 transition-opacity">
            {authorAvatar ? (
              <img className="w-10 h-10 rounded-full object-cover border border-border" src={authorAvatar} alt={authorName} />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 border border-border flex items-center justify-center">
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
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${post.professional_id ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                {authorType}
              </span>
            </div>
            <p className="text-muted-foreground text-xs flex items-center gap-1 font-medium mt-0.5">
              {timeAgo} • {post.professional_id ? <Globe className="h-3 w-3 inline" /> : <MapPin className="h-3 w-3 inline" />} {post.professional_id ? 'Público' : 'Local'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="text-muted-foreground hover:text-destructive transition-colors w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center" title="Denunciar">
            <Flag className="text-[20px]" />
          </button>
          <button className="text-muted-foreground hover:text-primary transition-colors w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center">
            <MoreVertical className="text-[20px]" />
          </button>
        </div>
      </div>
      
      <div className="px-4 pb-3">
        <p className="text-sm text-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: post.content.replace(/#(\w+)/g, '<Link href="/pesquisa?q=$1" class="text-primary font-semibold hover:underline">#$1</Link>') }}></p>
      </div>
      
      {post.media_url && (
        <div className="relative group aspect-video bg-muted border-y border-border overflow-hidden">
          <img className="w-full h-full object-cover" src={post.media_url} alt="Post media" />
          {post.media_type === 'video' && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Play className="text-white text-[64px] drop-shadow-lg" />
            </div>
          )}
        </div>
      )}
      
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-2 transition-all active:scale-90 ${isLiked ? 'text-destructive font-semibold' : 'text-muted-foreground hover:text-destructive font-medium'}`}
          >
            <Heart className="h-5 w-5" />
            <span className="text-sm">{likesCount}</span>
          </button>
          <button 
            onClick={handleComment}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary font-medium active:scale-90 transition-all"
          >
            <MessageSquare className="h-5 w-5" />
            <span className="text-sm">{commentsCount}</span>
          </button>
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary font-medium active:scale-90 transition-all"
          >
            <Share2 className="h-5 w-5" />
            <span className="text-sm">Partilhar</span>
          </button>
        </div>
        {post.sport_space_id && (
           <Link href={authorLink} className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition-all active:scale-95 border border-primary/20">
             Reservar
           </Link>
        )}
      </div>

      {showComments && (
        <div className="bg-muted/30 border-t border-border p-4 animate-in fade-in duration-200">
          <form onSubmit={submitComment} className="flex gap-2 mb-4">
            <input 
              type="text"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Escreve um comentário..."
              className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button 
              type="submit"
              disabled={commenting || !commentText.trim()}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold text-sm shadow-sm disabled:opacity-50 flex items-center justify-center min-w-[80px]"
            >
              {commenting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar'}
            </button>
          </form>

          {commentsList.length > 0 && (
            <div className="space-y-3 mt-4">
              {commentsList.map(c => (
                <div key={c.id} className="bg-background border border-border p-3 rounded-lg text-sm text-foreground">
                  <span className="font-bold mr-2 text-primary">Tu:</span>
                  {c.content}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  )
}
