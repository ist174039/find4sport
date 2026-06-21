/**
 * Supabase Edge Function: sync-events-cron
 *
 * Scheduled function (cron) that fetches sports events from external sources
 * (Eventbrite, Meetup) and imports them into the events table as pending.
 *
 * Deploy: supabase functions deploy sync-events-cron
 * Schedule: supabase cron schedule --function sync-events-cron --cron "0 6 * * *"
 *   (runs daily at 6 AM UTC)
 *
 * Env vars:
 *   EVENTBRITE_API_KEY — Eventbrite OAuth token
 *   MEETUP_API_KEY — Meetup API key
 *   SUPABASE_URL — auto-set by Supabase
 *   SUPABASE_SERVICE_ROLE_KEY — auto-set by Supabase
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

// Default search locations in Portugal
const SEARCH_LOCATIONS = [
  { name: "Lisboa", lat: 38.7223, lng: -9.1393, radiusKm: 30 },
  { name: "Porto", lat: 41.1579, lng: -8.6291, radiusKm: 25 },
  { name: "Coimbra", lat: 40.2033, lng: -8.4103, radiusKm: 20 },
  { name: "Faro", lat: 37.0194, lng: -7.9322, radiusKm: 20 },
  { name: "Braga", lat: 41.5518, lng: -8.4229, radiusKm: 20 },
];

async function fetchEventbrite(
  lat: number,
  lng: number,
  radiusKm: number
): Promise<AnyRecord[]> {
  const apiKey = Deno.env.get("EVENTBRITE_API_KEY");
  if (!apiKey) return [];

  try {
    const params = new URLSearchParams({
      "location.latitude": String(lat),
      "location.longitude": String(lng),
      "location.within": `${radiusKm}km`,
      q: "sports,fitness,yoga,futebol,crossfit,padel,tennis",
      expand: "venue",
      page_size: "50",
    });

    const res = await fetch(
      `https://www.eventbriteapi.com/v3/events/search/?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) return [];
    const data: AnyRecord = await res.json();
    return (data.events ?? []) as AnyRecord[];
  } catch {
    return [];
  }
}

async function fetchMeetup(
  lat: number,
  lng: number,
  radiusMiles: number
): Promise<AnyRecord[]> {
  const apiKey = Deno.env.get("MEETUP_API_KEY");
  if (!apiKey) return [];

  try {
    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lng),
      radius: String(radiusMiles),
      page: "20",
      category: "9",
    });

    const res = await fetch(
      `https://api.meetup.com/find/upcoming_events?${params.toString()}`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );

    if (!res.ok) return [];
    const data: AnyRecord = await res.json();
    return (data.events ?? []) as AnyRecord[];
  } catch {
    return [];
  }
}

serve(async (_req: Request) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(
      JSON.stringify({ error: "Supabase configuration missing" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  let totalImported = 0;
  let totalSkipped = 0;
  const errors: string[] = [];

  for (const location of SEARCH_LOCATIONS) {
    console.log(`Searching events near ${location.name}...`);

    const [eventbriteEvents, meetupEvents] = await Promise.all([
      fetchEventbrite(location.lat, location.lng, location.radiusKm),
      fetchMeetup(location.lat, location.lng, Math.round(location.radiusKm * 0.621)),
    ]);

    const allEvents = [
      ...eventbriteEvents.map((e: AnyRecord) => ({ ...e, _source: "eventbrite" })),
      ...meetupEvents.map((e: AnyRecord) => ({ ...e, _source: "meetup" })),
    ];

    console.log(`Found ${allEvents.length} events near ${location.name}`);

    for (const ev of allEvents) {
      try {
        const source = ev._source as string;
        const sourceId = ev.id as string;
        const venue = ev.venue as AnyRecord | null;

        // Extract title
        const title = typeof ev.name === "object"
          ? (ev.name as AnyRecord).text ?? ""
          : String(ev.name ?? "Sem título");

        // Skip if already imported
        const { data: existing } = await supabase
          .from("events")
          .select("id")
          .or(`source_id.eq.${sourceId},and(title.eq.${title},start_date.eq.${ev.start?.utc ?? ev.time ?? ""})`)
          .limit(1);

        if (existing && (existing as AnyRecord[]).length > 0) {
          totalSkipped++;
          continue;
        }

        // Extract description
        const description = typeof ev.description === "object"
          ? (ev.description as AnyRecord).text?.slice(0, 2000)
          : String(ev.description ?? "").slice(0, 2000);

        const { error } = await supabase.from("events").insert({
          title,
          description,
          address: venue?.address?.localized_address_display ?? venue?.address_1 ?? "",
          latitude: venue?.latitude ? Number(venue.latitude) : location.lat,
          longitude: venue?.longitude ? Number(venue.longitude) : location.lng,
          start_date: ev.start?.utc ?? ev.start?.local ?? new Date(ev.time ?? Date.now()).toISOString(),
          end_date: ev.end?.utc ?? ev.end?.local ?? null,
          image_url: (ev.logo as AnyRecord)?.url ?? ev.photo_url ?? null,
          external_url: ev.url ?? ev.link ?? null,
          capacity: null,
          price_min: null,
          price_max: null,
          source,
          source_type: source,
          status: "pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as AnyRecord);

        if (error) {
          errors.push(`${title}: ${error.message}`);
        } else {
          totalImported++;
        }
      } catch (err) {
        errors.push(`Event processing error: ${String(err)}`);
      }
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      imported: totalImported,
      skipped: totalSkipped,
      errors: errors.length > 0 ? errors.slice(0, 20) : undefined,
      message: `Imported ${totalImported} events, skipped ${totalSkipped}, ${errors.length} errors`,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});
