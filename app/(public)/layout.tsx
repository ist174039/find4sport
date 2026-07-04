import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
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

  const notificationCount = 0

  return (
    <>
      <Header user={userProfile} notificationCount={notificationCount} />
      <main className="min-h-screen bg-background text-text-primary overflow-hidden flex flex-col">
        {children}
      </main>
      <Footer />
    </>
  )
}
