import css from 'x-syntax';
import { EbookColorScheme, SearchResult } from '../types';
import { Element, Document, Window } from './dom-stubs';
import tw from '../lib/tailwind';
import { LANG } from '../env';
import { search } from '../lib/search';

export type Message =
  | { type: 'update_position'; position: number }
  | { type: 'debug'; value: string }
  | { type: 'search_results'; results: SearchResult[] }
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
    `version--gte-2_1_0`,
    `colorscheme--${colorScheme}`,
    `font-size--${fontSize}`,
    `footnote--${showingFootnote ? `visible` : `hidden`}`,
    `header--${showingHeader ? `visible` : `hidden`}`,
    `align--${justify ? `justify` : `ragged`}`,
  ];

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

  let enumerateSearchableElements: () => void = () => {
    const selectors = [
      `h2`,
      `h3`,
      `h4`,
      `.paragraph`,
      `.offset`,
      `.discourse-part`,
      `.salutation`,
      `.heading-continuation-blurb`,
      `.verse-line`,
      `.signed-section-signature`,
      `.signed-section-closing`,
      `.signed-section-context-open`,
      `.signed-section-context-close`,
      `.section-summary-preface`,
      `.letter-heading`,
      `.no-indent`,
      `.quote-attribution`,
      `cite`,
      `dt`,
      `dd`,
      `.syllogism li`,
    ];
    document.querySelectorAll(selectors.join(`, `)).forEach((el, index) => {
      el.classList.add(`_searchable`);
      el.classList.add(`_searchable-${index}`);
    });
    enumerateSearchableElements = () => {};
  };

  let enumeratedHtml = ``;

  function getSearchPositionPercentage(kls: string): number | null {
    if (enumeratedHtml === ``) {
      enumerateSearchableElements();
      document
        .querySelectorAll(`.chapter-wrap`)
        .forEach((wrap) => (enumeratedHtml = wrap.innerHTML));
    }
    const location = enumeratedHtml.indexOf(kls);
    if (location === -1 || enumeratedHtml === ``) {
      return null;
    }
    return Number(((location / enumeratedHtml.length) * 100).toFixed(1));
  }

  const MAX_SEARCH_RESULTS_RETURNED = 50;

  window.navigateToSearchResult = (result) => {
    const element = document.querySelector(`.${result.elementId}`);
    if (!element) return;
    const innerText = element.innerText;
    let before = innerText.substring(0, result.startIndex);
    let after = innerText.substring(result.endIndex);
    let match = result.match;

    // the original query and search result selected came from .innerText
    // but if possible, try to use innerHTML match, to preserve footnotes, etc.
    const innerHtml = element.innerHTML;
    const htmlResults = window.search(lastQuery, innerHtml);
    const htmlResult = htmlResults[result.siblingIndex];
    if (htmlResults.length === result.numResultsInElement && htmlResult) {
      before = innerHtml.substring(0, htmlResult.start);
      after = innerHtml.substring(htmlResult.end);
      match = htmlResult.match;
    }

    const id = `result-${Date.now()}`;
    element.innerHTML = `${before}<span id="${id}" class="search-result">${match}</span>${after}`;
    document.getElementById(id)?.scrollIntoView({ behavior: `auto`, block: `center` });
  };

  window.clearSearchResults = () => {
    document
      .querySelectorAll(`.search-result`)
      .forEach((el) => el.classList.remove(`search-result`));
  };

  let lastQuery = ``;

  window.requestSearchResults = (query) => {
    enumerateSearchableElements();
    lastQuery = query;
    const results: SearchResult[] = [];
    document.querySelectorAll(`._searchable`).forEach((el) => {
      // use `>` not `>=` to send the app up to MAX + 1 results, so it can
      // differentiate between getting exactly MAX and knowing results are truncated
      if (results.length > MAX_SEARCH_RESULTS_RETURNED) return;

      const idMatch = el.classList.value.match(/_searchable-\d+/);
      if (!idMatch) return;
      const id = idMatch[0] ?? ``;
      window.search(query, el.innerText).forEach((match) => {
        const percentage = getSearchPositionPercentage(id);
        if (percentage === null) return;
        results.push({
          before: match.before,
          after: match.after,
          match: match.match,
          percentage,
          elementId: id,
          startIndex: match.start,
          endIndex: match.end,
          siblingIndex: 0,
          numResultsInElement: 0,
        });
      });
    });

    results.forEach((result, index) => {
      result.siblingIndex = index;
      result.numResultsInElement = results.length;
    });

    sendMsg({ type: `search_results`, results });
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

      // without this, coming to another footnote after having scrolled down
      // in a previous long footnote causes the user to already be scrolled down
      document.getElementById(`fn-content`)?.scrollTo(0, 0);

      return sendMsg({ type: `set_footnote_visibility`, visible: true });
    }

    if (target.matches(`.fn-close`)) {
      return window.dismissFootnote();
    }

    if (target.matches(`.__xref`)) {
      setTimeout(() => {
        // little hack to make navigating to/from endnotes (currently only in Jaffray)
        // nicer, padding the destination by a few pixels so it's not stuck to viewport top
        window.scrollTo(0, window.scrollY - (showingHeader ? headerHeight + 45 : 45));
      }, 50);
      return;
    }

    if (!showingFootnote) {
      sendMsg({ type: `toggle_header_visibility` });
    }
  });

  // vvv- uncomment (plus add @ts-ignore) to develop footnote view
  // document.querySelectorAll(`.footnote-marker`)[0].click();
}

function cssVars(headerHeight: number): string {
  return css`
    :root {
      --header-height: ${headerHeight}px;
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
}

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
       <style>${cssVars(headerHeight)}</style>
       ${css}
       <style>
         .search-result { background: green; color: white !important; }
       </style>
       <style>.await-init-position * { opacity: 0 !important }</style>
    </head>
    <body>
      <div id="fn-overlay">
        <div id="fn-content">
          <div id="fn-content-inner"></div>
        </div>
        <div id="fn-back">
          <div id="fn-back-inner">
            <a id="back-to-text" class="fn-close">
              ${LANG === `en` ? `Back to Text` : `Volver al Texto`}
            </a>
            <p>
              ${LANG === `en` ? `or swipe right` : `o desliza a la derecha`} &rarr;
            </p>
          </div>
        </div>
      </div>
      <div class="chapter-wrap">
        ${html}
      </div>
      <script>
        window.search = ${search.toString()}
        window.htmlClassList = ${htmlClassList.toString()}
        ${injectIntoWebView.toString()}
        ${injectIntoWebView.name}(
          window,
          document,
          ${position},
          ${chapterId ? `"${chapterId}"` : `undefined`},
          ${fontSize},
          "${colorScheme}",
          ${justify},
          ${showingHeader},
          ${headerHeight},
          ${safeAreaVerticalOffset}
         );
      </script>
    </body>
  </html>`;
}
