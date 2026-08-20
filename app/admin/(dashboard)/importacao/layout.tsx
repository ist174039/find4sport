import type { ReactNode } from 'react'
import { ImportFormatDialog } from '@/components/admin/import-format-dialog'
export default function ImportLayout({children}:{children:ReactNode}){return <div><div className="flex justify-end px-4 pt-4 print:hidden sm:px-6 lg:px-8"><ImportFormatDialog/></div>{children}</div>}
