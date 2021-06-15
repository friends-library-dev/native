import { beforeEach, it, describe, expect } from '@jest/globals';
import { readScreenProps } from '../read-helpers';
import Service from '../../lib/service';
import { EbookData, EditionResource } from 'types';

jest.mock(`../../lib/service`);

let fsData: EbookData | null = null;
let edition: EditionResource;
const NETWORK_CONNECTED = true;
const NETWORK_NOT_CONNECTED = false;

describe(readScreenProps.name, () => {
  beforeEach(() => {
    (<jest.Mock>Service.fsEbookCss).mockResolvedValue(`fs_css`);
    (<jest.Mock>Service.shouldDownloadCurrentNetworkFile).mockResolvedValue({
      success: true,
      value: false,
    });
    edition = {
      id: `edition-id`,
      ebook: {
        directDownloadUrl: `/`,
        loggedDownloadUrl: `/logged`,
      },
    } as EditionResource;
  });

  describe(`when filesystem cached data FOUND`, () => {
    beforeEach(() => {
      fsData = {
        md5: `some-hash`,
        innerHtml: `html`,
      };
    });

    it(`should return fs data when error determining if should download`, async () => {
      fsData!.md5 = `some-local-hash`;
      (<jest.Mock>Service.fsEbookData).mockResolvedValue(fsData);
      (<jest.Mock>Service.shouldDownloadCurrentNetworkFile).mockResolvedValue({
        success: false, // <-- error determining if we need to download
        error: `unable to determine md5 of remote file`,
      });

      const props = await readScreenProps(edition, NETWORK_CONNECTED);

      expect(props).toMatchObject({
        success: true,
        value: {
          html: `html`,
          css: `<style>fs_css</style>`,
        },
      });
    });

    it(`should return loaded props when fs data is latest`, async () => {
      fsData!.md5 = `latest-hash`;
      (<jest.Mock>Service.fsEbookData).mockResolvedValue(fsData);
      (<jest.Mock>Service.shouldDownloadCurrentNetworkFile).mockResolvedValue({
        success: true,
        value: false,
      });

      const props = await readScreenProps(edition, NETWORK_CONNECTED);

      expect(props).toMatchObject({
        success: true,
        value: {
          html: `html`,
          css: `<style>fs_css</style>`,
        },
      });
    });

    it(`should use network css link if no fs css found`, async () => {
      (<jest.Mock>Service.fsEbookData).mockResolvedValue(fsData);
      (<jest.Mock>Service.fsEbookCss).mockResolvedValue(null); // <-- NO CSS!!!

      const props = await readScreenProps(edition, NETWORK_CONNECTED);

      expect(props).toMatchObject({
        success: true,
        value: {
          html: `html`,
          css: `<link rel="stylesheet" href="${Service.EBOOK_CSS_NETWORK_URL}">`,
        },
      });
      expect(<jest.Mock>Service.downloadLatestEbookCss).toHaveBeenCalled();
    });

    it(`should return STALE fs data when network not connected`, async () => {
      fsData!.md5 = `old-hash`;
      fsData!.innerHtml = `stale`;
      (<jest.Mock>Service.fsEbookData).mockResolvedValue(fsData);
      (<jest.Mock>Service.shouldDownloadCurrentNetworkFile).mockResolvedValue({
        success: true,
        value: true, // <-- network file DID change
      });
      const props = await readScreenProps(edition, NETWORK_NOT_CONNECTED);

      expect(props).toMatchObject({
        success: true,
        value: {
          html: `stale`,
          css: `<style>fs_css</style>`,
        },
      });
    });

    it(`should return STALE fs data when fresh download request fails`, async () => {
      fsData!.md5 = `old-hash`;
      fsData!.innerHtml = `stale`;
      (<jest.Mock>Service.fsEbookData).mockResolvedValue(fsData);
      (<jest.Mock>Service.shouldDownloadCurrentNetworkFile).mockResolvedValue({
        success: true,
        value: true, // <-- network file DID change
      });
      (<jest.Mock>Service.downloadLatestEbookHtml).mockResolvedValue(null); // <- ...BUT network FAIL

      const props = await readScreenProps(edition, NETWORK_CONNECTED);

      expect(props).toMatchObject({
        success: true,
        value: {
          html: `stale`,
          css: `<style>fs_css</style>`,
        },
      });

      const entity = (<jest.Mock>Service.downloadLatestEbookHtml).mock.calls[0][0];
      expect(entity.editionId).toBe(edition.id);
      expect(entity.revision).toBe(edition.revision);
    });
  });

  describe(`when filesystem cached data NOT FOUND`, () => {
    beforeEach(() => {
      (<jest.Mock>Service.fsEbookData).mockResolvedValue(null);
    });

    it(`should return no_internet error if no connection`, async () => {
      const props = await readScreenProps(edition, NETWORK_NOT_CONNECTED);

      expect(props).toMatchObject({ success: false, error: `no_internet` });
    });

    it(`should return unknown error if connected but download request fails`, async () => {
      (<jest.Mock>Service.downloadLatestEbookHtml).mockResolvedValue(null); // <- network FAIL

      const props = await readScreenProps(edition, NETWORK_CONNECTED);

      expect(props).toMatchObject({ success: false, error: `unknown` });

      const entity = (<jest.Mock>Service.downloadLatestEbookHtml).mock.calls[0][0];
      expect(entity.editionId).toBe(edition.id);
    });

    it(`should return fresh html if download request succeeds`, async () => {
      (<jest.Mock>Service.downloadLatestEbookHtml).mockResolvedValue(`fresh_html`);

      const props = await readScreenProps(edition, NETWORK_CONNECTED);

      expect(props).toMatchObject({
        success: true,
        value: {
          html: `fresh_html`,
          css: `<style>fs_css</style>`,
        },
      });

      const entity = (<jest.Mock>Service.downloadLatestEbookHtml).mock.calls[0][0];
      expect(entity.editionId).toBe(edition.id);
    });
  });
});
