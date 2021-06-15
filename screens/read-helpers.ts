import { Result } from 'x-ts-utils';
import Service from '../lib/service';
import { EditionResource } from '../types';
import { EbookEntity } from '../lib/models';
import { INSTALL } from '../env';

export async function readScreenProps(
  edition: EditionResource,
  networkConnected: boolean,
): Promise<Result<{ html: string; css: string }, 'unknown' | 'no_internet'>> {
  const entity = EbookEntity.fromResource(edition);
  // first we try the local filesystem
  const [fsData, fsCss] = await Promise.all([
    Service.fsEbookData(entity),
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

  // no network, no usable data, bail
  if (!networkConnected && !fsData) {
    return { success: false, error: `no_internet` };
  }

  // no network, but usable data, no need to check if changed
  if (!networkConnected && fsData) {
    return { success: true, value: { html: fsData.innerHtml, css } };
  }

  const shouldDownloadCheck = await Service.shouldDownloadCurrentNetworkFile(
    entity,
    edition.ebook.directDownloadUrl,
    fsData?.md5,
  );

  // we positively confirmed that we've got the latest version on the filesystem, so use it
  if (shouldDownloadCheck.success && shouldDownloadCheck.value === false && fsData) {
    return { success: true, value: { html: fsData.innerHtml, css } };
  }

  // something went wrong trying to determine if we've got the latest data
  // but we have something on the filesystem, so just use that
  if (!shouldDownloadCheck.success && fsData) {
    return { success: true, value: { html: fsData.innerHtml, css } };
  }

  // if we get here we KNOW we have a connection, and we don't know if our local data
  // (if we have it) we are not sure is the latest, so we'll try to get fresh

  // don't log for re-download of fresh version (or dev)
  const urlKey = fsData || INSTALL === `dev` ? `directDownloadUrl` : `loggedDownloadUrl`;
  const networkUrl = edition.ebook[urlKey];

  // if we get here, we either have NO fsData, or it's stale,
  // and we have a network connection, so we'll try to download a fresh copy
  const html = await Service.downloadLatestEbookHtml(entity, networkUrl);

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
