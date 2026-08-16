import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/sidebar'
import { resolveAdminSidebarUser, resolveSessionAccess } from '@/lib/auth/access'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const access = await resolveSessionAccess(supabase, user)
  if (!access || !access.canAccessAdmin) redirect('/admin/login?error=unauthorized')

  const adminUser = await resolveAdminSidebarUser(supabase, user)

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-muted/30">
      <div className="flex w-full">
        <AdminSidebar adminUser={adminUser || { role: 'general' }} />
        <main className="ml-0 w-full min-w-0 flex-1 px-4 pb-8 pt-20 sm:px-6 lg:ml-64 lg:p-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
