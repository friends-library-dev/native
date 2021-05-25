import { beforeEach, it, describe, expect } from '@jest/globals';
import { readScreenProps } from '../read-helpers';
import { SyncProps, Props } from '../Read';
import Service from '../../lib/service';
import { EbookData, EditionResource } from 'types';

jest.mock(`../../lib/service`);

let fsData: EbookData | null = null;
let edition: Pick<EditionResource, 'id' | 'url' | 'revision'>;

describe(readScreenProps.name, () => {
  beforeEach(() => {
    (<jest.Mock>Service.fsEbookCss).mockResolvedValue(`fs_css`);
    edition = {
      id: `edition-id`,
      revision: `latest-sha`,
      url: `/edition-id.html`,
    };
  });

  describe(`when filesystem cached data FOUND`, () => {
    beforeEach(() => {
      fsData = {
        sha: `latest-sha`,
        innerHtml: `html`,
      };
    });

    it(`should return loaded props when fs data is latest`, async () => {
      fsData!.sha = `latest-sha`;
      (<jest.Mock>Service.fsEbookData).mockResolvedValue(fsData);

      const props = await readScreenProps(edition, true);

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

      const props = await readScreenProps(edition, true);

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
      fsData!.sha = `old-sha`;
      fsData!.innerHtml = `stale`;
      (<jest.Mock>Service.fsEbookData).mockResolvedValue(fsData);

      const props = await readScreenProps(edition, false);

      expect(props).toMatchObject({
        success: true,
        value: {
          html: `stale`,
          css: `<style>fs_css</style>`,
        },
      });
    });

    it(`should return STALE fs data when fresh download request fails`, async () => {
      fsData!.sha = `old-sha`;
      fsData!.innerHtml = `stale`;
      (<jest.Mock>Service.fsEbookData).mockResolvedValue(fsData);
      (<jest.Mock>Service.downloadLatestEbookHtml).mockResolvedValue(null); // <- network FAIL

      const props = await readScreenProps(edition, true);

      expect(props).toMatchObject({
        success: true,
        value: {
          html: `stale`,
          css: `<style>fs_css</style>`,
        },
      });
      expect(<jest.Mock>Service.downloadLatestEbookHtml).toHaveBeenCalledWith(edition);
    });
  });

  describe(`when filesystem cached data NOT FOUND`, () => {
    beforeEach(() => {
      (<jest.Mock>Service.fsEbookData).mockResolvedValue(null);
    });

    it(`should return no_internet error if no connection`, async () => {
      const props = await readScreenProps(edition, false);

      expect(props).toMatchObject({ success: false, error: `no_internet` });
    });

    it(`should return unknown error if connected but download request fails`, async () => {
      (<jest.Mock>Service.downloadLatestEbookHtml).mockResolvedValue(null); // <- network FAIL

      const props = await readScreenProps(edition, true);

      expect(props).toMatchObject({ success: false, error: `unknown` });
      expect(<jest.Mock>Service.downloadLatestEbookHtml).toHaveBeenCalledWith(edition);
    });

    it(`should return fresh html if download request succeeds`, async () => {
      (<jest.Mock>Service.downloadLatestEbookHtml).mockResolvedValue(`fresh_html`);

      const props = await readScreenProps(edition, true);

      expect(props).toMatchObject({
        success: true,
        value: {
          html: `fresh_html`,
          css: `<style>fs_css</style>`,
        },
      });
      expect(<jest.Mock>Service.downloadLatestEbookHtml).toHaveBeenCalledWith(edition);
    });
  });
});
