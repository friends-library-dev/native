import { AppAudioResourceV1, AppEditionResourceV1 } from '@friends-library/api';
import { Html, Sha } from '@friends-library/types';

export type PlayerState = 'STOPPED' | 'PLAYING' | 'PAUSED' | 'DUCKED';

export type BookSortMethod = 'duration' | 'published' | 'author' | 'title';

export type ResourceType = 'audio' | 'edition';

export type EbookColorScheme = 'white' | 'black' | 'sepia';

export interface AudioPart {
  audioId: string;
  index: number;
  title: string;
  duration: number;
  size: number;
  sizeLq: number;
  url: string;
  urlLq: string;
}

export type AudioResource = AppAudioResourceV1;
export type EditionResource = AppEditionResourceV1;

export interface EbookData {
  sha: Sha;
  innerHtml: Html;
}

export type StackParamList = {
  Home: undefined;
  Read: { resourceId: string };
  Listen: { resourceId: string };
  Settings: undefined;
  AudioBookList: { resourceType: 'audio' };
  EBookList: { resourceType: 'edition' };
};

export interface BookListItem {
  navigateTo: keyof StackParamList;
  resourceId: string;
  isNew: boolean;
  progress: number;
  duration: string;
  nameDisplay: string;
  artworkId: string;
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
