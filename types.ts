import { AppEditionResourceV1 } from '@friends-library/api';

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
export type DocumentId = string;

export type EditionResource = AppEditionResourceV1;

export type Audio = ReturnType<typeof deriveAudioType>;

export type AudioPart = ReturnType<typeof deriveAudioPartType>;

export interface EbookData {
  md5: string;
  innerHtml: string;
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

export interface Gesture {
  isSwipe: boolean;
  isHorizontalSwipe: boolean;
  isVerticalSwipe: boolean;
  isRightSwipe: boolean;
  isLeftSwipe: boolean;
  isBackSwipe: boolean;
  isLong: boolean;
}

export interface SearchResult {
  before: string;
  match: string;
  after: string;
  percentage: number;
  elementId: string;
  startIndex: number;
  endIndex: number;
  siblingIndex: number;
  numResultsInElement: number;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function deriveAudioType(edition: EditionResource) {
  return edition.audio!;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function deriveAudioPartType(edition: EditionResource) {
  return edition.audio!.parts[0]!;
}
