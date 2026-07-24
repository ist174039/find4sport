import { CalendarCheck, Construction } from 'lucide-react'

export default function ReservasPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestão de Reservas</h1>
        <p className="text-muted-foreground mt-2">
          Gira as reservas do seu espaço e horários disponíveis.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center p-12 bg-card border border-border rounded-2xl shadow-sm text-center space-y-4">
        <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-2">
          <Construction className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Em Desenvolvimento</h2>
        <p className="text-muted-foreground max-w-md">
          A funcionalidade de Gestão de Reservas está atualmente em desenvolvimento e ficará disponível em breve.
        </p>
      </div>
    </div>
  )
}
