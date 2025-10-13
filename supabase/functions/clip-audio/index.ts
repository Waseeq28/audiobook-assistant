import { serve } from 'std/http/server.ts';
import { createClient } from 'supabase-client';
import { runFfmpeg } from '../_shared/ffmpeg.ts';

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

const CLIPS_BUCKET = 'audio-clips';
const SOURCE_BUCKET = 'source-audio';
const DEFAULT_WINDOW = 5; // seconds before/after center
const SIGNED_URL_EXPIRY = 60 * 10; // seconds

type ClipRequest = {
  sourceType: 'uploaded' | 'remote';
  sourcePath?: string; // required when uploaded
  sourceUrl?: string; // required when remote
  timestampSeconds: number;
  windowSeconds?: number;
};

async function getSourceUrl(payload: ClipRequest): Promise<string> {
  if (payload.sourceType === 'uploaded') {
    if (!payload.sourcePath) {
      throw new Error('Missing sourcePath for uploaded audio');
    }

    const { data, error } = await supabase.storage
      .from(SOURCE_BUCKET)
      .createSignedUrl(payload.sourcePath, SIGNED_URL_EXPIRY);

    if (error || !data?.signedUrl) {
      throw error ?? new Error('Failed to create signed URL for source audio');
    }
    return data.signedUrl;
  }

  if (!payload.sourceUrl) {
    throw new Error('Missing sourceUrl for remote audio');
  }
  return payload.sourceUrl;
}

async function downloadToTemp(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok || !response.body) {
    throw new Error(`Failed to fetch source audio (${response.status})`);
  }

  const tempPath = `/tmp/source-${crypto.randomUUID()}`;
  const file = await Deno.open(tempPath, {
    create: true,
    write: true,
  });

  try {
    await response.body.pipeTo(file.writable);
  } finally {
    file.close();
  }

  return tempPath;
}

async function createClip(
  sourcePath: string,
  startSeconds: number,
  endSeconds: number
): Promise<string> {
  const tempClipPath = `/tmp/clip-${crypto.randomUUID()}.m4a`;

  const args = [
    '-ss',
    startSeconds.toString(),
    '-to',
    endSeconds.toString(),
    '-i',
    sourcePath,
    '-acodec',
    'aac',
    '-b:a',
    '128k',
    '-y',
    tempClipPath,
  ];

  await runFfmpeg(args);
  return tempClipPath;
}

async function uploadClip(localPath: string): Promise<{ path: string; signedUrl: string }> {
  const clipBytes = await Deno.readFile(localPath);
  const objectPath = `${crypto.randomUUID()}.m4a`;

  const { error: uploadError } = await supabase.storage
    .from(CLIPS_BUCKET)
    .upload(objectPath, clipBytes, {
      contentType: 'audio/m4a',
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from(CLIPS_BUCKET)
    .createSignedUrl(objectPath, SIGNED_URL_EXPIRY);

  if (signedUrlError || !signedUrlData?.signedUrl) {
    throw signedUrlError ?? new Error('Failed to create signed URL for clip');
  }

  return { path: objectPath, signedUrl: signedUrlData.signedUrl };
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const payload = (await req.json()) as ClipRequest;
    const windowSeconds = payload.windowSeconds ?? DEFAULT_WINDOW;

    if (!payload || typeof payload.timestampSeconds !== 'number') {
      return new Response(JSON.stringify({ error: 'Missing timestampSeconds' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const sourceUrl = await getSourceUrl(payload);
    const sourceLocalPath = await downloadToTemp(sourceUrl);

    const startSeconds = Math.max(0, payload.timestampSeconds - windowSeconds);
    const endSeconds = payload.timestampSeconds + windowSeconds;

    const clipLocalPath = await createClip(sourceLocalPath, startSeconds, endSeconds);
    const clipInfo = await uploadClip(clipLocalPath);

    return new Response(
      JSON.stringify({
        clip: {
          path: clipInfo.path,
          signedUrl: clipInfo.signedUrl,
          expiresIn: SIGNED_URL_EXPIRY,
          startSeconds,
          endSeconds,
          timestampSeconds: payload.timestampSeconds,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('clip-audio error:', error);
    return new Response(JSON.stringify({ error: 'Clip creation failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
