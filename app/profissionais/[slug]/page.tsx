'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { ReportModal } from '@/components/report-modal'
import { FollowButton } from '@/components/follow-button'
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  Heart,
  Share2,
  MessageCircle,
  CheckCircle,
  Clock,
  Award,
  Users,
  Calendar,
  ArrowLeft,
  Flag,
} from 'lucide-react'
import type { Professional, Service, Category, Review } from '@/lib/types'

interface ProfessionalWithDetails extends Professional {
  categories: Category[]
  services: Service[]
  reviews: Review[]
}

export default function ProfessionalDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [professional, setProfessional] = useState<ProfessionalWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorited, setIsFavorited] = useState(false)

  useEffect(() => {
    async function fetchProfessional() {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('professionals')
        .select(`
          *,
          professional_categories(
            category:categories(*)
          ),
          services(*),
          reviews(*)
        `)
        .eq('public_slug', slug)
        .eq('status', 'approved')
        .single()

      if (error) {
        console.error('Error fetching professional:', error)
        setLoading(false)
        return
      }

      if (data) {
        const transformedData: ProfessionalWithDetails = {
          ...data,
          categories: data.professional_categories?.map((pc: { category: Category }) => pc.category) || [],
          services: data.services || [],
          reviews: data.reviews || [],
        }
        setProfessional(transformedData)
      }
      setLoading(false)
    }

    if (slug) {
      fetchProfessional()
    }
  }, [slug])

  const handleFavorite = async () => {
    setIsFavorited(!isFavorited)
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: professional?.professional_name || professional?.full_name,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-32 mb-6" />
            <div className="flex flex-col md:flex-row gap-8">
              <Skeleton className="h-64 w-64 rounded-xl" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!professional) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center py-16">
            <h1 className="text-2xl font-bold mb-4">Profissional nao encontrado</h1>
            <p className="text-muted-foreground mb-6">
              O profissional que procura nao existe ou foi removido.
            </p>
            <Button asChild>
              <Link href="/profissionais">Ver todos os profissionais</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const displayName = professional.professional_name || professional.full_name
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto">
            <Link
              href="/profissionais"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar aos profissionais
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-6">
                      <Avatar className="h-32 w-32 rounded-xl">
                        <AvatarImage src={professional.avatar_url || undefined} alt={displayName} />
                        <AvatarFallback className="rounded-xl text-2xl bg-primary/10 text-primary">
                          {initials}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h1 className="text-2xl font-bold">{displayName}</h1>
                              {professional.is_verified && (
                                <CheckCircle className="h-5 w-5 text-primary fill-primary/20" />
                              )}
                            </div>
                            {professional.address && (
                              <p className="text-muted-foreground flex items-center gap-1 mt-1">
                                <MapPin className="h-4 w-4" />
                                {professional.address}
                              </p>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={handleFavorite}
                              className={isFavorited ? 'text-red-500' : ''}
                            >
                              <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
                            </Button>
                            <Button variant="outline" size="icon" onClick={handleShare}>
                              <Share2 className="h-4 w-4" />
                            </Button>
                            <FollowButton
                              professionalId={professional.id}
                              className="hidden sm:flex"
                            />
                            <ReportModal professionalId={professional.id}>
                              <Button variant="outline" size="icon">
                                <Flag className="h-4 w-4" />
                              </Button>
                            </ReportModal>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-4">
                          {professional.categories.map((category) => (
                            <Badge key={category.id} variant="secondary">
                              {category.emoji} {category.name}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
                          {professional.rating_avg > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{professional.rating_avg.toFixed(1)}</span>
                              <span className="text-muted-foreground">
                                ({professional.review_count} avaliacoes)
                              </span>
                            </div>
                          )}
                          {professional.service_radius_km && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              Ate {professional.service_radius_km}km
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Tabs defaultValue="sobre" className="w-full">
                  <TabsList className="w-full justify-start">
                    <TabsTrigger value="sobre">Sobre</TabsTrigger>
                    <TabsTrigger value="servicos">Servicos</TabsTrigger>
                    <TabsTrigger value="avaliacoes">Avaliacoes</TabsTrigger>
                  </TabsList>

                  <TabsContent value="sobre" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Sobre mim</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed">
                          {professional.bio || 'Este profissional ainda nao adicionou uma descricao.'}
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="servicos" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Servicos oferecidos</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {professional.services.length > 0 ? (
                          <div className="space-y-4">
                            {professional.services.map((service) => (
                              <div
                                key={service.id}
                                className="flex items-start justify-between p-4 rounded-lg border"
                              >
                                <div>
                                  <h4 className="font-medium">{service.name}</h4>
                                  {service.description && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {service.description}
                                    </p>
                                  )}
                                  {service.duration_minutes && (
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                                      <Clock className="h-3 w-3" />
                                      {service.duration_minutes} min
                                    </div>
                                  )}
                                </div>
                                {service.price && (
                                  <div className="text-right">
                                    <p className="font-semibold text-primary">
                                      {service.price.toFixed(2)}€
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      /{service.price_unit || 'sessao'}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">
                            Este profissional ainda nao adicionou servicos.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="avaliacoes" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Avaliacoes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {professional.reviews.length > 0 ? (
                          <div className="space-y-4">
                            {professional.reviews.map((review) => (
                              <div key={review.id} className="p-4 rounded-lg border">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${
                                          i < review.rating
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-muted-foreground">
                                    {new Date(review.created_at).toLocaleDateString('pt-PT')}
                                  </span>
                                </div>
                                {review.title && <h4 className="font-medium">{review.title}</h4>}
                                {review.comment && (
                                  <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">
                            Este profissional ainda nao tem avaliacoes.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Contactar</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Enviar mensagem
                    </Button>

                    <Separator />

                    <div className="space-y-3">
                      {professional.email && (
                        <a
                          href={`mailto:${professional.email}`}
                          className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                        >
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {professional.email}
                        </a>
                      )}
                      {professional.phone && (
                        <a
                          href={`tel:${professional.phone}`}
                          className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                        >
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {professional.phone}
                        </a>
                      )}
                      {professional.website && (
                        <a
                          href={professional.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                        >
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          Website
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Estatisticas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
                        <p className="text-2xl font-bold">{professional.views_count}</p>
                        <p className="text-xs text-muted-foreground">Visualizacoes</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <Star className="h-5 w-5 mx-auto mb-1 text-primary" />
                        <p className="text-2xl font-bold">{professional.review_count}</p>
                        <p className="text-xs text-muted-foreground">Avaliacoes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
