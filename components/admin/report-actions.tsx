'use client'
import Link from 'next/link'
import { Download, FileText, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
export function ReportActions({from,to}:{from:string;to:string}){const q=new URLSearchParams({from,to}).toString();return <div className="flex flex-wrap gap-2 print:hidden"><Button type="button" variant="outline" onClick={()=>window.print()}><Printer className="mr-2 h-4 w-4"/>Imprimir</Button><Button asChild variant="outline"><Link href={`/admin/relatorios/export.xlsx?${q}`}><Download className="mr-2 h-4 w-4"/>Excel</Link></Button><Button asChild variant="outline"><Link href={`/admin/relatorios/export.pdf?${q}`}><FileText className="mr-2 h-4 w-4"/>PDF</Link></Button></div>}
