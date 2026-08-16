'use client'

import { ArrowUpRight, MapPin, Star } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import Link from 'next/link'

type UserLocation = { latitude: number; longitude: number } | null
type MapItem = { id:string; itemType:string; title:string; address?:string|null; mapAddress?:string|null; latitude?:number|null; longitude?:number|null; image_url?:string|null; link:string; is_verified?:boolean; rating_avg?:number|null; distanceKm?:number|null }

const labels:Record<string,{symbol:string;label:string}>={space:{symbol:'S',label:'Espaço'},professional:{symbol:'P',label:'Profissional'},event:{symbol:'E',label:'Evento'},community:{symbol:'C',label:'Comunidade'}}
function icon(type:string,verified:boolean){const meta=labels[type]||labels.space;return L.divIcon({className:'f4s-marker-wrapper',html:`<div class="f4s-marker f4s-marker-${type}" title="${meta.label}"><span class="f4s-marker-symbol">${meta.symbol}</span>${verified?'<span class="f4s-marker-check">✓</span>':''}</div>`,iconSize:[38,50],iconAnchor:[19,46],popupAnchor:[0,-40]})}
const userIcon=L.divIcon({className:'f4s-user-marker-wrapper',html:'<div class="f4s-user-marker"><span></span></div>',iconSize:[24,24],iconAnchor:[12,12]})

function Fit({items,userLocation}:{items:MapItem[];userLocation:UserLocation}){const map=useMap();useEffect(()=>{const points:[number,number][]=items.filter(i=>Number.isFinite(Number(i.latitude))&&Number.isFinite(Number(i.longitude))).map(i=>[Number(i.latitude),Number(i.longitude)]);if(userLocation)points.push([userLocation.latitude,userLocation.longitude]);if(points.length>1)map.fitBounds(L.latLngBounds(points),{padding:[50,50],maxZoom:14});else if(points.length===1)map.setView(points[0],13)},[items,map,userLocation]);return null}
function Resize(){const map=useMap();useEffect(()=>{const o=new ResizeObserver(()=>map.invalidateSize());o.observe(map.getContainer());const f=()=>[50,150,300].forEach(ms=>setTimeout(()=>map.invalidateSize(),ms));window.addEventListener('map-toggle',f);return()=>{o.disconnect();window.removeEventListener('map-toggle',f)}},[map]);return null}

async function geocode(query:string){
  const key=`f4s_geo:${query.toLowerCase()}`
  try{const cached=sessionStorage.getItem(key);if(cached)return JSON.parse(cached) as {latitude:number;longitude:number}}
  catch{}
  const url=`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=pt&q=${encodeURIComponent(query)}`
  const response=await fetch(url,{headers:{'Accept-Language':'pt-PT,pt;q=0.9'}})
  if(!response.ok)return null
  const rows=await response.json();const row=Array.isArray(rows)?rows[0]:null
  if(!row)return null
  const value={latitude:Number(row.lat),longitude:Number(row.lon)}
  if(!Number.isFinite(value.latitude)||!Number.isFinite(value.longitude))return null
  try{sessionStorage.setItem(key,JSON.stringify(value))}catch{}
  return value
}

export function PesquisaMap({items=[],userLocation=null}:{items?:MapItem[];userLocation?:UserLocation}){
  const [mounted,setMounted]=useState(false)
  const [resolved,setResolved]=useState<MapItem[]>(items)
  useEffect(()=>setMounted(true),[])
  useEffect(()=>{setResolved(items);let cancelled=false;void(async()=>{const pending=items.filter(i=>!(Number.isFinite(Number(i.latitude))&&Number.isFinite(Number(i.longitude)))&&Boolean(i.mapAddress)).slice(0,20);for(const item of pending){if(cancelled)return;const coords=await geocode(String(item.mapAddress));if(coords&&!cancelled)setResolved(current=>current.map(x=>x.id===item.id?{...x,...coords}:x));await new Promise(r=>setTimeout(r,1050))}})();return()=>{cancelled=true}},[items])
  const plotted=useMemo(()=>resolved.filter(i=>Number.isFinite(Number(i.latitude))&&Number.isFinite(Number(i.longitude))),[resolved])
  const center:[number,number]=userLocation?[userLocation.latitude,userLocation.longitude]:plotted.length?[Number(plotted[0].latitude),Number(plotted[0].longitude)]:[38.7223,-9.1393]
  if(!mounted)return <div className="flex h-full items-center justify-center bg-muted text-sm text-muted-foreground">A carregar mapa...</div>
  const unresolved=resolved.length-plotted.length
  return <div className="absolute inset-0 z-0 bg-[#e7edf2]">
    <style dangerouslySetInnerHTML={{__html:`.f4s-map-popup-premium .leaflet-popup-content-wrapper{padding:0;overflow:hidden;border-radius:.9rem;box-shadow:0 12px 35px rgba(0,0,0,.18)}.f4s-map-popup-premium .leaflet-popup-content{margin:0;width:100%!important}.f4s-user-marker{width:24px;height:24px;border-radius:9999px;background:#fff;display:grid;place-items:center;box-shadow:0 2px 10px rgba(0,0,0,.25)}.f4s-user-marker span{width:12px;height:12px;border-radius:9999px;background:#2563eb;border:2px solid #dbeafe;box-shadow:0 0 0 5px rgba(37,99,235,.18)}`}}/>
    <MapContainer center={center} zoom={12} scrollWheelZoom zoomControl={false} style={{height:'100%',width:'100%'}}><TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/><ZoomControl position="topright"/>
      {userLocation&&<Marker position={[userLocation.latitude,userLocation.longitude]} icon={userIcon}><Popup><strong>A tua localização</strong><br/><span className="text-xs">A pesquisa prioriza resultados próximos.</span></Popup></Marker>}
      {plotted.map(item=><Marker key={item.id} position={[Number(item.latitude),Number(item.longitude)]} icon={icon(item.itemType,Boolean(item.is_verified))}><Popup className="f4s-map-popup-premium" minWidth={250}><div className="overflow-hidden bg-card">{item.image_url&&<img src={item.image_url} alt={item.title} className="h-32 w-full object-cover"/>}<div className="p-3"><div className="mb-1 flex items-start justify-between gap-2"><div><span className="text-[10px] font-bold uppercase text-primary">{labels[item.itemType]?.label||'Resultado'}</span><h3 className="font-bold">{item.title}</h3></div>{Number(item.rating_avg||0)>0&&<span className="flex items-center gap-1 text-xs font-bold"><Star className="h-3 w-3 fill-amber-500 text-amber-500"/>{Number(item.rating_avg).toFixed(1)}</span>}</div>{item.address&&<p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3"/>{item.address}</p>}<Link href={item.link} className="mt-3 flex items-center justify-center rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground">Ver detalhes <ArrowUpRight className="ml-1 h-3.5 w-3.5"/></Link></div></div></Popup></Marker>)}
      <Fit items={plotted} userLocation={userLocation}/><Resize/>
    </MapContainer>
    {unresolved>0&&<div className="pointer-events-none absolute left-3 top-3 z-[400] rounded-lg border bg-background/90 px-3 py-2 text-[11px] text-muted-foreground shadow-sm">A localizar {unresolved} resultado{unresolved===1?'':'s'}…</div>}
  </div>
}
