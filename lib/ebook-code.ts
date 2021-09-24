import css from 'x-syntax';
import { EbookColorScheme } from '../types';
import { Element, Document, Window } from './dom-stubs';
import tw from '../lib/tailwind';
import { LANG } from '../env';

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
  justify,
) => {
  const classes = [
    `colorscheme--${colorScheme}`,
    `font-size--${fontSize}`,
    `footnote--${showingFootnote ? `visible` : `hidden`}`,
    `header--${showingHeader ? `visible` : `hidden`}`,
  ];

  if (justify) {
    classes.push(`justify`);
  }

  let incrementFontSize = Math.max(fontSize, 6);
  while (incrementFontSize <= 10) {
    classes.push(`font-size-lte--${incrementFontSize}`);
    incrementFontSize += 1;
  }

  return classes.join(` `);
};

function injectIntoWebView(
  window: Window,
  document: Document,
  position: number,
  chapterId: string | undefined,
  initialFontSize: number,
  initialColorScheme: EbookColorScheme,
  initialJustify: boolean,
  initialShowingHeader: boolean,
  initialHeaderHeight: number,
  safeAreaVerticalOffset: number,
): void {
  function docHeight(): number {
    return document.documentElement.scrollHeight;
  }

  function scrollPercent(pixelOffsetY: number): number {
    // subtracting the `window.innerHeight` makes it so we can actually get to 100%
    return pixelOffsetY / (docHeight() - window.innerHeight);
  }

  function scrollPixelOffsetY(percent: number): number {
    return percent * (docHeight() - window.innerHeight);
  }

  function setHtmlClassList(): void {
    document.documentElement.classList.value = window.htmlClassList(
      colorScheme,
      showingHeader,
      fontSize,
      showingFootnote,
      justify,
    );
  }

  // in this section, we're RESTORING the user's saved position, which involves
  // calculating a new Y offset based on the full document height. but due to
  // css rendering things (i think) the document height CHANGES after a few milleseconds
  // so we have to wait just a bit to ensure that we're calculating our percentage against
  // the final, fully-rendered document.  the text will be opacity: 0 during this time
  // and the setHtmlClassList() call will restore opacity once we're done
  let chapter: Element | null = null;
  if (chapterId && (chapter = document.getElementById(chapterId))) {
    window.setTimeout(() => {
      if (!chapter) return;
      const rect = chapter.getBoundingClientRect();
      const chapterOffset = rect.top + 75;
      window.scrollTo(0, chapterOffset);
      setHtmlClassList();
      sendMsg({ type: `update_position`, position: scrollPercent(chapterOffset) });
    }, 100);
  } else if (position > 0) {
    window.setTimeout(() => {
      window.scrollTo(0, scrollPixelOffsetY(position));
      setHtmlClassList();
    }, 100);
  }

  const fnOverlay = document.getElementById(`fn-overlay`);
  const fnHolder = document.getElementById(`fn-content-inner`);
  let beforeFootnoteShowScroll: number | null = null;
  let colorScheme = initialColorScheme;
  let showingHeader = initialShowingHeader;
  let fontSize = initialFontSize;
  let justify = initialJustify;
  let headerHeight = initialHeaderHeight;
  let showingFootnote = false;
  let lastScroll = window.scrollY;

  function sendMsg(msg: Message): void {
    window.ReactNativeWebView.postMessage(JSON.stringify(msg));
  }

  function setFootnotePadding(): void {
    if (fnOverlay) {
      const paddingTop = showingHeader ? headerHeight : safeAreaVerticalOffset;
      fnOverlay.style.paddingTop = `${paddingTop}px`;
    }
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
    window.setTimeout(() => {
      window.scrollTo(0, scrollPixelOffsetY(before));
    }, 150);
  };

  window.setColorScheme = (newColorScheme) => {
    colorScheme = newColorScheme;
    setHtmlClassList();
  };

  window.setJustify = (newJustify) => {
    justify = newJustify;
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
    --ebook-colorscheme-black-bg: ${tw.color(`ebookcolorscheme-blackbg`) ?? ``};
    --ebook-colorscheme-black-fg: ${tw.color(`ebookcolorscheme-blackfg`) ?? ``};
    --ebook-colorscheme-black-accent: ${tw.color(`ebookcolorscheme-blackaccent`) ?? ``};
    --ebook-colorscheme-white-bg: ${tw.color(`ebookcolorscheme-whitebg`) ?? ``};
    --ebook-colorscheme-white-fg: ${tw.color(`ebookcolorscheme-whitefg`) ?? ``};
    --ebook-colorscheme-white-accent: ${tw.color(`ebookcolorscheme-whiteaccent`) ?? ``};
    --ebook-colorscheme-sepia-bg: ${tw.color(`ebookcolorscheme-sepiabg`) ?? ``};
    --ebook-colorscheme-sepia-fg: ${tw.color(`ebookcolorscheme-sepiafg`) ?? ``};
    --ebook-colorscheme-sepia-accent: ${tw.color(`ebookcolorscheme-sepiaaccent`) ?? ``};
  }
`;

export function wrapHtml(
  html: string,
  css: string,
  colorScheme: EbookColorScheme,
  fontSize: number,
  justify: boolean,
  position: number,
  chapterId: string | undefined,
  showingHeader: boolean,
  headerHeight: number,
  safeAreaVerticalOffset: number,
): string {
  const classList = htmlClassList(
    colorScheme,
    showingHeader,
    fontSize,
    /* showingFootnote= */ false,
    justify,
  );
  return `
  <html class="${classList}${position > 0 ? ` await-init-position` : ``}" lang="${LANG}"> 
    <head>
       <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
       <style>${cssVars}</style>
       ${css}
       <style>.await-init-position * { opacity: 0 !important }</style>
    </head>
    <body>
      <div id="fn-overlay">
        <div id="fn-content">
          <div id="fn-content-inner">
          </div>
          <a id="fn-close" class="fn-close increase-clickable">&#x2715;</a>
        </div>
      </div>
      <div class="chapter-wrap">
        ${html}
      </div>
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
