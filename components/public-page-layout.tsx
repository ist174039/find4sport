import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { createClient } from '@/lib/supabase/server'

interface PublicPageLayoutProps {
  children: React.ReactNode
}

export default async function PublicPageLayout({ children }: PublicPageLayoutProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <>
      <Header user={user} />
      <main className="flex-1 min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  )
}
