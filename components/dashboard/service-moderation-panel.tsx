import {submitServiceForReview} from '@/app/dashboard/servicos/actions'
import {Button} from '@/components/ui/button'
import type { Tables } from '@/lib/supabase-types'

type Service = Pick<Tables<'services'>, 'id' | 'name' | 'moderation_status' | 'moderation_reason'>

export function ServiceModerationPanel({services}:{services:Service[]}){return <section className="space-y-3"><h2 className="text-xl font-bold">Validação</h2><p className="text-sm text-muted-foreground">Só serviços aprovados ficam públicos.</p>{services.map(s=><div key={s.id} className="rounded-xl border p-4"><div className="flex justify-between gap-3"><b>{s.name}</b><span className="text-sm">{s.moderation_status}</span></div>{s.moderation_reason&&<p className="mt-2 text-sm text-destructive">{s.moderation_reason}</p>}{['draft','rejected'].includes(s.moderation_status)&&<form action={async () => { await submitServiceForReview(s.id) }} className="mt-3"><Button type="submit">Submeter para validação</Button></form>}</div>)}</section>}
