'use client'

import React, { useState } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, GripVertical, Trash2, Image as ImageIcon, Type, LayoutTemplate, Briefcase, BookOpen, FileText } from 'lucide-react'

export type BlockType = 'hero' | 'text' | 'image' | 'features' | 'pricing' | 'jobs' | 'blog_list' | 'resources_list'

export interface CMSBlock {
  id: string
  type: BlockType
  data: any
}

interface BlockBuilderProps {
  blocks: CMSBlock[]
  onChange: (blocks: CMSBlock[]) => void
}

function SortableItem({ block, updateBlock, removeBlock }: { block: CMSBlock, updateBlock: (id: string, data: any) => void, removeBlock: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const renderBlockEditor = () => {
    switch (block.type) {
      case 'hero':
        return (
          <div className="space-y-4">
            <div>
              <Label>Título Principal (Hero)</Label>
              <Input value={block.data.title || ''} onChange={(e) => updateBlock(block.id, { ...block.data, title: e.target.value })} placeholder="O título gigante da página" />
            </div>
            <div>
              <Label>Subtítulo</Label>
              <Textarea value={block.data.subtitle || ''} onChange={(e) => updateBlock(block.id, { ...block.data, subtitle: e.target.value })} placeholder="Apoio ao título" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Texto Botão</Label>
                <Input value={block.data.ctaText || ''} onChange={(e) => updateBlock(block.id, { ...block.data, ctaText: e.target.value })} placeholder="Ex: Começar Agora" />
              </div>
              <div>
                <Label>Link Botão</Label>
                <Input value={block.data.ctaLink || ''} onChange={(e) => updateBlock(block.id, { ...block.data, ctaLink: e.target.value })} placeholder="Ex: /registar" />
              </div>
            </div>
          </div>
        )
      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <Label>Conteúdo de Texto (Markdown Suportado)</Label>
              <Textarea 
                value={block.data.content || ''} 
                onChange={(e) => updateBlock(block.id, { ...block.data, content: e.target.value })} 
                className="min-h-[150px]"
                placeholder="Escreva aqui..." 
              />
            </div>
          </div>
        )
      case 'image':
        return (
          <div className="space-y-4">
            <div>
              <Label>URL da Imagem</Label>
              <Input value={block.data.url || ''} onChange={(e) => updateBlock(block.id, { ...block.data, url: e.target.value })} placeholder="https://..." />
            </div>
            <div>
              <Label>Texto Alternativo (Alt)</Label>
              <Input value={block.data.alt || ''} onChange={(e) => updateBlock(block.id, { ...block.data, alt: e.target.value })} placeholder="Descrição da imagem" />
            </div>
          </div>
        )
      case 'features':
        return (
          <div className="space-y-4">
            <Label className="text-muted-foreground">Bloco de Funcionalidades (Grelha). Em breve terá editor de itens individual.</Label>
            <Input value={block.data.title || ''} onChange={(e) => updateBlock(block.id, { ...block.data, title: e.target.value })} placeholder="Título da secção" />
          </div>
        )
      case 'pricing':
        return (
          <div className="space-y-4">
             <Label className="text-muted-foreground">Este bloco carrega automaticamente os Planos e Preços integrados com o Stripe.</Label>
          </div>
        )
      case 'jobs':
        return (
          <div className="space-y-4">
             <Label className="text-muted-foreground">Este bloco lista as vagas de "Trabalha Connosco" ativas.</Label>
          </div>
        )
      case 'blog_list':
        return (
          <div className="space-y-4">
             <Label className="text-muted-foreground">Lista de Artigos de Blog (Módulo de Blog dinâmico).</Label>
          </div>
        )
      case 'resources_list':
        return (
          <div className="space-y-4">
             <Label className="text-muted-foreground">Lista de Recursos Educacionais (Módulo de Recursos).</Label>
          </div>
        )
      default:
        return null
    }
  }

  const getBlockIcon = (type: string) => {
    switch (type) {
      case 'hero': return <LayoutTemplate className="w-5 h-5 text-indigo-500" />
      case 'text': return <Type className="w-5 h-5 text-blue-500" />
      case 'image': return <ImageIcon className="w-5 h-5 text-emerald-500" />
      case 'features': return <LayoutTemplate className="w-5 h-5 text-purple-500" />
      case 'pricing': return <Briefcase className="w-5 h-5 text-amber-500" />
      case 'jobs': return <Briefcase className="w-5 h-5 text-rose-500" />
      case 'blog_list': return <BookOpen className="w-5 h-5 text-teal-500" />
      case 'resources_list': return <FileText className="w-5 h-5 text-cyan-500" />
      default: return <Type className="w-5 h-5" />
    }
  }

  const getBlockName = (type: string) => {
    switch (type) {
      case 'hero': return 'Hero / Cabeçalho'
      case 'text': return 'Bloco de Texto'
      case 'image': return 'Imagem'
      case 'features': return 'Funcionalidades'
      case 'pricing': return 'Tabela de Planos (Stripe)'
      case 'jobs': return 'Ofertas de Trabalho'
      case 'blog_list': return 'Lista de Blog'
      case 'resources_list': return 'Recursos de Ajuda'
      default: return 'Desconhecido'
    }
  }

  return (
    <div ref={setNodeRef} style={style} className="bg-card border border-border rounded-xl shadow-sm mb-4 overflow-hidden group/block">
      <div className="bg-muted/40 border-b border-border p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1">
            <GripVertical className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2">
            {getBlockIcon(block.type)}
            <span className="font-semibold text-sm">{getBlockName(block.type)}</span>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => removeBlock(block.id)} className="text-muted-foreground hover:text-destructive h-8 px-2">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      <div className="p-4">
        {renderBlockEditor()}
      </div>
    </div>
  )
}

export function BlockBuilder({ blocks, onChange }: BlockBuilderProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((item) => item.id === active.id)
      const newIndex = blocks.findIndex((item) => item.id === over.id)
      onChange(arrayMove(blocks, oldIndex, newIndex))
    }
  }

  const addBlock = (type: BlockType) => {
    const newBlock: CMSBlock = {
      id: `block_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data: {}
    }
    onChange([...blocks, newBlock])
  }

  const updateBlock = (id: string, data: any) => {
    onChange(blocks.map(b => b.id === id ? { ...b, data } : b))
  }

  const removeBlock = (id: string) => {
    onChange(blocks.filter(b => b.id !== id))
  }

  return (
    <div className="space-y-6">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
          {blocks.map((block) => (
            <SortableItem key={block.id} block={block} updateBlock={updateBlock} removeBlock={removeBlock} />
          ))}
        </SortableContext>
      </DndContext>

      {blocks.length === 0 && (
        <div className="border-2 border-dashed border-border rounded-xl p-12 text-center">
          <p className="text-muted-foreground font-medium mb-4">A página está vazia. Adicione blocos para começar a construir!</p>
        </div>
      )}

      <div className="bg-muted/30 border border-border rounded-xl p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Adicionar Bloco</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => addBlock('hero')} className="gap-2">
            <LayoutTemplate className="w-4 h-4" /> Hero
          </Button>
          <Button variant="outline" size="sm" onClick={() => addBlock('text')} className="gap-2">
            <Type className="w-4 h-4" /> Texto
          </Button>
          <Button variant="outline" size="sm" onClick={() => addBlock('image')} className="gap-2">
            <ImageIcon className="w-4 h-4" /> Imagem
          </Button>
          <Button variant="outline" size="sm" onClick={() => addBlock('pricing')} className="gap-2 text-amber-600 border-amber-200 bg-amber-50 hover:bg-amber-100">
            <Briefcase className="w-4 h-4" /> Planos / Preços
          </Button>
          <Button variant="outline" size="sm" onClick={() => addBlock('jobs')} className="gap-2 text-rose-600 border-rose-200 bg-rose-50 hover:bg-rose-100">
            <Briefcase className="w-4 h-4" /> Ofertas de Emprego
          </Button>
          <Button variant="outline" size="sm" onClick={() => addBlock('blog_list')} className="gap-2 text-teal-600 border-teal-200 bg-teal-50 hover:bg-teal-100">
            <BookOpen className="w-4 h-4" /> Blog / Artigos
          </Button>
          <Button variant="outline" size="sm" onClick={() => addBlock('resources_list')} className="gap-2 text-cyan-600 border-cyan-200 bg-cyan-50 hover:bg-cyan-100">
            <FileText className="w-4 h-4" /> Recursos de Ajuda
          </Button>
        </div>
      </div>
    </div>
  )
}
