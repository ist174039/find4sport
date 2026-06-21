/**
 * Supabase Edge Function: geocode-on-insert
 *
 * Triggered by database webhook when a new record is inserted into
 * sport_spaces or professionals tables with an address but missing
 * latitude/longitude. Automatically geocodes the address.
 *
 * Deploy: supabase functions deploy geocode-on-insert
 * Env vars: GOOGLE_GEOCODING_API_KEY
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

const GEOCODING_URL = "https://maps.googleapis.com/maps/api/geocode/json";

interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress: string;
}

async function geocode(address: string): Promise<GeocodeResult | null> {
  const apiKey = Deno.env.get("GOOGLE_GEOCODING_API_KEY") ??
    Deno.env.get("GOOGLE_PLACES_API_KEY");

  if (!apiKey) {
    console.warn("GOOGLE_GEOCODING_API_KEY not set — skipping geocoding");
    return null;
  }

  try {
    const params = new URLSearchParams({
      address,
      key: apiKey,
      region: "pt",
      language: "pt-PT",
    });

    const res = await fetch(`${GEOCODING_URL}?${params.toString()}`);

    if (!res.ok) {
      console.error("Geocoding API error:", res.status);
      return null;
    }

    const data: AnyRecord = await res.json();

    if (data.status !== "OK" || !data.results?.length) {
      console.warn("Geocoding no results for:", address);
      return null;
    }

    const location = data.results[0].geometry?.location;
    if (!location) return null;

    return {
      lat: location.lat,
      lng: location.lng,
      formattedAddress: data.results[0].formatted_address ?? address,
    };
  } catch (err) {
    console.error("Geocoding error:", err);
    return null;
  }
}

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(
      JSON.stringify({ error: "Supabase env vars not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const payload: AnyRecord = await req.json();
    const record = payload.record as AnyRecord;
    const table = payload.table as string;

    if (!record) {
      return new Response(JSON.stringify({ message: "No record in payload" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if already geocoded
    if (record.latitude && record.longitude) {
      return new Response(JSON.stringify({ message: "Already geocoded" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Build address string
    let address = "";
    if (table === "sport_spaces") {
      address = record.address ?? "";
    } else if (table === "professionals") {
      address = record.address ?? "";
    } else {
      return new Response(JSON.stringify({ message: `Skipping table: ${table}` }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!address) {
      return new Response(JSON.stringify({ message: "No address to geocode" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Append Portugal if not present
    if (!address.toLowerCase().includes("portugal")) {
      address += ", Portugal";
    }

    console.log(`Geocoding: "${address}" for ${table} id=${record.id}`);

    const result = await geocode(address);

    if (!result) {
      return new Response(JSON.stringify({ message: "Geocoding returned no results" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { error } = await supabase
      .from(table)
      .update({
        latitude: result.lat,
        longitude: result.lng,
        updated_at: new Date().toISOString(),
      })
      .eq("id", record.id);

    if (error) {
      console.error("Update error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        lat: result.lat,
        lng: result.lng,
        address: result.formattedAddress,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Function error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
