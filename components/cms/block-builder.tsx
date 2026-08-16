'use client'

import React from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { GripVertical, Image as ImageIcon, LayoutTemplate, Plus, Trash2, Type } from 'lucide-react'

export type BlockType = 'hero' | 'text' | 'image'

export interface CMSBlock {
  id: string
  type: BlockType
  data: Record<string, any>
}

function SortableItem({ block, updateBlock, removeBlock }: {
  block: CMSBlock
  updateBlock: (id: string, data: Record<string, any>) => void
  removeBlock: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div ref={setNodeRef} style={style} className="mb-4 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex min-h-12 items-center justify-between border-b border-border bg-muted/30 px-3 py-2">
        <div className="flex items-center gap-3">
          <button {...attributes} {...listeners} type="button" className="flex h-11 w-11 cursor-grab items-center justify-center rounded-xl text-muted-foreground hover:bg-muted" aria-label="Reordenar bloco">
            <GripVertical className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 text-sm font-semibold">
            {block.type === 'hero' && <LayoutTemplate className="h-5 w-5 text-primary" />}
            {block.type === 'text' && <Type className="h-5 w-5 text-primary" />}
            {block.type === 'image' && <ImageIcon className="h-5 w-5 text-primary" />}
            {block.type === 'hero' ? 'Cabeçalho' : block.type === 'text' ? 'Texto' : 'Imagem'}
          </div>
        </div>
        <Button type="button" variant="ghost" size="icon" className="h-11 w-11 text-muted-foreground hover:text-destructive" onClick={() => removeBlock(block.id)} aria-label="Remover bloco">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        {block.type === 'hero' && <>
          <div className="space-y-2"><Label>Título</Label><Input className="min-h-11 text-base" value={block.data.title || ''} onChange={e => updateBlock(block.id, { ...block.data, title: e.target.value })} /></div>
          <div className="space-y-2"><Label>Subtítulo</Label><Textarea className="min-h-24 text-base" value={block.data.subtitle || ''} onChange={e => updateBlock(block.id, { ...block.data, subtitle: e.target.value })} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Texto do botão</Label><Input className="min-h-11 text-base" value={block.data.ctaText || ''} onChange={e => updateBlock(block.id, { ...block.data, ctaText: e.target.value })} /></div>
            <div className="space-y-2"><Label>Destino do botão</Label><Input className="min-h-11 text-base" value={block.data.ctaLink || ''} onChange={e => updateBlock(block.id, { ...block.data, ctaLink: e.target.value })} placeholder="/profissionais" /></div>
          </div>
        </>}

        {block.type === 'text' && <div className="space-y-2"><Label>Conteúdo</Label><Textarea className="min-h-48 text-base leading-relaxed" value={block.data.content || ''} onChange={e => updateBlock(block.id, { ...block.data, content: e.target.value })} placeholder="Pode usar Markdown para títulos, listas e links." /></div>}

        {block.type === 'image' && <>
          <div className="space-y-2"><Label>URL da imagem</Label><Input className="min-h-11 text-base" value={block.data.url || ''} onChange={e => updateBlock(block.id, { ...block.data, url: e.target.value })} /></div>
          <div className="space-y-2"><Label>Descrição acessível da imagem</Label><Input className="min-h-11 text-base" value={block.data.alt || ''} onChange={e => updateBlock(block.id, { ...block.data, alt: e.target.value })} /></div>
        </>}
      </div>
    </div>
  )
}

export function BlockBuilder({ blocks, onChange }: { blocks: CMSBlock[]; onChange: (blocks: CMSBlock[]) => void }) {
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = blocks.findIndex(item => item.id === active.id)
    const newIndex = blocks.findIndex(item => item.id === over.id)
    onChange(arrayMove(blocks, oldIndex, newIndex))
  }

  const addBlock = (type: BlockType) => onChange([...blocks, { id: crypto.randomUUID(), type, data: {} }])
  const updateBlock = (id: string, data: Record<string, any>) => onChange(blocks.map(block => block.id === id ? { ...block, data } : block))
  const removeBlock = (id: string) => onChange(blocks.filter(block => block.id !== id))

  return (
    <div className="space-y-5">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map(block => block.id)} strategy={verticalListSortingStrategy}>
          {blocks.map(block => <SortableItem key={block.id} block={block} updateBlock={updateBlock} removeBlock={removeBlock} />)}
        </SortableContext>
      </DndContext>

      {blocks.length === 0 && <div className="rounded-2xl border-2 border-dashed border-border p-8 text-center text-sm text-muted-foreground">Ainda não existe conteúdo. Adicione um cabeçalho, texto ou imagem.</div>}

      <div className="rounded-2xl border border-border bg-muted/20 p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Adicionar conteúdo</p>
        <div className="grid gap-2 sm:grid-cols-3">
          <Button type="button" variant="outline" className="min-h-11 justify-start gap-2" onClick={() => addBlock('hero')}><Plus className="h-4 w-4" /><LayoutTemplate className="h-4 w-4" />Cabeçalho</Button>
          <Button type="button" variant="outline" className="min-h-11 justify-start gap-2" onClick={() => addBlock('text')}><Plus className="h-4 w-4" /><Type className="h-4 w-4" />Texto</Button>
          <Button type="button" variant="outline" className="min-h-11 justify-start gap-2" onClick={() => addBlock('image')}><Plus className="h-4 w-4" /><ImageIcon className="h-4 w-4" />Imagem</Button>
        </div>
      </div>
    </div>
  )
}
