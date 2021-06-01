import { EbookColorScheme } from '../types';

export interface Window {
  scrollY: number;
  scrollTo(x: number, y: number): unknown;
  dismissFootnote(): void;
  setFontSize(fontSize: number): unknown;
  setHeaderHeight(headerHeight: number): unknown;
  setShowingHeader(showingHeader: boolean): unknown;
  requestPositionUpdateIfChanged(): void;
  setColorScheme(colorScheme: EbookColorScheme): unknown;
  ReactNativeWebView: {
    postMessage(event: string): unknown;
  };
  htmlClassList(
    colorScheme: EbookColorScheme,
    showingHeader: boolean,
    fontSize: number,
    showingFootnote: boolean,
  ): string;
}

export interface ClassList {
  add(kls: string): unknown;
  remove(kls: string): unknown;
  value: string;
}

export interface Element {
  innerHTML: string;
  nextElementSibling?: Element;
  classList: ClassList;
  matches(selector: string): boolean;
  getBoundingClientRect(): { top: number };
  style: Record<string, string | number>;
}

export interface Document {
  body: { classList: ClassList };
  documentElement: { scrollHeight: number; classList: ClassList };
  getElementById(id: string): Element | null;
  addEventListener(event: string, handler: (event: any) => unknown): unknown;
  querySelectorAll(selector: string): Element[];
}
