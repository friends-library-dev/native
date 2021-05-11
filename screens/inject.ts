interface Window {
  scrollY: number;
  ReactNativeWebView: {
    postMessage: (event: string) => unknown;
  };
}

export function injectIntoWebView(window: Window) {
  // window.scrollTo(0, ${TEST});

  let lastScroll = 0;
  const INTERVAL = 2000;

  setInterval(() => {
    const currentScroll = window.scrollY;
    if (currentScroll !== lastScroll) {
      window.ReactNativeWebView.postMessage(String(window.scrollY));
    }
    lastScroll = currentScroll;
  }, INTERVAL);
}
