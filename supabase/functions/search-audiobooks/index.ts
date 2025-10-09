import { serve } from 'std/http/server.ts';

// Define the shape of the incoming request body for type safety
interface SearchPayload {
  query?: string;
  limit?: number;
  offset?: number;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Explicitly reject any method that is not POST
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const { query, limit = 50, offset = 0 }: SearchPayload = await req.json();

    const params = new URLSearchParams({
      format: 'json',
      extended: '1', // Returns the full data set for each audiobook
      coverart: '1', // Returns links to cover art if available
      limit: limit.toString(),
      offset: offset.toString(),
    });

    if (query && query.trim()) {
      // Pass the user's query directly to the API without modifications.
      params.append('title', query.trim());
    }

    const libriVoxUrl = `https://librivox.org/api/feed/audiobooks/?${params.toString()}`;

    // Make the request to the external LibriVox API
    const response = await fetch(libriVoxUrl);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`LibriVox API Error Response: ${errorBody}`);
      throw new Error(`LibriVox API error: ${response.status}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    // Log the detailed error on the server for debugging
    console.error('Search audiobooks error:', error);

    // Return a generic but structured error to the client
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'An unknown error occurred.',
        books: [],
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
