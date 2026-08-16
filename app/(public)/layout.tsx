import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { MobileBottomBar } from '@/components/mobile-bottom-bar'
import { LocationSync } from '@/components/location-sync'
import { createClient } from '@/lib/supabase/server'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const userProfile = user ? {
    id: user.id,
    email: user.email || '',
    full_name: user.user_metadata?.full_name,
    avatar_url: user.user_metadata?.avatar_url,
  } : null

  let notificationCount = 0
  if (user) {
    const { count } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', user.id).is('read_at', null)
    notificationCount = count || 0
  }

  return <>
    <LocationSync />
    <Header user={userProfile} notificationCount={notificationCount} />
    <main className="flex min-h-screen flex-col overflow-hidden bg-background pb-16 text-foreground md:pb-0">{children}</main>
    <Footer />
    <MobileBottomBar userProfile={userProfile} />
  </>
}
