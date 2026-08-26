'use client'

import { useEffect } from 'react'
import { Download, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PrintReceiptButton({ autoPrint = false }: { autoPrint?: boolean }) {
  useEffect(() => { if (autoPrint) { const timer = window.setTimeout(() => window.print(), 350); return () => window.clearTimeout(timer) } }, [autoPrint])
  return <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4"/><Download className="mr-2 h-4 w-4"/>Guardar comprovativo</Button>
}
