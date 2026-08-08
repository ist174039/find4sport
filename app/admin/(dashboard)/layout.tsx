import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/sidebar'
import { resolveAdminSidebarUser, resolveSessionAccess } from '@/lib/auth/access'

export default async function AdminLayout({
 children,
}: {
 children: React.ReactNode
}) {
 const supabase = await createClient()
 const { data: { user } } = await supabase.auth.getUser()

 if (!user) {
  redirect('/admin/login')
 }

 const access = await resolveSessionAccess(supabase, user)

 if (!access || !access.canAccessAdmin) {
  redirect('/admin/login?error=unauthorized')
 }

 const adminUser = await resolveAdminSidebarUser(supabase, user)

 return (
  <div className="min-h-screen bg-muted/30 w-full overflow-x-hidden">
   <div className="flex w-full">
   <AdminSidebar adminUser={adminUser || { role: 'general' }} />
    <main className="flex-1 w-full min-w-0 p-6 pt-20 lg:p-8 ml-0 lg:ml-64">
     <div className="max-w-6xl mx-auto w-full">
      {children}
     </div>
    </main>
   </div>
  </div>
 )
}
