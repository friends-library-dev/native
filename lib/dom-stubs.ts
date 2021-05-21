export interface Window {
  scrollY: number;
  scrollTo: (x: number, y: number) => unknown;
  initialPosition: number;
  ReactNativeWebView: {
    postMessage: (event: string) => unknown;
  };
}

export interface ClassList {
  add(kls: string): unknown;
  remove(kls: string): unknown;
}

export interface Node {
  innerHTML: string;
  classList: ClassList;
}

export class Element {
  innerHTML!: string;
  nextElementSibling?: Element;
  matches(selector: string): boolean {
    return false;
  }
}

export interface Document {
  documentElement: { scrollHeight: number };
  body: { classList: ClassList };
  getElementById(id: string): Node | null;
  addEventListener(event: string, handler: (event: any) => unknown): unknown;
  querySelectorAll(selector: string): Node[];
}
