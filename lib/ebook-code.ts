import css from 'x-syntax';
import { EbookColorScheme } from '../types';
import { Element, Document, Window } from './dom-stubs';

export type Message =
  | {
      type: 'update_position';
      position: number;
    }
  | { type: 'click' };

function injectIntoWebView(window: Window, document: Document, position: number): void {
  const INTERVAL = 2000;
  if (position > 0) {
    window.scrollTo(0, position * document.documentElement.scrollHeight);
  }

  document.addEventListener(`click`, () => {});

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
      document.body.classList.add(`showing-footnote`);
      return;
    }

    if (target.matches(`#fn-close`)) {
      document.body.classList.remove(`showing-footnote`);
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

  .showing-footnote .footnote-marker {
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

  body.theme--white #fn-overlay,
  body.theme--white #fn-content {
    background: rgb(253, 253, 253);
  }

  body.theme--black #fn-overlay,
  body.theme--black #fn-content {
    background: black;
  }

  body.theme--sepia #fn-overlay,
  body.theme--sepia #fn-content {
    background: rgb(250, 242, 231);
  }

  .showing-footnote #fn-overlay {
    display: block;
  }

  .showing-footnote .chapter {
    display: none; /* android only, to prevent scroll whack jank */
  }

  body.showing-footnote {
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
`;

const cssVars = css`
  /*  */
`;

export function wrapHtml(
  html: string,
  css: string,
  colorScheme: EbookColorScheme,
  fontSize: number,
  position: number,
): string {
  return `
  <html> 
    <head>
       <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
       <style>${cssVars}</style>
       ${css}
       <style>${devCss}</style>
    </head>
    <body class="theme--${colorScheme} font-size--${fontSize}">
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
        ${injectIntoWebView.name}(window, document, ${position});
      </script>
    </body>
  </html>`;
}
