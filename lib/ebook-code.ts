import css from 'x-syntax';
import { EbookColorScheme } from '../types';
import { Element, Document, Window } from './dom-stubs';
import tw from '../lib/tailwind';

export type Message =
  | { type: 'update_position'; position: number }
  | { type: 'debug'; value: string }
  | { type: 'set_footnote_visibility'; visible: boolean }
  | { type: 'toggle_header_visibility' };

const htmlClassList: Window['htmlClassList'] = (
  colorScheme,
  showingHeader,
  fontSize,
  showingFootnote,
) => {
  return [
    `colorscheme--${colorScheme}`,
    `font-size--${fontSize}`,
    `footnote--${showingFootnote ? `visible` : `hidden`}`,
    `header--${showingHeader ? `visible` : `hidden`}`,
  ].join(` `);
};

function injectIntoWebView(
  window: Window,
  document: Document,
  position: number,
  chapterId: string | undefined,
  initialFontSize: number,
  initialColorScheme: EbookColorScheme,
  initialShowingHeader: boolean,
  initialHeaderHeight: number,
  safeAreaVerticalOffset: number,
): void {
  function scrollPercent(pixelOffsetY: number): number {
    return pixelOffsetY / document.documentElement.scrollHeight;
  }

  function scrollPixelOffsetY(percent: number): number {
    return percent * document.documentElement.scrollHeight;
  }

  let chapter: Element | null = null;
  if (chapterId && (chapter = document.getElementById(chapterId))) {
    const rect = chapter.getBoundingClientRect();
    const chapterOffset = rect.top + 75;
    window.scrollTo(0, chapterOffset);
    sendMsg({ type: `update_position`, position: scrollPercent(chapterOffset) });
  } else if (position > 0) {
    window.scrollTo(0, scrollPixelOffsetY(position));
  }

  const fnOverlay = document.getElementById(`fn-overlay`);
  const fnHolder = document.getElementById(`fn-content-inner`);
  let beforeFootnoteShowScroll: number | null = null;
  let colorScheme = initialColorScheme;
  let showingHeader = initialShowingHeader;
  let fontSize = initialFontSize;
  let headerHeight = initialHeaderHeight;
  let showingFootnote = false;
  let lastScroll = window.scrollY;

  function setHtmlClassList() {
    document.documentElement.classList.value = window.htmlClassList(
      colorScheme,
      showingHeader,
      fontSize,
      showingFootnote,
    );
  }

  function sendMsg(msg: Message): void {
    window.ReactNativeWebView.postMessage(JSON.stringify(msg));
  }

  function setFootnotePadding(): void {
    if (!fnOverlay) {
      return;
    }
    fnOverlay.style.paddingTop = `${
      showingHeader ? headerHeight : safeAreaVerticalOffset
    }px`;
  }
  setFootnotePadding();

  window.updatePosition = (newPercent) => {
    window.scrollTo(0, scrollPixelOffsetY(newPercent));
  };

  window.setHeaderHeight = (newHeight) => {
    headerHeight = newHeight;
    setFootnotePadding();
  };

  window.setShowingHeader = (nextState) => {
    showingHeader = nextState;
    setFootnotePadding();
  };

  window.setFontSize = (newFontSize) => {
    fontSize = newFontSize;
    const before = scrollPercent(window.scrollY);
    setHtmlClassList();
    window.scrollTo(0, scrollPixelOffsetY(before));
  };

  window.setColorScheme = (newColorScheme) => {
    colorScheme = newColorScheme;
    setHtmlClassList();
  };

  window.requestPositionUpdateIfChanged = () => {
    const newScroll = window.scrollY;
    if (newScroll !== lastScroll) {
      sendMsg({ type: `update_position`, position: scrollPercent(newScroll) });
    }
    lastScroll = newScroll;
  };

  window.dismissFootnote = () => {
    showingFootnote = false;
    setHtmlClassList();
    if (beforeFootnoteShowScroll !== null) {
      window.scrollTo(0, beforeFootnoteShowScroll);
      beforeFootnoteShowScroll = null;
    }
    if (fnHolder) fnHolder.innerHTML = ``;
    sendMsg({ type: `set_footnote_visibility`, visible: false });
  };

  document.querySelectorAll(`span.footnote`).forEach((node, index) => {
    let innerHtml = node.innerHTML;
    innerHtml = `
        <sup class="footnote-marker increase-clickable">[${index + 1}]</sup>
        <span class="footnote-content">
          ${innerHtml}
          <a class="fn-close fn-close-back increase-clickable">⏎</a>
        </span>
      `;
    node.innerHTML = innerHtml;
    node.classList.add(`prepared`);
  });

  document.addEventListener(`click`, (event) => {
    if (!fnHolder || typeof event.target.matches !== `function`) {
      return !showingFootnote && sendMsg({ type: `toggle_header_visibility` });
    }

    const target = event.target as Element;
    if (target.matches(`.footnote-marker`)) {
      const fnContent = target.nextElementSibling;
      if (!fnContent) return;
      beforeFootnoteShowScroll = window.scrollY;
      fnHolder.innerHTML = fnContent.innerHTML;
      showingFootnote = true;
      setHtmlClassList();
      return sendMsg({ type: `set_footnote_visibility`, visible: true });
    }

    if (target.matches(`.fn-close`)) {
      return window.dismissFootnote();
    }

    return !showingFootnote && sendMsg({ type: `toggle_header_visibility` });
  });
}

const cssVars = css`
  :root {
    --ebook-colorscheme-black-bg: ${tw.color(`ebook-colorscheme-black-bg`) ?? ``};
    --ebook-colorscheme-black-fg: ${tw.color(`ebook-colorscheme-black-fg`) ?? ``};
    --ebook-colorscheme-black-accent: ${tw.color(`ebook-colorscheme-black-accent`) ?? ``};
    --ebook-colorscheme-white-bg: ${tw.color(`ebook-colorscheme-white-bg`) ?? ``};
    --ebook-colorscheme-white-fg: ${tw.color(`ebook-colorscheme-white-fg`) ?? ``};
    --ebook-colorscheme-white-accent: ${tw.color(`ebook-colorscheme-white-accent`) ?? ``};
    --ebook-colorscheme-sepia-bg: ${tw.color(`ebook-colorscheme-sepia-bg`) ?? ``};
    --ebook-colorscheme-sepia-fg: ${tw.color(`ebook-colorscheme-sepia-fg`) ?? ``};
    --ebook-colorscheme-sepia-accent: ${tw.color(`ebook-colorscheme-sepia-accent`) ?? ``};
  }
`;

export function wrapHtml(
  html: string,
  css: string,
  colorScheme: EbookColorScheme,
  fontSize: number,
  position: number,
  chapterId: string | undefined,
  showingHeader: boolean,
  headerHeight: number,
  safeAreaVerticalOffset: number,
): string {
  return `
  <html class="${htmlClassList(colorScheme, showingHeader, fontSize, false)}"> 
    <head>
       <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
       <style>${cssVars}</style>
       ${css}
    </head>
    <body>
      <div id="fn-overlay">
        <div id="fn-content">
          <div id="fn-content-inner">
          </div>
          <a id="fn-close" class="fn-close increase-clickable">&#x2715;</a>
        </div>
      </div>
      ${html}
      <script>
        window.htmlClassList = ${htmlClassList.toString()}
        ${injectIntoWebView.toString()}
        ${injectIntoWebView.name}(
          window,
          document,
          ${position},
          ${chapterId ? `"${chapterId}"` : `undefined`},
          ${fontSize},
          "${colorScheme}",
          ${showingHeader},
          ${headerHeight},
          ${safeAreaVerticalOffset}
         );
      </script>
    </body>
  </html>`;
}
