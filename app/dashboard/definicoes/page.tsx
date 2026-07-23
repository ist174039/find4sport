'use client'

import { useState } from 'react'
import { Settings, Shield, Key, Bell, CreditCard, Lock, UserX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function DefinicoesPage() {
  const [activeTab, setActiveTab] = useState('account')

  const tabs = [
    { id: 'account', label: 'Conta & Segurança', icon: Shield },
    { id: 'billing', label: 'Faturação', icon: CreditCard },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section - Standard Homepage Layout */}
      <div className="flex justify-between items-end mb-10 pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Definições da Conta</h1>
          <p className="mt-2 text-muted-foreground">Gere a tua password, preferências de notificações e segurança da tua conta.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Navigation Sidebar - Standard theme */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                activeTab === tab.id 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'account' && (
            <div className="space-y-6">
              
              {/* Password Section - Standard Card */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg">
                    <Key className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Alterar Password</h2>
                    <p className="text-xs text-muted-foreground">Atualiza a tua palavra-passe regularmente para manter a conta segura.</p>
                  </div>
                </div>
                
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-pwd" className="text-xs font-semibold">Password Atual</Label>
                    <Input id="current-pwd" type="password" className="rounded-lg h-10 bg-background border-border" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-pwd" className="text-xs font-semibold">Nova Password</Label>
                      <Input id="new-pwd" type="password" className="rounded-lg h-10 bg-background border-border" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-pwd" className="text-xs font-semibold">Confirmar Nova Password</Label>
                      <Input id="confirm-pwd" type="password" className="rounded-lg h-10 bg-background border-border" />
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button type="button" className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm px-5 h-10">
                      Atualizar Password
                    </Button>
                  </div>
                </form>
              </div>

              {/* Privacy / Data Section - Standard Card */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-red-500/10 text-red-500 rounded-lg">
                    <Lock className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Privacidade e Dados</h2>
                    <p className="text-xs text-muted-foreground">Controla os teus dados e o estado da tua conta na plataforma.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/20">
                    <div>
                      <p className="font-semibold text-xs text-foreground">Sessões Ativas</p>
                      <p className="text-[11px] text-muted-foreground">Termina a sessão em todos os outros dispositivos.</p>
                    </div>
                    <Button variant="outline" className="rounded-lg border-border hover:bg-muted text-xs h-8 px-3">Deslogar Outros</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-500/5">
                    <div>
                      <p className="font-semibold text-xs text-red-600">Eliminar Conta</p>
                      <p className="text-[11px] text-red-500/80">Esta ação é irreversível e apagará todos os teus dados.</p>
                    </div>
                    <Button variant="destructive" className="rounded-lg text-xs h-8 px-3 bg-red-500 hover:bg-red-600">Eliminar</Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="bg-card border border-border rounded-xl p-12 text-center shadow-sm">
               <CreditCard className="h-10 w-10 text-muted-foreground mb-3 opacity-40 mx-auto" />
               <h3 className="font-semibold text-foreground">Faturação Indisponível</h3>
               <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">Esta funcionalidade apenas está ativa para contas de Profissionais e Espaços Desportivos.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
