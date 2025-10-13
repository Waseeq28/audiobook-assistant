const DEFAULT_FFMPEG_URL =
  'https://github.com/eugeneware/ffmpeg-static/releases/download/b4.4.0/ffmpeg-linux-x64';

const FFMPEG_PATH = '/tmp/ffmpeg-bin';

async function downloadBinary(url: string) {
  const response = await fetch(url);
  if (!response.ok || !response.body) {
    throw new Error(`Failed to download ffmpeg binary (${response.status})`);
  }

  const file = await Deno.open(FFMPEG_PATH, {
    create: true,
    write: true,
    mode: 0o755,
  });

  try {
    await response.body.pipeTo(file.writable);
  } finally {
    file.close();
  }
}

export async function ensureFfmpegBinary(): Promise<string> {
  try {
    const stat = await Deno.stat(FFMPEG_PATH);
    if (stat.isFile) {
      return FFMPEG_PATH;
    }
  } catch (_) {
    // File missing, fall through to download
  }

  const downloadUrl = Deno.env.get('FFMPEG_BINARY_URL') ?? DEFAULT_FFMPEG_URL;
  await downloadBinary(downloadUrl);
  return FFMPEG_PATH;
}

export async function runFfmpeg(args: string[]): Promise<void> {
  const ffmpegPath = await ensureFfmpegBinary();
  const command = new Deno.Command(ffmpegPath, {
    args,
    stdout: 'piped',
    stderr: 'piped',
  });

  const { success, stderr } = await command.output();
  if (!success) {
    throw new Error(new TextDecoder().decode(stderr) || 'ffmpeg execution failed');
  }
}
