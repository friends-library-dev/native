import { EbookColorScheme, SearchResult } from '../types';
import { search } from './search';

interface Scrollable {
  scrollTo(x: number, y: number): unknown;
  scrollTo(opts: {
    top: number;
    left: number;
    behavior: 'smooth' | 'instant' | 'auto';
  }): unknown;
}

// native browser window props
export interface Window extends Scrollable {
  innerHeight: number;
  scrollY: number;
  setTimeout(fn: () => unknown, timeout: number): number;
  alert(msg: string): unknown;
}

// custom additions to window
export interface Window {
  // header
  setHeaderHeight(headerHeight: number): unknown;
  setShowingHeader(showingHeader: boolean): unknown;

  // position
  requestPositionUpdateIfChanged(): void;
  updatePosition(newPercent: number): void;

  // searching
  requestSearchResults(query: string): void;
  navigateToSearchResult(result: SearchResult): unknown;
  clearSearchResults(): unknown;
  search: typeof search;

  // misc
  setColorScheme(colorScheme: EbookColorScheme): unknown;
  setJustify(justify: boolean): unknown;
  dismissFootnote(): void;
  setFontSize(fontSize: number): unknown;
  ReactNativeWebView: {
    postMessage(event: string): unknown;
  };
  htmlClassList(
    colorScheme: EbookColorScheme,
    showingHeader: boolean,
    fontSize: number,
    showingFootnote: boolean,
    justify: boolean,
  ): string;
}

export interface ClassList {
  add(kls: string): unknown;
  remove(kls: string): unknown;
  value: string;
}

export interface Element extends Scrollable {
  innerHTML: string;
  innerText: string;
  nextElementSibling?: Element;
  classList: ClassList;
  matches(selector: string): boolean;
  getBoundingClientRect(): { top: number };
  style: Record<string, string | number>;
  scrollIntoView(
    opts?:
      | boolean
      | {
          behavior?: 'auto' | 'smooth';
          block?: 'start' | 'center' | 'end' | 'nearest';
          inline?: 'start' | 'center' | 'end' | 'nearest';
        },
  ): unknown;
}

export interface Document {
  body: { classList: ClassList };
  documentElement: { scrollHeight: number; classList: ClassList };
  getElementById(id: string): Element | null;
  querySelector(selectors: string): Element | null;
  querySelectorAll(selectors: string): Element[];
  addEventListener(event: string, handler: (event: any) => unknown): unknown;
}
