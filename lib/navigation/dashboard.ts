import type { LucideIcon } from 'lucide-react'
import { Activity, Bell, Building2, Calendar, CalendarCheck, Camera, ClipboardCheck, DollarSign, HandCoins, Heart, LayoutDashboard, MessageSquare, ReceiptText, Settings, Star, User, UserRound, Users } from 'lucide-react'
import type { PlatformRole } from '@/lib/auth/roles'

export type DashboardNavItem={name:string;href:string;icon:LucideIcon;badge?:'notifications'}
export type DashboardNavGroup={label:string;items:DashboardNavItem[]}
const base='/dashboard'

const configs:Record<PlatformRole,DashboardNavGroup[]>={
  athlete:[
    {label:'Principal',items:[
      {name:'O Meu Painel',href:base,icon:LayoutDashboard},
      {name:'Agenda',href:`${base}/agenda`,icon:Calendar},
      {name:'Confirmações',href:`${base}/confirmacoes`,icon:ClipboardCheck},
      {name:'Próximos Eventos',href:`${base}/eventos`,icon:CalendarCheck},
      {name:'Faturação e compras',href:`${base}/compras`,icon:ReceiptText},
      {name:'Mensagens',href:`${base}/mensagens`,icon:MessageSquare},
    ]},
    {label:'Rede',items:[{name:'Favoritos',href:`${base}/favoritos`,icon:Heart},{name:'A Seguir',href:`${base}/seguidores`,icon:UserRound}]},
    {label:'Conta',items:[{name:'O Meu Perfil',href:`${base}/perfil`,icon:User},{name:'Notificações',href:`${base}/notificacoes`,icon:Bell,badge:'notifications'},{name:'Definições',href:`${base}/definicoes`,icon:Settings}]},
  ],
  professional:[
    {label:'Trabalho',items:[{name:'Visão Geral',href:base,icon:LayoutDashboard},{name:'Agenda',href:`${base}/agenda`,icon:Calendar},{name:'Reservas',href:`${base}/reservas`,icon:CalendarCheck},{name:'Entregas e pagamentos',href:`${base}/entregas`,icon:HandCoins},{name:'Serviços',href:`${base}/servicos`,icon:Activity},{name:'Clientes',href:`${base}/clientes`,icon:Users}]},
    {label:'Presença',items:[{name:'O Meu Perfil',href:`${base}/perfil`,icon:User},{name:'Galeria',href:`${base}/galeria`,icon:Camera},{name:'Comunidades',href:`${base}/comunidades`,icon:Users},{name:'Seguidores',href:`${base}/seguidores`,icon:UserRound},{name:'Avaliações',href:`${base}/avaliacoes`,icon:Star}]},
    {label:'Conta',items:[{name:'Minhas compras',href:`${base}/compras`,icon:ReceiptText},{name:'Mensagens',href:`${base}/mensagens`,icon:MessageSquare},{name:'Faturação e plano',href:`${base}/faturacao`,icon:DollarSign},{name:'Notificações',href:`${base}/notificacoes`,icon:Bell,badge:'notifications'},{name:'Definições',href:`${base}/definicoes`,icon:Settings}]},
  ],
  venue_manager:[
    {label:'Operação',items:[{name:'Visão Geral',href:base,icon:LayoutDashboard},{name:'Agenda',href:`${base}/agenda`,icon:Calendar},{name:'Reservas',href:`${base}/reservas`,icon:CalendarCheck},{name:'Entregas e pagamentos',href:`${base}/entregas`,icon:HandCoins},{name:'Salas / Campos',href:`${base}/espacos/salas`,icon:Building2},{name:'Clientes',href:`${base}/clientes`,icon:Users}]},
    {label:'Presença',items:[{name:'O Meu Espaço',href:`${base}/espaco`,icon:Building2},{name:'Galeria',href:`${base}/galeria`,icon:Camera},{name:'Seguidores',href:`${base}/seguidores`,icon:UserRound},{name:'Avaliações',href:`${base}/avaliacoes`,icon:Star}]},
    {label:'Conta',items:[{name:'Minhas compras',href:`${base}/compras`,icon:ReceiptText},{name:'Mensagens',href:`${base}/mensagens`,icon:MessageSquare},{name:'Faturação e plano',href:`${base}/faturacao`,icon:DollarSign},{name:'Notificações',href:`${base}/notificacoes`,icon:Bell,badge:'notifications'},{name:'Definições',href:`${base}/definicoes`,icon:Settings}]},
  ],
}
export function getDashboardNavigation(role:PlatformRole){return configs[role]}
export function getDashboardPrimaryNavigation(role:PlatformRole):DashboardNavItem[]{
  if(role==='athlete')return[
    {name:'Início',href:base,icon:LayoutDashboard},
    {name:'Agenda',href:`${base}/agenda`,icon:Calendar},
    {name:'Confirmar',href:`${base}/confirmacoes`,icon:ClipboardCheck},
    {name:'Mensagens',href:`${base}/mensagens`,icon:MessageSquare},
  ]
  return[
    {name:'Início',href:base,icon:LayoutDashboard},
    {name:'Agenda',href:`${base}/agenda`,icon:Calendar},
    {name:'Reservas',href:`${base}/reservas`,icon:CalendarCheck},
    {name:'Entregas',href:`${base}/entregas`,icon:HandCoins},
  ]
}
