'use client'

import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

type FlyerPlan={name:string;description:string|null;monthly_price:number|null;annual_price:number|null;audience:string;features:string[]}
export function PlanFlyerDownload({plan}:{plan:FlyerPlan}){
 function download(){const esc=(v:string)=>v.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]||c));const features=plan.features.slice(0,8).map((f,i)=>`<text x="70" y="${370+i*42}" font-family="Arial" font-size="22" fill="#18343a">✓ ${esc(f)}</text>`).join('');const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350"><rect width="1080" height="1350" fill="#f3fffc"/><rect width="1080" height="240" fill="#0f766e"/><text x="70" y="105" font-family="Arial" font-weight="700" font-size="44" fill="white">Find4Sport</text><text x="70" y="175" font-family="Arial" font-weight="700" font-size="56" fill="white">${esc(plan.name)}</text><text x="70" y="300" font-family="Arial" font-size="26" fill="#35585d">${esc(plan.description||'Plano para crescer no desporto.')}</text>${features}<rect x="70" y="1080" width="940" height="170" rx="30" fill="#0f766e"/><text x="110" y="1155" font-family="Arial" font-size="36" fill="white">Desde ${Number(plan.monthly_price||0).toFixed(2)} € / mês</text><text x="110" y="1210" font-family="Arial" font-size="24" fill="#ccfbf1">find4sport.vercel.app</text></svg>`;const blob=new Blob([svg],{type:'image/svg+xml;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`find4sport-${plan.name.toLowerCase().replace(/[^a-z0-9]+/g,'-')}.svg`;a.click();URL.revokeObjectURL(url)}
 return <Button type="button" variant="outline" className="min-h-11 w-full" onClick={download}><Download className="mr-2 h-4 w-4"/>Descarregar flyer</Button>
}
