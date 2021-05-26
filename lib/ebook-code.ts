import css from 'x-syntax';
import { EbookColorScheme, EbookData } from '../types';
import { Element, Document, Window } from './dom-stubs';
import tw from '../lib/tailwind';

export type Message =
  | {
      type: 'update_position';
      position: number;
    }
  | {
      type: 'debug';
      value: string;
    }
  | {
      type: 'set_footnote_visibility';
      visible: boolean;
    }
  | {
      type: 'toggle_header_visibility';
    };

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
  initialFontSize: number,
  initialColorScheme: EbookColorScheme,
  initialShowingHeader: boolean,
  initialHeaderHeight: number,
  safeAreaVerticalOffset: number,
): void {
  if (position > 0) {
    window.scrollTo(0, position * document.documentElement.scrollHeight);
  }

  const fnOverlay = document.getElementById(`fn-overlay`);
  const fnHolder = document.getElementById(`fn-content-inner`);
  let colorScheme = initialColorScheme;
  let showingHeader = initialShowingHeader;
  let fontSize = initialFontSize;
  let headerHeight = initialHeaderHeight;
  let showingFootnote = false;
  let interval = 0;

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
    const before = window.scrollY / document.documentElement.scrollHeight;
    setHtmlClassList();
    window.scrollTo(0, before * document.documentElement.scrollHeight);
  };

  window.setColorScheme = (newColorScheme) => {
    colorScheme = newColorScheme;
    setHtmlClassList();
  };

  const SCROLL_INTERVAL_DELAY = 2000;
  let lastScroll = window.scrollY;
  interval = window.setInterval(() => {
    const newScroll = window.scrollY;
    if (newScroll !== lastScroll) {
      const percent = newScroll / document.documentElement.scrollHeight;
      const message: Message = { type: `update_position`, position: percent };
      window.ReactNativeWebView.postMessage(JSON.stringify(message));
    }
    lastScroll = newScroll;
  }, SCROLL_INTERVAL_DELAY);

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

    let beforeFootnoteShowScroll: number | null = null;
    const target = event.target as Element;

    if (target.matches(`.footnote-marker`)) {
      const fnContent = target.nextElementSibling;
      if (!fnContent) return;
      beforeFootnoteShowScroll = window.scrollY;
      fnHolder.innerHTML = fnContent.innerHTML;
      showingFootnote = true;
      setHtmlClassList();
      sendMsg({ type: `set_footnote_visibility`, visible: true });
      return;
    }

    if (target.matches(`.fn-close`)) {
      showingFootnote = false;
      setHtmlClassList();
      if (beforeFootnoteShowScroll) {
        window.scrollTo(0, beforeFootnoteShowScroll);
        beforeFootnoteShowScroll = null;
      }
      fnHolder.innerHTML = ``;
      sendMsg({ type: `set_footnote_visibility`, visible: false });
      return;
    }

    return !showingFootnote && sendMsg({ type: `toggle_header_visibility` });
  });
}

const devCss = css`
  html {
    font-size: 20px;
    padding: 1.6em;
  }

  html.font-size--1 {
    font-size: 12px;
  }

  html.font-size--2 {
    font-size: 14px;
  }

  html.font-size--3 {
    font-size: 16px;
  }

  html.font-size--4 {
    font-size: 18px;
  }

  html.font-size--5 {
    font-size: 20px;
    padding: 1.5em;
  }

  html.font-size--6 {
    font-size: 22px;
    padding: 1.5em;
  }

  html.font-size--7 {
    font-size: 24px;
    padding: 1.4em;
  }

  html.font-size--8 {
    font-size: 26px;
    padding: 1.3em;
  }

  html.font-size--9 {
    font-size: 28px;
    padding: 1.1em;
  }

  html.font-size--10 {
    font-size: 30px;
    padding: 1em;
  }

  dd {
    text-align: left;
  }

  .chapter-1 {
    margin-top: 6rem;
  }

  .chapter + .chapter {
    margin-top: 25vh;
  }

  .footnote,
  .footnote-content {
    display: none;
  }

  .footnote.prepared {
    display: inline;
  }

  .fn-close {
    font-weight: 700;
  }

  .colorscheme--white .fn-close,
  .colorscheme--white .footnote-marker {
    color: blue;
  }

  .colorscheme--black .fn-close,
  .colorscheme--black .footnote-marker {
    color: rgba(110, 141, 234, 1);
  }

  .colorscheme--sepia .fn-close,
  .colorscheme--sepia .footnote-marker {
    color: var(--ebook-colorscheme-sepia-accent);
  }

  .footnote-marker {
    font-size: 1em;
    margin-left: -0.15rem;
    display: inline-block;
    transform: translateY(-0.4rem);
    vertical-align: baseline;
  }

  .increase-clickable {
    display: inline-block;
  }

  .increase-clickable::after {
    content: '';
    position: absolute;
    width: 50px;
    height: 50px;
    left: 0;
    top: 0;
    transform: translate(calc(0.5em - 50%), calc(0.5em - 50%));
    /* background: rgba(0, 255, 0, 0.3); */
  }

  .footnote--visible .footnote-marker {
    opacity: 0;
    transform: translateX(-1000rem);
  }

  #fn-overlay {
    position: fixed;
    display: none;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    height: 100vh;
    width: 100vw;
    box-sizing: border-box;
  }

  body {
    padding: 0;
  }

  .colorscheme--white #fn-overlay,
  .colorscheme--white #fn-content {
    background: rgb(253, 253, 253);
  }

  .colorscheme--black #fn-overlay,
  .colorscheme--black #fn-content {
    background: black;
  }

  .colorscheme--sepia #fn-overlay,
  .colorscheme--sepia #fn-content {
    background: rgb(250, 242, 231);
  }

  .footnote--visible #fn-overlay {
    display: block;
  }

  .footnote--visible .chapter {
    display: none; /* android only, to prevent scroll whack jank */
  }

  .footnote--visible body {
    overflow: hidden;
  }

  #fn-close {
    z-index: 50;
    position: absolute;
    top: -6px;
    left: 4px;
    padding: 20px 1em 1em 1em;
    font-size: 22px !important;
  }

  #fn-close.increase-clickable::after {
    left: 15px;
    top: 0;
    height: 120px;
    width: 100px;
  }

  .fn-close-back {
    display: inline-block;
    transform: scale(1.3);
    padding-left: 0.4em;
  }

  .fn-close-back.increase-clickable::after {
    left: 10px;
  }

  #fn-content {
    position: relative;
    overflow: scroll;
    max-height: 100vh;
    padding: 15px 30px 1rem 60px;
    /* margin-top: 15px; */
  }

  #fn-content-inner {
    padding-bottom: 8rem;
  }

  /* add to .paragraph in web.css.ts */
  #fn-content-inner,
  #fn-content-inner > * {
    font-size: 0.9em;
    text-align: left;
    line-height: 150%;
    -webkit-hyphens: auto !important;
  }

  #fn-content-inner .footnote-paragraph {
    font-size: 1.1111111em;
  }

  .colorscheme--white body {
    background: var(--ebook-colorscheme-white-bg, rgb(253, 253, 253));
    color: var(--ebook-colorscheme-white-fg, rgb(3, 3, 3));
  }

  .colorscheme--black body {
    background: var(--ebook-colorscheme-black-bg, black);
    color: var(--ebook-colorscheme-black-fg, rgb(169, 169, 169));
  }

  .colorscheme--sepia body {
    background: var(--ebook-colorscheme-sepia-bg, rgb(250, 242, 231));
    color: var(--ebook-colorscheme-sepia-fg, rgb(50, 50, 50));
  }

  .embedded-content-document {
    margin-left: 0;
  }
`;

const cssVars = css`
  :root {
    --ebook-colorscheme-black-bg: ${tw.color(`ebook-colorscheme-black-bg`) ?? ``};
    --ebook-colorscheme-black-fg: ${tw.color(`ebook-colorscheme-black-fg`) ?? ``};
    --ebook-colorscheme-white-bg: ${tw.color(`ebook-colorscheme-white-bg`) ?? ``};
    --ebook-colorscheme-white-fg: ${tw.color(`ebook-colorscheme-white-fg`) ?? ``};
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
       <style>${devCss}</style>
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
