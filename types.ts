import { AppEditionResourceV1 } from '@friends-library/api';
import { Html, Uuid } from '@friends-library/types';

export type PlayerState = 'STOPPED' | 'PLAYING' | 'PAUSED' | 'DUCKED';

export type BookSortMethod = 'duration' | 'published' | 'author' | 'title';

export type EbookColorScheme = 'white' | 'black' | 'sepia';

/**
 * string in format: `"<document-id>--<EditionType>"`
 * eg `"f413cec8-c609-4d58-9721-4ad552cb27ae--modernized"`
 */
export type EditionId = string;

/**
 * Document UUID
 * eg `"f413cec8-c609-4d58-9721-4ad552cb27ae"`
 */
export type DocumentId = Uuid;

export type EditionResource = AppEditionResourceV1;

export type Audio = ReturnType<typeof deriveAudioType>;

export type AudioPart = ReturnType<typeof deriveAudioPartType>;

export interface EbookData {
  md5: string;
  innerHtml: Html;
}

export type StackParamList = {
  Home: undefined;
  Read: { editionId: EditionId; chapterId?: string };
  Ebook: { editionId: EditionId };
  Listen: { editionId: EditionId };
  Settings: undefined;
  AudioBookList: { listType: 'audio' };
  EBookList: { listType: 'ebook' };
};

export interface BookListItem {
  navigateTo: keyof StackParamList;
  editionId: EditionId;
  isNew: boolean;
  progress: number;
  duration: string;
  nameDisplay: string;
  title: string;
  name: string;
}

export interface TrackData {
  id: string;
  filepath: string;
  title: string;
  artist: string;
  artworkUrl: string;
  album: string;
  duration: number;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function deriveAudioType(edition: EditionResource) {
  return edition.audio!;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function deriveAudioPartType(edition: EditionResource) {
  return edition.audio!.parts[0]!;
}
