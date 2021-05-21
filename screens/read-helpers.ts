import { Result } from 'x-ts-utils';
import Service from '../lib/service';
import { EditionResource } from '../types';

export async function readScreenProps(
  edition: Pick<EditionResource, 'id' | 'url' | 'revision'>,
  networkConnected: boolean,
): Promise<Result<{ html: string; css: string }, 'unknown' | 'no_internet'>> {
  // first we try the local filesystem
  const [fsData, fsCss] = await Promise.all([
    Service.fsEbookData(edition.id),
    Service.fsEbookCss(),
  ]);

  const css = fsCss
    ? `<style>${fsCss}</style>`
    : `<link rel="stylesheet" href="${Service.EBOOK_CSS_NETWORK_URL}">`;

  // this should almost never happen, but if we don't have filesystem CSS
  // and we are connected, try to get fresh css for the next ebook load
  // no need to await on it, since it should be loaded through the <link>
  if (!fsCss && networkConnected) {
    Service.downloadLatestEbookCss();
  }

  if (fsData && (fsData.sha === edition.revision || !networkConnected)) {
    return { success: true, value: { html: fsData.innerHtml, css } };
  }

  if (!networkConnected) {
    return { success: false, error: `no_internet` };
  }

  // if we get here, we either have NO fsData, or it's stale,
  // and we have a network connection, so we'll try to download a fresh copy
  const html = await Service.downloadLatestEbookHtml(edition);

  if (!html) {
    if (fsData) {
      return { success: true, value: { html: fsData.innerHtml, css } };
    } else {
      return { success: false, error: `unknown` };
    }
  } else {
    return { success: true, value: { html, css } };
  }
}
