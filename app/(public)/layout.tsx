import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { MobileBottomBar } from '@/components/mobile-bottom-bar'
import { createClient } from '@/lib/supabase/server'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .is('read_at', null)
    
    notificationCount = count || 0
  }

  return (
    <>
      <Header user={userProfile} notificationCount={notificationCount} />
      <main className="min-h-screen bg-background text-foreground overflow-hidden flex flex-col pb-16 md:pb-0">
        {children}
      </main>
      <Footer />
      <MobileBottomBar userProfile={userProfile} />
    </>
  )
}
