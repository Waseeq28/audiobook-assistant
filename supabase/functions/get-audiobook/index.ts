import { serve } from 'std/http/server.ts';

// Define the shape of the incoming request body for type safety
interface GetAudiobookPayload {
  id: string;
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
    const { id }: GetAudiobookPayload = await req.json();

    if (!id || typeof id !== 'string' || id.trim() === '') {
      return new Response(JSON.stringify({ error: 'A valid Book ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build LibriVox API URL with the required trailing slash
    const params = new URLSearchParams({
      id: id.trim(),
      format: 'json',
      extended: '1',
      coverart: '1',
    });
    const libriVoxUrl = `https://librivox.org/api/feed/audiobooks/?${params.toString()}`;

    // Make request to LibriVox API
    const response = await fetch(libriVoxUrl);

    if (!response.ok) {
      throw new Error(`LibriVox API error: ${response.status}`);
    }

    const data = await response.json();

    // LibriVox returns an array; extract the first book.
    const book = data.books && data.books.length > 0 ? data.books[0] : null;

    // If no book was found for that ID, return a 404 status
    if (!book) {
      return new Response(
        JSON.stringify({ error: 'Book not found with the provided ID', book: null }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

    // On success, return the book object
    return new Response(JSON.stringify({ book }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Get audiobook error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        book: null,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
