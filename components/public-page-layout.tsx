import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { createClient } from '@/lib/supabase/server'

interface PublicPageLayoutProps {
  children: React.ReactNode
}

export default async function PublicPageLayout({ children }: PublicPageLayoutProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const userProfile = user ? {
    id: user.id,
    email: user.email || '',
    full_name: user.user_metadata?.full_name,
    avatar_url: user.user_metadata?.avatar_url,
  } : null

  return (
    <>
      <Header user={userProfile} />
      <main className="flex-1 min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  )
}
