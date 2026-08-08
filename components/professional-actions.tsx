'use client'

import { MessageSquare } from 'lucide-react'
import { InitiateConversationButton } from '@/components/initiate-conversation-btn'

export function ContactarProfissionalBtn({ 
  profName, 
  userId 
}: { 
  profName: string
  userId: string | null 
}) {
  return (
    <InitiateConversationButton
      targetUserId={userId}
      targetName={profName}
      icon={MessageSquare}
      label="Enviar Mensagem / Marcar Sessão"
      emptyTargetMessage="Este profissional ainda não ativou a caixa de mensagens."
      selfTargetMessage="Este é o seu próprio perfil de profissional."
      initialMessageBuilder={(name) => `Olá ${name}! Gostaria de saber mais informações sobre os seus serviços de treino/consulta.`}
      errorMessage="Erro ao enviar mensagem ao profissional."
      successMessage="Mensagem enviada com sucesso! A redirecionar para a caixa de mensagens..."
    />
  )
}
