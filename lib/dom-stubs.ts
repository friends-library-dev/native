import { EbookColorScheme } from '../types';

export interface Window {
  scrollY: number;
  scrollTo(x: number, y: number): unknown;
  initialPosition: number;
  ReactNativeWebView: {
    postMessage: (event: string) => unknown;
  };
  setFontSize(fontSize: number): unknown;
  setHeaderHeight(headerHeight: number): unknown;
  setShowingHeader(showingHeader: boolean): unknown;
  setColorScheme(colorScheme: EbookColorScheme): unknown;
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

export interface Node {
  innerHTML: string;
  classList: ClassList;
  style: Record<string, string | number>;
}

export interface Element {
  innerHTML: string;
  nextElementSibling?: Element;
  matches(selector: string): boolean;
}

export interface Document {
  body: { classList: ClassList };
  documentElement: { scrollHeight: number; classList: ClassList };
  getElementById(id: string): Node | null;
  addEventListener(event: string, handler: (event: any) => unknown): unknown;
  querySelectorAll(selector: string): Node[];
}
