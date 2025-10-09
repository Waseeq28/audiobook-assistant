import { LibriVoxAudiobook, LibriVoxApiResponse } from './types';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export async function searchAudiobooksByTitle(
  query: string,
  options = { limit: 50, offset: 0 }
): Promise<LibriVoxApiResponse> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/search-audiobooks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        query: query.trim(),
        limit: options.limit,
        offset: options.offset,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching audiobooks:', error);
    throw error;
  }
}

export async function getAudiobookById(id: string): Promise<LibriVoxAudiobook | null> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/get-audiobook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.book;
  } catch (error) {
    console.error('Error fetching audiobook by ID:', error);
    throw error;
  }
}
