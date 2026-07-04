'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function Page() {
  const [importing, setImporting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleImport = async () => {
    setImporting(true)
    const supabase = createClient()
    
    const mockSpaces = [
      {
        name: 'Arena BT Premium (Importada)',
        address: 'Rua Olimpíadas, 205 - SP',
        is_verified: true,
        rating_avg: 4.8,
        review_count: 24,
        slug: 'arena-bt-premium-' + Date.now(),
        gallery_urls: ['https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=300']
      },
      {
        name: 'Centro Esportivo Pinheiros (Importado)',
        address: 'Av. das Nações Unidas, 1200 - SP',
        is_verified: false,
        rating_avg: 4.5,
        review_count: 12,
        slug: 'centro-esportivo-pinheiros-' + Date.now(),
        gallery_urls: ['https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=300']
      }
    ]

    const { error } = await supabase.from('sport_spaces').insert(mockSpaces)
    setImporting(false)
    if (!error) {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } else {
      alert('Erro ao importar: ' + error.message)
    }
  }

  return (
    <div className="max-w-[1280px] mx-auto space-y-gutter">
{/*  Header & Stepper  */}
<div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
<div>
<h2 className="font-headline-lg text-headline-lg text-text-primary">Módulo de Ingestão de Dados</h2>
<p className="text-text-secondary font-body-lg mt-2">Importação em massa de espaços esportivos e profissionais qualificados.</p>
</div>
<div className="flex items-center gap-2">
<div className="flex items-center text-primary font-bold">
<span className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-label-md mr-2">1</span>
<span className="font-label-md hidden sm:block">Extração</span>
</div>
<div className="w-8 h-[2px] bg-outline-variant mx-2"></div>
<div className="flex items-center text-on-surface-variant">
<span className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-label-md mr-2">2</span>
<span className="font-label-md hidden sm:block">Mapeamento</span>
</div>
<div className="w-8 h-[2px] bg-outline-variant mx-2"></div>
<div className="flex items-center text-on-surface-variant">
<span className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-label-md mr-2">3</span>
<span className="font-label-md hidden sm:block">Validação</span>
</div>
</div>
</div>
{/*  Bento Grid Layout for Step 1  */}
<div className="grid grid-cols-12 gap-gutter">
{/*  Google Places Integration Card  */}
<div className="col-span-12 lg:col-span-7 bg-surface-container-lowest p-8 rounded-xl border border-border-subtle shadow-sm flex flex-col gap-6">
<div className="flex items-center justify-between">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-primary text-3xl" data-icon="google">google</span>
<h3 className="font-headline-md text-headline-md">Pesquisa Google Places</h3>
</div>
<span className="bg-success-mint text-primary px-3 py-1 rounded-full font-label-md text-[10px] uppercase">API Ativa</span>
</div>
<div className="relative">
<input className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-5 py-4 text-body-lg focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Ex: Quadras de Beach Tennis em São Paulo" type="text" />
<button className="absolute right-3 top-3 bg-primary text-on-primary px-6 py-2 rounded-lg font-label-md hover:opacity-90 transition-opacity">Buscar Locais</button>
</div>
<div className="flex-grow">
<p className="font-label-md text-on-surface-variant mb-4">RESULTADOS DA PRÉVIA (4 encontrados)</p>
<div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
<div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-transparent hover:border-primary/30 transition-all cursor-pointer">
<div className="flex items-center gap-4">
<div className="w-12 h-12 rounded-lg bg-secondary-container flex items-center justify-center text-primary">
<span className="material-symbols-outlined" data-icon="sports_tennis">sports_tennis</span>
</div>
<div>
<p className="font-label-md text-text-primary">Arena BT Premium</p>
<p className="text-body-md text-on-surface-variant">Rua Olimpíadas, 205 - SP</p>
</div>
</div>
<div className="flex items-center gap-2">
<span className="text-trust-gold font-bold text-body-md">4.8</span>
<span className="material-symbols-outlined text-trust-gold text-sm" data-icon="star" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
</div>
</div>
<div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-transparent hover:border-primary/30 transition-all cursor-pointer">
<div className="flex items-center gap-4">
<div className="w-12 h-12 rounded-lg bg-secondary-container flex items-center justify-center text-primary">
<span className="material-symbols-outlined" data-icon="stadium">stadium</span>
</div>
<div>
<p className="font-label-md text-text-primary">Centro Esportivo Pinheiros</p>
<p className="text-body-md text-on-surface-variant">Av. das Nações Unidas, 1200 - SP</p>
</div>
</div>
<div className="flex items-center gap-2">
<span className="text-trust-gold font-bold text-body-md">4.5</span>
<span className="material-symbols-outlined text-trust-gold text-sm" data-icon="star" style={{   fontVariationSettings: '\'FILL\' 1' }}>star</span>
</div>
</div>
</div>
</div>
</div>
{/*  Drag & Drop Zone  */}
<div className="col-span-12 lg:col-span-5 flex flex-col gap-gutter">
<div className="bg-surface-container-lowest p-8 rounded-xl border-2 border-dashed border-outline-variant hover:border-primary transition-colors group text-center flex flex-col justify-center items-center h-full">
<div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined text-primary text-4xl" data-icon="upload_file">upload_file</span>
</div>
<h3 className="font-headline-md text-headline-md mb-2">Upload de Arquivos</h3>
<p className="text-body-md text-on-surface-variant px-10">Arraste seu CSV ou Excel aqui ou clique para selecionar do computador.</p>
<div className="mt-8 flex gap-4">
<div className="flex items-center gap-2 px-3 py-1 bg-surface-container rounded text-label-md text-on-surface-variant">
<span className="material-symbols-outlined text-sm" data-icon="check_circle">check_circle</span>
                                .CSV
                            </div>
<div className="flex items-center gap-2 px-3 py-1 bg-surface-container rounded text-label-md text-on-surface-variant">
<span className="material-symbols-outlined text-sm" data-icon="check_circle">check_circle</span>
                                .XLSX
                            </div>
</div>
</div>
</div>
{/*  Imported List with AI Status  */}
<div className="col-span-12 bg-surface-container-lowest rounded-xl border border-border-subtle shadow-sm overflow-hidden">
<div className="p-6 border-b border-border-subtle flex items-center justify-between bg-surface-bright/50">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-primary" data-icon="view_list">view_list</span>
<h3 className="font-headline-md text-headline-md">Fila de Importação Ativa</h3>
</div>
<div className="flex items-center gap-4">
<button className="flex items-center gap-2 text-primary font-label-md hover:underline">
<span className="material-symbols-outlined text-sm" data-icon="auto_awesome">auto_awesome</span>
                                Enriquecer tudo com AI
                            </button>
<button className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-md shadow-md">Continuar para Mapeamento</button>
</div>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead className="bg-surface-container-low">
<tr>
<th className="px-6 py-4 font-label-md text-on-surface-variant">ITEM</th>
<th className="px-6 py-4 font-label-md text-on-surface-variant">CATEGORIA</th>
<th className="px-6 py-4 font-label-md text-on-surface-variant">LOCALIZAÇÃO / GPS</th>
<th className="px-6 py-4 font-label-md text-on-surface-variant">ENRIQUECIMENTO AI</th>
<th className="px-6 py-4 font-label-md text-on-surface-variant">VALIDAÇÃO</th>
<th className="px-6 py-4"></th>
</tr>
</thead>
<tbody className="divide-y divide-border-subtle">
<tr className="hover:bg-surface transition-colors">
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded bg-outline-variant overflow-hidden">
<img className="w-full h-full object-cover" data-alt="A high-definition, overhead architectural photo of a professional beach tennis arena at sunset. The sand is a pristine white, illuminated by warm golden hour light and emerald-colored floodlights. The surrounding fence is sleek and modern. The overall aesthetic is high-performance, professional, and energetically sporty." src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_3YM9gddb9jYM21bp7658MzUTiFcynQxRuv24WLk-nUUQpebmcVlIBQUdxMy5FzCbGqN_l1dFEui43_v5vKq9XqkeU4s01ja7b-0omErTsSF95jEzcs7th3X6Cnv88vkwUyVYh6zVkFYN8BZFu92dlmwCGkGV1k22tbODGTxbLb45gyHugwgxCs56GnYtf5f_Z-RnCbl-g0X1lX6gkj5LZ_Lb08hHVAltmGawMkr5wUi_Z5dy7mJrlIfFwuOeRK2VSuyLnDNU" />
</div>
<span className="font-label-md text-text-primary">BT Paradise Jundiaí</span>
</div>
</td>
<td className="px-6 py-4">
<span className="text-body-md text-on-surface-variant">Espaço Esportivo</span>
</td>
<td className="px-6 py-4">
<div className="flex flex-col">
<span className="text-body-md">Jundiaí, SP</span>
<span className="text-[10px] text-primary">-23.1857, -46.8892</span>
</div>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-2 text-tertiary">
<span className="material-symbols-outlined text-sm animate-pulse" data-icon="generating_tokens">generating_tokens</span>
<span className="font-label-md italic">Gerando Descrição...</span>
</div>
</td>
<td className="px-6 py-4">
<span className="bg-success-mint text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase">Nenhum Duplicado</span>
</td>
<td className="px-6 py-4 text-right">
<button className="p-2 text-on-surface-variant hover:text-error transition-colors"><span className="material-symbols-outlined" data-icon="delete">delete</span></button>
</td>
</tr>
<tr className="hover:bg-surface transition-colors">
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded bg-outline-variant overflow-hidden">
<img className="w-full h-full object-cover" data-alt="A close-up, high-action photo of a professional tennis coach demonstrating a backhand stroke. The lighting is crisp and clear, highlighting the muscle definition and the texture of the tennis racket. The color palette features whites and deep emerald greens, creating a professional and athletic atmosphere. The background is a slightly blurred, high-end tennis court." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzyB-CjsBJ05ygOE2QsjUzXTgARj1OFDYCwLTvXviTyfV4zj_vH-fQez1DDyhQxowaS8RTc4low8WeUUQmCLaUAiqfmbswi9Y8dR6JIc8tYxk3CfCh5YLT_ReW_dj5AeXFpLw1AudIBGlNw92zRRC4Z135-ZvYtirbDkk-Add0bOhpydvGFEoE1ID-8rfFPMbtMSx36g3JDyuWhA4VmObrOPc9aC0nNQihINQKeQIXfSMJlDr0XKPQfGwsF1R1h93gjUqB1WIC" />
</div>
<span className="font-label-md text-text-primary">Ricardo Silva</span>
</div>
</td>
<td className="px-6 py-4">
<span className="text-body-md text-on-surface-variant">Profissional (Coach)</span>
</td>
<td className="px-6 py-4">
<div className="flex flex-col">
<span className="text-body-md">São Paulo, SP</span>
<span className="text-[10px] text-error">Coordenada Ausente</span>
</div>
</td>
<td className="px-6 py-4">
<div className="flex items-center gap-2 text-on-surface-variant">
<span className="material-symbols-outlined text-sm" data-icon="check_circle">check_circle</span>
<span className="font-label-md">Bio Criada via GPT</span>
</div>
</td>
<td className="px-6 py-4">
<span className="bg-error-container text-error px-3 py-1 rounded-full text-[10px] font-bold uppercase">Potencial Conflito</span>
</td>
<td className="px-6 py-4 text-right">
<button className="p-2 text-on-surface-variant hover:text-error transition-colors"><span className="material-symbols-outlined" data-icon="delete">delete</span></button>
</td>
</tr>
</tbody>
</table>
</div>
<div className="p-6 bg-surface-container-low flex justify-between items-center">
<p className="text-body-md text-on-surface-variant">Mostrando 2 de 58 itens detectados</p>
<div className="flex gap-2">
<button className="px-4 py-2 bg-surface-container-highest rounded text-label-md disabled:opacity-50" disabled>Anterior</button>
<button className="px-4 py-2 bg-surface-container-highest rounded text-label-md hover:bg-outline-variant transition-colors">Próximo</button>
</div>
</div>
</div>
{/*  Validation & GPS Preview Sidebar-like widget  */}
<div className="col-span-12 lg:col-span-4 bg-surface-container-lowest p-8 rounded-xl border border-border-subtle shadow-sm flex flex-col gap-6">
<h3 className="font-headline-md text-headline-md flex items-center gap-2">
<span className="material-symbols-outlined text-primary" data-icon="location_on">location_on</span>
                        Validação Geográfica
                    </h3>
<div className="w-full h-48 rounded-lg bg-surface-container overflow-hidden relative border border-border-subtle">
{/*  Placeholder for Map  */}
<div className="absolute inset-0 flex items-center justify-center bg-gray-200">
<img className="w-full h-full object-cover opacity-50 grayscale" data-alt="A stylized, minimalist digital map of a city grid in light mode. The map features clean lines and subtle emerald-green markers indicating various sports facilities. The aesthetic is professional and technical, resembling a high-end GPS dashboard for data administration." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAiQAlw3P-ML3Fxyh-yncal12E1sLMpC-XxB29zpaBFsvESXjegtVttBHFL1SydpoYxN3EqNI9jjVlWTZMObxdgbv2xyymFiZQ1ux3jKhcg445M-yp3ulf9f9Jd8uV5Ik9h9f-t6Pq6Jel3h5WbF0rX35NuIAsX_McZfG8dz3fb4PSwedTQ4PI_CIfmh9MfJYLp-k9g5iZS7FnBu6iheFlYYp1TWCyNyZWAgWOtd5fTqzME_7S8PHlntSfQeirHkgjudj0RXbsb" />
<div className="absolute inset-0 bg-primary/5"></div>
<div className="relative z-10 flex flex-col items-center">
<span className="material-symbols-outlined text-primary text-4xl mb-2" data-icon="map">map</span>
<span className="text-label-md font-bold text-primary">MAPA DE CALOR DE INGESTÃO</span>
</div>
</div>
</div>
<div className="space-y-4">
<div className="p-4 rounded-lg bg-success-mint/30 border border-success-mint flex justify-between items-center">
<span className="font-label-md text-primary">GPS Válidos</span>
<span className="font-stat-display text-primary">92%</span>
</div>
<div className="p-4 rounded-lg bg-error-container/20 border border-error-container flex justify-between items-center">
<span className="font-label-md text-error">Duplicados Prováveis</span>
<span className="font-stat-display text-error">04</span>
</div>
<div className="p-4 rounded-lg bg-secondary-container/20 border border-secondary-container flex justify-between items-center">
<span className="font-label-md text-secondary">Aguardando IA</span>
<span className="font-stat-display text-secondary">12</span>
</div>
</div>
</div>
{/*  Column Mapping Preview  */}
<div className="col-span-12 lg:col-span-8 bg-surface-container-lowest p-8 rounded-xl border border-border-subtle shadow-sm flex flex-col gap-6">
<div className="flex items-center justify-between">
<h3 className="font-headline-md text-headline-md flex items-center gap-2">
<span className="material-symbols-outlined text-primary" data-icon="schema">schema</span>
                            Sugestão de Mapeamento
                        </h3>
<button className="text-primary font-label-md flex items-center gap-1 hover:underline">
                            Configurar Manualmente
                            <span className="material-symbols-outlined text-sm" data-icon="arrow_forward">arrow_forward</span>
</button>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<div className="p-4 bg-surface rounded-lg flex items-center justify-between border border-border-subtle">
<span className="text-body-md font-bold text-on-surface-variant italic">Coluna CSV: "Title"</span>
<span className="material-symbols-outlined text-primary" data-icon="sync_alt">sync_alt</span>
<span className="font-label-md text-primary bg-primary/10 px-3 py-1 rounded">Nome do Espaço</span>
</div>
<div className="p-4 bg-surface rounded-lg flex items-center justify-between border border-border-subtle">
<span className="text-body-md font-bold text-on-surface-variant italic">Coluna CSV: "Lat/Long"</span>
<span className="material-symbols-outlined text-primary" data-icon="sync_alt">sync_alt</span>
<span className="font-label-md text-primary bg-primary/10 px-3 py-1 rounded">Geo-Coordenadas</span>
</div>
<div className="p-4 bg-surface rounded-lg flex items-center justify-between border border-border-subtle">
<span className="text-body-md font-bold text-on-surface-variant italic">Coluna CSV: "Phone"</span>
<span className="material-symbols-outlined text-primary" data-icon="sync_alt">sync_alt</span>
<span className="font-label-md text-primary bg-primary/10 px-3 py-1 rounded">Contato Comercial</span>
</div>
<div className="p-4 bg-surface rounded-lg flex items-center justify-between border border-border-subtle">
<span className="text-body-md font-bold text-on-surface-variant italic">Coluna CSV: "Reviews"</span>
<span className="material-symbols-outlined text-primary" data-icon="sync_alt">sync_alt</span>
<span className="font-label-md text-primary bg-primary/10 px-3 py-1 rounded">Score Inicial</span>
</div>
</div>
<div className="flex justify-end mt-8">
  <button 
    onClick={handleImport}
    disabled={importing}
    className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2 shadow-md shadow-primary/10 text-sm"
  >
    {importing ? 'A Ingerir Dados...' : 'Confirmar e Ingerir na Base de Dados'}
  </button>
</div>
</div>
</div>
{success && (
  <div className="fixed bottom-8 right-8 bg-inverse-surface text-inverse-on-surface px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
    <span className="material-symbols-outlined text-primary-fixed">check_circle</span>
    <p className="font-label-md text-label-md">Dados de espaços importados com sucesso para a base de dados!</p>
  </div>
)}
    </div>
  )
}
