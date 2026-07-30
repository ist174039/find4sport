'use client'

import { useState } from 'react'
import { createPostAction } from '@/app/actions/feed'
import {  Loader2, PenLine, Send  } from 'lucide-react'
import { useModal } from '@/components/providers/modal-provider'

export function CreatePostBox({
  currentUserType,
  currentUserName,
  currentUserAvatar
}: {
  currentUserType: string
  currentUserName: string
  currentUserAvatar: string
}) {
  const { showAlert } = useModal()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  if (currentUserType !== 'professional' && currentUserType !== 'espaco') {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)
    try {
      await createPostAction(content)
      setContent('')
    } catch (err: any) {
      showAlert('Erro', err.message || 'Erro ao publicar.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 mb-6 shadow-sm">
      <div className="flex gap-4">
        <img 
          src={currentUserAvatar || 'https://i.pravatar.cc/150'} 
          alt={currentUserName} 
          className="w-10 h-10 rounded-full object-cover shrink-0 border border-border" 
        />
        <form onSubmit={handleSubmit} className="flex-1 space-y-3">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Partilha uma novidade com a tua audiência..."
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none"
            rows={2}
          />
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <PenLine className="w-3.5 h-3.5" /> Apenas Profissionais
            </div>
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
