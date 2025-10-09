export type LibriVoxAuthor = {
  id: string;
  first_name: string;
  last_name: string;
};

export type LibriVoxReader = {
  reader_id: string;
  display_name: string;
};

export type LibriVoxSection = {
  id: string;
  section_number: string;
  title: string;
  listen_url: string;
  language: string;
  playtime: string;
  readers: LibriVoxReader[];
};

export type LibriVoxAudiobook = {
  id: string;
  title: string;
  description: string;
  url_text_source: string;
  language: string;
  copyright_year: string;
  num_sections: string;
  url_rss: string;
  url_zip_file: string;
  url_project: string;
  url_librivox: string;
  url_iarchive: string;
  url_other: string;
  totaltime: string;
  totaltimesecs: string;
  authors: LibriVoxAuthor[];
  genres: Array<{ id: string; name: string }>;
  sections?: LibriVoxSection[];
  coverart_jpg?: string;
  coverart_pdf?: string;
  coverart_thumbnail?: string;
};

export type LibriVoxApiResponse = {
  books: LibriVoxAudiobook[];
};
