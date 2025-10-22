import { serve } from 'std/http/server.ts';
import { createClient } from 'supabase-client';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is required');
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const BUCKET_ID = 'assistant-speech';
const SIGNED_URL_EXPIRY = 60 * 5;

interface TTSRequest {
  text?: string;
  voice?: string;
}

async function synthesizeSpeech(text: string, voice: string): Promise<ArrayBuffer> {
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini-tts',
      voice,
      input: text,
      format: 'mp3',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI TTS error:', errorText);
    throw new Error('Failed to synthesize speech');
  }

  return response.arrayBuffer();
}

async function storeAudio(buffer: ArrayBuffer) {
  const audioBytes = new Uint8Array(buffer);
  const objectPath = `${crypto.randomUUID()}.mp3`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_ID)
    .upload(objectPath, audioBytes, {
      contentType: 'audio/mpeg',
      upsert: false,
    });

  if (uploadError) {
    console.error('Upload error:', uploadError);
    throw new Error('Failed to store speech audio');
  }

  const { data: signed, error: signedError } = await supabase.storage
    .from(BUCKET_ID)
    .createSignedUrl(objectPath, SIGNED_URL_EXPIRY);

  if (signedError || !signed?.signedUrl) {
    console.error('Signed URL error:', signedError);
    throw new Error('Failed to create signed URL');
  }

  return { signedUrl: signed.signedUrl, objectPath };
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const { text, voice } = (await req.json()) as TTSRequest;

    if (!text || !text.trim()) {
      return new Response(JSON.stringify({ error: 'text is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const normalizedText = text.trim();
    const normalizedVoice = voice && voice.trim() ? voice.trim() : 'alloy';

    const audio = await synthesizeSpeech(normalizedText, normalizedVoice);
    const result = await storeAudio(audio);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('assistant-tts error:', error);
    return new Response(JSON.stringify({ error: 'Unexpected server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
