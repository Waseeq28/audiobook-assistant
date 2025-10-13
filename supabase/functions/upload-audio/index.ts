import { serve } from 'std/http/server.ts';
import { createClient } from 'supabase-client';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const SOURCE_BUCKET = 'source-audio';
const SIGNED_URL_EXPIRY = 60 * 10; // 10 minutes

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const contentType = req.headers.get('content-type') ?? '';
    if (!contentType.toLowerCase().startsWith('multipart/form-data')) {
      return new Response(JSON.stringify({ error: 'Expected multipart form data' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return new Response(JSON.stringify({ error: 'Missing file' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const extension = (file.type && file.type.split('/')[1]) || 'm4a';
    const objectPath = `${crypto.randomUUID()}.${extension}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(SOURCE_BUCKET)
      .upload(objectPath, arrayBuffer, {
        contentType: file.type || 'audio/m4a',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      if (uploadError.message?.includes('duplicate')) {
        return new Response(JSON.stringify({ error: 'File already exists' }), {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw uploadError;
    }

    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(SOURCE_BUCKET)
      .createSignedUrl(objectPath, SIGNED_URL_EXPIRY);

    if (signedUrlError) {
      console.error('Signed URL error:', signedUrlError);
      throw signedUrlError;
    }

    return new Response(
      JSON.stringify({
        bucket: SOURCE_BUCKET,
        path: objectPath,
        signedUrl: signedUrlData?.signedUrl,
        expiresIn: SIGNED_URL_EXPIRY,
        originalName: file.name,
        mimeType: file.type,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Upload function error:', error);
    return new Response(JSON.stringify({ error: 'Unexpected server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
