export type MockAudioSection = {
  id: string;
  title: string;
  duration: string;
  audioUrl: string;
};

export type MockAudiobook = {
  id: string;
  title: string;
  authors: string[];
  description: string;
  genres: string[];
  totalTime: string;
  coverUrl: string;
  sections: MockAudioSection[];
};

export const MOCK_AUDIOBOOKS: MockAudiobook[] = [
  {
    id: '1',
    title: 'The Adventures of Sherlock Holmes',
    authors: ['Arthur Conan Doyle'],
    description:
      'A collection of twelve Sherlock Holmes short stories featuring the famed detective and his companion Dr. Watson.',
    genres: ['Mystery', 'Detective Fiction'],
    totalTime: '13:29:00',
    coverUrl: 'https://placehold.co/200x300?text=Sherlock',
    sections: [
      {
        id: '1-1',
        title: 'A Scandal in Bohemia',
        duration: '01:04:12',
        audioUrl: 'https://example.com/audio/1-1.mp3',
      },
      {
        id: '1-2',
        title: 'The Red-Headed League',
        duration: '00:58:47',
        audioUrl: 'https://example.com/audio/1-2.mp3',
      },
    ],
  },
  {
    id: '2',
    title: 'Pride and Prejudice',
    authors: ['Jane Austen'],
    description:
      'A romantic novel that charts the emotional development of Elizabeth Bennet as she learns the error of making hasty judgments.',
    genres: ['Romance', 'Classic'],
    totalTime: '18:30:15',
    coverUrl: 'https://placehold.co/200x300?text=P%20%26%20P',
    sections: [
      {
        id: '2-1',
        title: 'Chapter 1',
        duration: '00:23:05',
        audioUrl: 'https://example.com/audio/2-1.mp3',
      },
      {
        id: '2-2',
        title: 'Chapter 2',
        duration: '00:21:54',
        audioUrl: 'https://example.com/audio/2-2.mp3',
      },
    ],
  },
  {
    id: '3',
    title: 'War of the Worlds',
    authors: ['H. G. Wells'],
    description:
      'An early science fiction novel describing a Martian invasion of Earth, exploring themes of imperialism and human resilience.',
    genres: ['Science Fiction', 'Adventure'],
    totalTime: '06:35:40',
    coverUrl: 'https://placehold.co/200x300?text=War%20of%20the%20Worlds',
    sections: [
      {
        id: '3-1',
        title: 'Book 1, Chapter 1',
        duration: '00:19:11',
        audioUrl: 'https://example.com/audio/3-1.mp3',
      },
      {
        id: '3-2',
        title: 'Book 1, Chapter 2',
        duration: '00:17:26',
        audioUrl: 'https://example.com/audio/3-2.mp3',
      },
    ],
  },
];

export function searchAudiobooks(query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return MOCK_AUDIOBOOKS;
  }

  return MOCK_AUDIOBOOKS.filter((book) => {
    const inTitle = book.title.toLowerCase().includes(normalizedQuery);
    const inAuthor = book.authors.some((author) => author.toLowerCase().includes(normalizedQuery));
    const inGenre = book.genres.some((genre) => genre.toLowerCase().includes(normalizedQuery));
    return inTitle || inAuthor || inGenre;
  });
}
