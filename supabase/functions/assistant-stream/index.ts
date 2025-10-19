import { serve } from 'std/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type ClipPayload = {
  url?: string;
  transcript?: string | null;
  startSeconds?: number;
  endSeconds?: number;
  source?: string | null;
};

type RecordingPayload = {
  transcript?: string | null;
};

type AssistantRequestBody = {
  clip?: ClipPayload | null;
  userRecording?: RecordingPayload | null;
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required.');
}

function buildPrompt(body: AssistantRequestBody) {
  const clipTranscript = body.clip?.transcript?.trim();
  const clipSource = body.clip?.source ?? 'unknown source';
  const clipTiming =
    typeof body.clip?.startSeconds === 'number' && typeof body.clip?.endSeconds === 'number'
      ? `Timestamp window: ${body.clip.startSeconds.toFixed(1)}s → ${body.clip.endSeconds.toFixed(1)}s.`
      : 'Timestamp window unavailable.';

  const recordingTranscript = body.userRecording?.transcript?.trim();

  return `You are an assistant helping a listener understand an audiobook segment.
Use the provided audiobook transcript (timestamped clip) as authoritative context.
Also consider the listener's recorded question.
Respond clearly, referencing the clip when helpful. If context is missing, acknowledge the gap.

Audiobook clip source: ${clipSource}.
${clipTiming}

Audiobook clip transcript:
${clipTranscript ?? '[Not supplied]'}

Listener question transcript:
${recordingTranscript ?? '[Not supplied]'}

Answer:`;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const body: AssistantRequestBody = await req.json();

    const clipTranscript = body.clip?.transcript?.trim();
    const recordingTranscript = body.userRecording?.transcript?.trim();

    if (!clipTranscript || !recordingTranscript) {
      return new Response(
        JSON.stringify({ error: 'Both clip and recording transcripts are required.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const prompt = buildPrompt(body);

    const completionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are an audiobook assistant that provides concise, helpful answers with clear citations when appropriate.',
          },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!completionResponse.ok) {
      const errorText = await completionResponse.text();
      console.error('OpenAI error:', completionResponse.status, errorText);
      return new Response(JSON.stringify({ error: 'Assistant request failed.' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const completionData = await completionResponse.json();
    const assistantMessage = completionData.choices?.[0]?.message?.content?.trim();

    if (!assistantMessage) {
      console.error('OpenAI response missing content.');
      return new Response(JSON.stringify({ error: 'Assistant response missing.' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ message: assistantMessage }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Assistant function error:', error);
    return new Response(JSON.stringify({ error: 'Unexpected server error.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
