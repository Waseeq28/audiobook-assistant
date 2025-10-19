import { serve } from 'std/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const contentType = req.headers.get('content-type') ?? '';
    let audioFile: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file');

      if (file instanceof File) {
        audioFile = file;
      } else {
        return new Response(JSON.stringify({ error: 'Missing audio file' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else {
      const { clipUrl } = (await req.json()) as { clipUrl?: string };

      if (!clipUrl) {
        return new Response(JSON.stringify({ error: 'clipUrl is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const clipResponse = await fetch(clipUrl);

      if (!clipResponse.ok) {
        return new Response(JSON.stringify({ error: 'Unable to fetch clip' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const arrayBuffer = await clipResponse.arrayBuffer();
      const mimeType = clipResponse.headers.get('content-type') ?? 'audio/m4a';
      audioFile = new File([arrayBuffer], 'clip.m4a', { type: mimeType });
    }

    if (!audioFile) {
      return new Response(JSON.stringify({ error: 'No audio provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const whisperFormData = new FormData();
    whisperFormData.append('model', 'whisper-1');
    whisperFormData.append('file', audioFile, audioFile.name);

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: whisperFormData,
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'Failed to transcribe audio' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const result = await response.json();

    return new Response(JSON.stringify({ text: result.text ?? '' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Transcription function error:', error);
    return new Response(JSON.stringify({ error: 'Unexpected server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
