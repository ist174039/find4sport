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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { ReportModal } from '@/components/report-modal'
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
  Users,
  ArrowLeft,
  Navigation,
  Flag,
  CalendarCheck,
} from 'lucide-react'
import type { SportSpace, Category, Review } from '@/lib/types'

interface SpaceWithDetails extends SportSpace {
  categories: Category[]
  reviews: Review[]
}

export default function SpaceDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [space, setSpace] = useState<SpaceWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorited, setIsFavorited] = useState(false)

  useEffect(() => {
    async function fetchSpace() {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('sport_spaces')
        .select(`
          *,
          space_categories(
            category:categories(*)
          ),
          reviews(*)
        `)
        .eq('slug', slug)
        .eq('status', 'approved')
        .single()

      if (error) {
        console.error('Error fetching space:', error)
        setLoading(false)
        return
      }

      if (data) {
        const transformedData: SpaceWithDetails = {
          ...data,
          categories: data.space_categories?.map((sc: { category: Category }) => sc.category) || [],
          reviews: data.reviews || [],
        }
        setSpace(transformedData)
      }
      setLoading(false)
    }

    if (slug) {
      fetchSpace()
    }
  }, [slug])

  const handleFavorite = async () => {
    setIsFavorited(!isFavorited)
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: space?.name,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const getDirectionsUrl = () => {
    if (space?.latitude && space?.longitude) {
      return `https://www.google.com/maps/dir/?api=1&destination=${space.latitude},${space.longitude}`
    }
    if (space?.address) {
      return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(space.address)}`
    }
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-32 mb-6" />
            <Skeleton className="h-64 w-full rounded-xl mb-6" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!space) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center py-16">
            <h1 className="text-2xl font-bold mb-4">Espaco nao encontrado</h1>
            <p className="text-muted-foreground mb-6">
              O espaco que procura nao existe ou foi removido.
            </p>
            <Button asChild>
              <Link href="/espacos">Ver todos os espacos</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const openingHours = space.opening_hours as Record<string, { open: string; close: string }> | null
  const weekdays = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo']
  const weekdayLabels: Record<string, string> = {
    segunda: 'Segunda-feira',
    terca: 'Terca-feira',
    quarta: 'Quarta-feira',
    quinta: 'Quinta-feira',
    sexta: 'Sexta-feira',
    sabado: 'Sabado',
    domingo: 'Domingo',
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto">
            <Link
              href="/espacos"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar aos espacos
            </Link>

            {space.gallery_urls && space.gallery_urls.length > 0 && (
              <div className="rounded-xl overflow-hidden mb-6 aspect-video bg-muted">
                <img
                  src={space.gallery_urls[0]}
                  alt={space.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h1 className="text-2xl font-bold">{space.name}</h1>
                          {space.is_verified && (
                            <CheckCircle className="h-5 w-5 text-primary fill-primary/20" />
                          )}
                        </div>
                        {space.address && (
                          <p className="text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="h-4 w-4" />
                            {space.address}
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
                        <Button variant="outline" size="icon" asChild>
                          <Link href={`/reservar/${space.slug || space.id}`}>
                            <CalendarCheck className="h-4 w-4" />
                          </Link>
                        </Button>
                        <ReportModal spaceId={space.id}>
                          <Button variant="outline" size="icon">
                            <Flag className="h-4 w-4" />
                          </Button>
                        </ReportModal>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {space.categories.map((category) => (
                        <Badge key={category.id} variant="secondary">
                          {category.emoji} {category.name}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
                      {space.rating_avg > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{space.rating_avg.toFixed(1)}</span>
                          <span className="text-muted-foreground">
                            ({space.review_count} avaliacoes)
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Tabs defaultValue="sobre" className="w-full">
                  <TabsList className="w-full justify-start">
                    <TabsTrigger value="sobre">Sobre</TabsTrigger>
                    <TabsTrigger value="horarios">Horarios</TabsTrigger>
                    <TabsTrigger value="comodidades">Comodidades</TabsTrigger>
                    <TabsTrigger value="avaliacoes">Avaliacoes</TabsTrigger>
                  </TabsList>

                  <TabsContent value="sobre" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Sobre o espaco</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed">
                          {space.description || 'Este espaco ainda nao adicionou uma descricao.'}
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="horarios" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Horario de funcionamento</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {openingHours && Object.keys(openingHours).length > 0 ? (
                          <div className="space-y-2">
                            {weekdays.map((day) => {
                              const hours = openingHours[day]
                              return (
                                <div
                                  key={day}
                                  className="flex justify-between py-2 border-b last:border-0"
                                >
                                  <span className="font-medium">{weekdayLabels[day]}</span>
                                  <span className="text-muted-foreground">
                                    {hours ? `${hours.open} - ${hours.close}` : 'Fechado'}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">
                            Horarios nao disponiveis.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="comodidades" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Comodidades</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {space.amenities && space.amenities.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {space.amenities.map((amenity, index) => (
                              <Badge key={index} variant="outline">
                                {amenity}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">
                            Comodidades nao listadas.
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
                        {space.reviews.length > 0 ? (
                          <div className="space-y-4">
                            {space.reviews.map((review) => (
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
                            Este espaco ainda nao tem avaliacoes.
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

                    {getDirectionsUrl() && (
                      <Button variant="outline" className="w-full gap-2" asChild>
                        <a href={getDirectionsUrl()!} target="_blank" rel="noopener noreferrer">
                          <Navigation className="h-4 w-4" />
                          Obter direcoes
                        </a>
                      </Button>
                    )}

                    <Separator />

                    <div className="space-y-3">
                      {space.email && (
                        <a
                          href={`mailto:${space.email}`}
                          className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                        >
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {space.email}
                        </a>
                      )}
                      {space.phone && (
                        <a
                          href={`tel:${space.phone}`}
                          className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                        >
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {space.phone}
                        </a>
                      )}
                      {space.website && (
                        <a
                          href={space.website}
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
                        <p className="text-2xl font-bold">{space.views_count}</p>
                        <p className="text-xs text-muted-foreground">Visualizacoes</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <Star className="h-5 w-5 mx-auto mb-1 text-primary" />
                        <p className="text-2xl font-bold">{space.review_count}</p>
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
