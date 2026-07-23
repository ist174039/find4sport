'use client';
import { MapPin, Star } from 'lucide-react'

import { useState } from 'react'

export default function Page() {
  const [activeTab, setActiveTab] = useState('proximas')

  return (
    <>
      <header className="w-full sticky top-0 bg-background z-50 border-b border-border">
      </header>
      <main className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-10 min-h-screen">
        {/*  Header Section  */}
        <div className="mb-10">
          <h1 className="font-bold text-2xl text-2xl text-foreground mb-2">As Minhas Reservas</h1>
          <p className="text-muted-foreground text-base">Gira as tuas marcações de atividades desportivas e espaços.</p>
        </div>
        {/*  Layout Wrapper  */}
        <div className="flex flex-col lg:flex-row gap-gutter">
          {/*  Left Sidebar Navigation (User Profile Context)  */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center gap-3 mb-6 p-2">
                <img alt="Profile" className="w-12 h-12 rounded-full object-cover" data-alt="A professional close-up portrait of a cheerful young man with a friendly smile, set against a soft, blurred studio background. The lighting is bright and airy, typical of a high-end clean corporate profile photo, emphasizing healthy skin tones and a modern, minimalist aesthetic that aligns with the athletic and professional brand." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBT7-yLkJhSvsxKf5u2BL1Lx0CRvOjELdM299IUa-JpWODWUvD4jruo49LnzPPm4_6zkSyeQfx-i94aElwCcykE6AvH41gNhnCr8WSRqfLw-3IcByCRXe8SsBQ0AFNEsW_Wgd_3lk0kMarbreFw8x2J5Fh7wWohCK7AXzRaQyClC0XcvAhwZ_lWpxEcJs-nJHiX21KjckNbhNSuMExRNFkKOOEcRwNnW989M7uKgvpey8oVNpgM9nBtRiCZEoZZXDogfU_YFvy_" />
                <div>
                  <p className="font-semibold text-xl text-sm text-foreground">João Silva</p>
                  <p className="text-sm text-muted-foreground">Membro desde 2023</p>
                </div>
              </div>
            </div>
          </aside>
          {/*  Main Content Area: Reservations  */}
          <div className="flex-grow">
            {/*  Filter Tabs  */}
            <div className="flex gap-8 border-b border-border mb-8">
              <button 
                onClick={() => setActiveTab('proximas')} 
                className={`${activeTab === 'proximas' ? 'border-b-2 border-primary text-primary font-bold' : 'text-muted-foreground hover:text-primary'} pb-4 font-medium text-sm transition-all`} 
                id="tab-proximas"
              >
                Próximas
              </button>
              <button 
                onClick={() => setActiveTab('passadas')} 
                className={`${activeTab === 'passadas' ? 'border-b-2 border-primary text-primary font-bold' : 'text-muted-foreground hover:text-primary'} pb-4 font-medium text-sm transition-all`} 
                id="tab-passadas"
              >
                Passadas
              </button>
              <button 
                onClick={() => setActiveTab('canceladas')} 
                className={`${activeTab === 'canceladas' ? 'border-b-2 border-primary text-primary font-bold' : 'text-muted-foreground hover:text-primary'} pb-4 font-medium text-sm transition-all`} 
                id="tab-canceladas"
              >
                Canceladas
              </button>
            </div>
            {/*  Reservations List  */}
            <div className="space-y-gutter" id="reservas-container">
              {activeTab === 'proximas' ? (
                <>
                  {/*  Reservation Card 1 (Upcoming)  */}
                  <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow group">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-48 h-40 md:h-auto overflow-hidden">
                        <img alt="Campo de Padel" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="A gym facility" src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=300" />
                      </div>
                      <div className="p-6 flex-grow flex flex-col justify-between">
                        <div className="flex flex-col md:flex-row justify-between items-start mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="bg-secondary-fixed text-on-secondary-fixed-variant text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wider">Espaço</span>
                              <span className="flex items-center gap-1 text-amber-500">
                                <Star className="text-sm h-5 w-5" />
                                <span className="font-medium text-sm">4.9</span>
                              </span>
                            </div>
                            <h3 className="font-semibold text-xl text-xl text-foreground">Clube de Padel Quinta da Marinha</h3>
                            <p className="text-muted-foreground text-sm flex items-center gap-1">
                              <MapPin className="text-base h-5 w-5" /> Cascais, Portugal
                            </p>
                          </div>
                          <div className="mt-4 md:mt-0 text-right">
                            <span className="bg-emerald-500/10 text-primary font-medium text-sm px-3 py-1 rounded-full border border-primary/20">Confirmada</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-border/50 mb-4">
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Data</p>
                            <p className="text-base text-foreground">24 Out 2024</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Hora</p>
                            <p className="text-base text-foreground">18:30 - 20:00</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Preço</p>
                            <p className="text-base text-foreground">32,00 €</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Campo</p>
                            <p className="text-base text-foreground">Nº 4 (Panorâmico)</p>
                          </div>
                        </div>
                        <div className="flex justify-end gap-3">
                          <button className="px-4 py-2 text-destructive font-medium text-sm hover:bg-destructive/5 rounded-lg transition-colors">Cancelar Reserva</button>
                          <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium text-sm hover:bg-primary/10 transition-all">Ver Detalhes</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/*  Reservation Card 2 (Pending)  */}
                  <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow group">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-48 h-40 md:h-auto overflow-hidden">
                        <img alt="Personal Trainer" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="A personal trainer" src="https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=300" />
                      </div>
                      <div className="p-6 flex-grow flex flex-col justify-between">
                        <div className="flex flex-col md:flex-row justify-between items-start mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="bg-tertiary-fixed text-on-tertiary-fixed-variant text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wider">Profissional</span>
                              <span className="flex items-center gap-1 text-amber-500">
                                <Star className="text-sm h-5 w-5" />
                                <span className="font-medium text-sm">5.0</span>
                              </span>
                            </div>
                            <h3 className="font-semibold text-xl text-xl text-foreground">Ricardo Mendes — PT High Performance</h3>
                            <p className="text-muted-foreground text-sm flex items-center gap-1">
                              <MapPin className="text-base h-5 w-5" /> Fitness Center Colombo
                            </p>
                          </div>
                          <div className="mt-4 md:mt-0 text-right">
                            <span className="bg-muted text-muted-foreground font-medium text-sm px-3 py-1 rounded-full border border-border/30">Pendente</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-border/50 mb-4">
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Data</p>
                            <p className="text-base text-foreground">28 Out 2024</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Hora</p>
                            <p className="text-base text-foreground">08:00 - 09:00</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Preço</p>
                            <p className="text-base text-foreground">45,00 €</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Sessão</p>
                            <p className="text-base text-foreground">Treino Funcional</p>
                          </div>
                        </div>
                        <div className="flex justify-end gap-3">
                          <button className="px-4 py-2 text-destructive font-medium text-sm hover:bg-destructive/5 rounded-lg transition-colors">Cancelar Pedido</button>
                          <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium text-sm hover:bg-primary/10 transition-all">Ver Detalhes</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-20 bg-card border border-border rounded-xl text-muted-foreground text-sm">
                  Sem reservas registadas nesta categoria.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
