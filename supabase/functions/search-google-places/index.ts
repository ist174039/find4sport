// Follow this setup guide to integrate the Deno runtime into VS Code:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface SearchRequest {
  query: string
  location?: string
  type?: string
}

interface PlaceResult {
  name: string
  address: string
  place_id: string
  rating?: number
  user_ratings_total?: number
  types: string[]
  geometry: {
    lat: number
    lng: number
  }
  phone?: string
  website?: string
  opening_hours?: string[]
  photos?: string[]
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  try {
    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY')
    if (!apiKey) {
      throw new Error('GOOGLE_PLACES_API_KEY não configurada')
    }

    const { query, location, type } = await req.json() as SearchRequest

    if (!query || query.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: 'Query deve ter pelo menos 2 caracteres' }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    // Search using Google Places API (New) - Text Search
    const searchUrl = new URL('https://places.googleapis.com/v1/places:searchText')
    const body: Record<string, unknown> = {
      textQuery: query,
      // Return only sport/recreation related results
      includedType: type || 'sports_activity_location',
      languageCode: 'pt-PT',
      maxResultCount: 20,
    }

    if (location) {
      body.locationBias = {
        textQuery: location,
      }
    }

    const response = await fetch(searchUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.types,places.location,places.internationalPhoneNumber,places.websiteUri,places.regularOpeningHours,places.photos',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Google Places API error:', response.status, errText)
      throw new Error(`Google Places API: ${response.status}`)
    }

    const data = await response.json()
    const places: PlaceResult[] = (data.places || []).map((place: Record<string, unknown>) => ({
      name: (place.displayName as Record<string, string>)?.text || 'Sem nome',
      address: place.formattedAddress as string || '',
      place_id: place.id as string,
      rating: place.rating as number | undefined,
      user_ratings_total: place.userRatingCount as number | undefined,
      types: (place.types as string[]) || [],
      geometry: {
        lat: (place.location as Record<string, number>)?.latitude || 0,
        lng: (place.location as Record<string, number>)?.longitude || 0,
      },
      phone: place.internationalPhoneNumber as string | undefined,
      website: place.websiteUri as string | undefined,
      opening_hours: (place.regularOpeningHours as Record<string, string[]>)?.weekdayDescriptions || undefined,
      photos: place.photos ? (place.photos as Record<string, string>[]).map((p) => p.name) : undefined,
    }))

    return new Response(
      JSON.stringify({ places, total: places.length }),
      { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Edge Function error:', err.message)
    return new Response(
      JSON.stringify({ error: err.message || 'Erro interno' }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    )
  }
})
