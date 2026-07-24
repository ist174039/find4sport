'use client'

import { useState } from 'react'
import { createCommunityPostAction } from '@/app/actions/community-feed'
import { Loader2, Send } from 'lucide-react'
import { useModal } from '@/components/providers/modal-provider'

export function CreateCommunityPostBox({
  communityId,
  currentUserName,
  currentUserAvatar
}: {
  communityId: string
  currentUserName: string
  currentUserAvatar: string
}) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const { showAlert } = useModal()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)
    try {
      await createCommunityPostAction(communityId, content)
      setContent('')
      showAlert('Sucesso', 'Publicação feita com sucesso!', 'success')
    } catch (err: any) {
      showAlert('Erro', err.message || 'Erro ao publicar.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 mb-6 shadow-sm">
      <div className="flex gap-4">
        {currentUserAvatar ? (
          <img 
            src={currentUserAvatar} 
            alt={currentUserName} 
            className="w-10 h-10 rounded-full object-cover shrink-0 border border-border" 
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center font-bold text-muted-foreground shrink-0 uppercase">
            {(currentUserName || 'U').charAt(0)}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex-1 space-y-3">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Partilha algo com a comunidade..."
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none"
            rows={2}
          />
          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="bg-primary text-primary-foreground px-5 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Publicar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
