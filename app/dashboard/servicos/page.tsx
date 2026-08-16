import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ServicesManager } from '@/components/dashboard/services-manager'
import { ServicePackagesManager } from '@/components/dashboard/service-packages-manager'
import { isFeatureEnabled } from '@/lib/billing/entitlements'

function missingTable(error:any){return ['42P01','PGRST205'].includes(String(error?.code||''))||String(error?.message||'').includes('service_packages')}

export default async function ServicesPage() {
  const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser();if(!user)redirect('/auth/login?redirect=/dashboard/servicos')
  const admin=createAdminClient();const{data:professional}=await admin.from('professionals').select('id').eq('user_id',user.id).maybeSingle();if(!professional)redirect('/dashboard')
  const[{data:services,error:servicesError},packagesEnabled]=await Promise.all([admin.from('services').select('*').eq('professional_id',professional.id).order('created_at',{ascending:false}),isFeatureEnabled(user.id,'services.packages.enabled')]);if(servicesError)throw new Error(`Não foi possível carregar os serviços: ${servicesError.message}`)
  let packages:any[]=[];let packagesAvailable=true
  const db=admin as any;const packageResult=await db.from('service_packages').select('*').eq('professional_id',professional.id).order('created_at',{ascending:false})
  if(packageResult.error){if(missingTable(packageResult.error))packagesAvailable=false;else throw new Error(`Não foi possível carregar os pacotes: ${packageResult.error.message}`)}else packages=packageResult.data||[]
  return <div className="space-y-10"><ServicesManager initialServices={(services||[]) as any}/><ServicePackagesManager services={(services||[]) as any} initialPackages={packages} enabled={packagesEnabled} available={packagesAvailable}/></div>
}
