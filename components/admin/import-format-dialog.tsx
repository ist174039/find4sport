'use client'
import { FileJson, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
const jsonExample=`[
  {
    "name": "Clube Desportivo Exemplo",
    "address": "Rua Exemplo 10, Lisboa",
    "latitude": 38.7223,
    "longitude": -9.1393,
    "phone": "+351 210 000 000",
    "description": "Instalações desportivas"
  }
]`
const csvExample=`name,address,latitude,longitude,phone,description
"Clube Desportivo Exemplo","Rua Exemplo 10, Lisboa",38.7223,-9.1393,"+351 210 000 000","Instalações desportivas"`
export function ImportFormatDialog(){return <Dialog><DialogTrigger render={<Button variant="outline" className="min-h-11"><FileJson className="mr-2 h-4 w-4"/>Ver formato CSV / JSON</Button>}/><DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl"><DialogHeader><DialogTitle>Formato dos ficheiros de importação</DialogTitle><DialogDescription>A importação cria espaços pendentes. Registos inválidos ou duplicados são rejeitados/ignorados antes da escrita.</DialogDescription></DialogHeader><div className="space-y-5 pt-2"><section className="grid gap-3 sm:grid-cols-2"><div className="rounded-xl border p-4"><h3 className="font-semibold">Campos obrigatórios</h3><dl className="mt-3 space-y-2 text-sm"><Field name="name" aliases="nome, title"/><Field name="address" aliases="endereco, location"/><Field name="latitude" aliases="lat"/><Field name="longitude" aliases="lon, lng"/></dl></div><div className="rounded-xl border p-4"><h3 className="font-semibold">Campos opcionais</h3><dl className="mt-3 space-y-2 text-sm"><Field name="phone" aliases="telefone"/><Field name="description" aliases="descricao"/></dl><p className="mt-3 text-xs text-muted-foreground">Não são aceites ratings, reviews, imagens, emails inventados ou coordenadas fora dos limites geográficos.</p></div></section><section><div className="mb-2 flex items-center gap-2"><FileJson className="h-4 w-4 text-primary"/><h3 className="font-semibold">Exemplo JSON</h3></div><pre className="overflow-x-auto rounded-xl bg-muted p-4 text-xs leading-5"><code>{jsonExample}</code></pre></section><section><div className="mb-2 flex items-center gap-2"><FileSpreadsheet className="h-4 w-4 text-primary"/><h3 className="font-semibold">Exemplo CSV</h3></div><pre className="overflow-x-auto rounded-xl bg-muted p-4 text-xs leading-5"><code>{csvExample}</code></pre></section><section className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm"><p className="font-semibold">Limites e validação</p><ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground"><li>Máximo 2 MB por ficheiro.</li><li>Máximo 500 registos por importação.</li><li>Latitude entre -90 e 90; longitude entre -180 e 180.</li><li>CSV suporta valores entre aspas e aspas escapadas.</li><li>Duplicados são identificados por nome + morada normalizados.</li></ul></section></div></DialogContent></Dialog>}
function Field({name,aliases}:{name:string;aliases:string}){return <div><dt className="font-mono font-semibold">{name}</dt><dd className="text-xs text-muted-foreground">Aliases aceites: {aliases}</dd></div>}
