import css from 'x-syntax';
import { EbookColorScheme, EbookData } from '../types';
import { Element, Document, Window } from './dom-stubs';
import tw from '../lib/tailwind';

export type Message =
  | {
      type: 'update_position';
      position: number;
    }
  | { type: 'click' };

function injectIntoWebView(
  window: Window,
  document: Document,
  position: number,
  initialFontSize: number,
  initialColorScheme: EbookColorScheme,
  initialShowingHeader: boolean,
): void {
  const INTERVAL = 2000;
  if (position > 0) {
    window.scrollTo(0, position * document.documentElement.scrollHeight);
  }

  let colorScheme = initialColorScheme;
  let showingHeader = initialShowingHeader;
  let fontSize = initialFontSize;
  let showingFootnote = false;

  window.htmlClassList = (colorScheme, fontSize, showingHeader, showingFootnote) => {
    return [
      `colorscheme--${colorScheme}`,
      `font-size--${fontSize}`,
      `footnote--${showingFootnote ? `visible` : `hidden`}`,
      `header--${showingHeader ? `visible` : `hidden`}`,
    ].join(` `);
  };

  function setHtmlClassList() {
    document.documentElement.classList.value = window.htmlClassList(
      colorScheme,
      fontSize,
      showingHeader,
      showingFootnote,
    );
    // alert(document.documentElement.classList.value);
  }

  window.setFontSize = (newFontSize: number) => {
    fontSize = newFontSize;
    const before = window.scrollY / document.documentElement.scrollHeight;
    setHtmlClassList();
    window.scrollTo(0, before * document.documentElement.scrollHeight);
  };

  window.setColorScheme = (newColorScheme: EbookColorScheme) => {
    colorScheme = newColorScheme;
    setHtmlClassList();
  };

  let lastScroll = window.scrollY;
  setInterval(() => {
    const newScroll = window.scrollY;
    if (newScroll !== lastScroll) {
      const percent = newScroll / document.documentElement.scrollHeight;
      const message: Message = { type: `update_position`, position: percent };
      window.ReactNativeWebView.postMessage(JSON.stringify(message));
    }
    lastScroll = newScroll;
  }, INTERVAL);

  document.querySelectorAll(`span.footnote`).forEach((node, index) => {
    let innerHtml = node.innerHTML;
    innerHtml = `
        <sup class="footnote-marker">[${index + 1}]</sup>
        <span class="footnote-content">${innerHtml}</span>
      `;
    node.innerHTML = innerHtml;
    node.classList.add(`prepared`);
  });

  const fnHolder = document.getElementById(`fn-content-inner`);
  let beforeFootnoteShowScroll: number | null = null;

  document.addEventListener(`click`, (event) => {
    function sendClick() {
      const clickMsg: Message = { type: `click` };
      window.ReactNativeWebView.postMessage(JSON.stringify(clickMsg));
    }

    if (!fnHolder || typeof event.target.matches !== `function`) {
      return sendClick();
    }

    const target = event.target as Element;
    if (target.matches(`.footnote-marker`)) {
      const fnContent = target.nextElementSibling;
      if (!fnContent) return;
      beforeFootnoteShowScroll = window.scrollY;
      fnHolder.innerHTML = fnContent.innerHTML;
      showingFootnote = true;
      setHtmlClassList();
      return;
    }

    if (target.matches(`#fn-close`)) {
      showingFootnote = false;
      setHtmlClassList();
      if (beforeFootnoteShowScroll) {
        window.scrollTo(0, beforeFootnoteShowScroll);
        beforeFootnoteShowScroll = null;
      }
      fnHolder.innerHTML = ``;
      return;
    }
    sendClick();
  });
}

const devCss = css`
  html {
    font-size: 20px;
    padding: 1.75em;
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
    padding: 1.6em;
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

  .chapter-1 {
    margin-top: 5rem;
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

  .footnote-marker {
    color: blue;
    font-size: 1em;
    margin-left: -0.1rem;
    display: inline-block;
    transform: translateY(-0.4rem);
    vertical-align: baseline;
  }

  .footnote--visible .footnote-marker {
    opacity: 0;
    transform: translateX(-1000rem);
  }

  #fn-overlay {
    position: fixed;
    display: none;
    top: 0;
    /* padding-top: 86px; */
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
    position: absolute;
    top: 5%;
    left: 5%;
  }

  #fn-content {
    overflow: scroll;
    max-height: 100vh;
    padding: 1.75rem 2rem 1rem 3.25rem;
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
    /* Accent: var(--ebook-colorscheme-sepia-accent, rgb(201, 154, 61)); */
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
): string {
  return `
  <html class="colorscheme--${colorScheme} font-size--${fontSize} header--visible footnote--hidden"> 
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
        </div>
        <a id="fn-close">&#x2715;</a>
      </div>
      ${html}
      <script>
        ${injectIntoWebView.toString()}
        ${injectIntoWebView.name}(
          window,
          document,
          ${position},
          ${fontSize},
          "${colorScheme}",
          ${showingHeader}
         );
      </script>
    </body>
  </html>`;
}
