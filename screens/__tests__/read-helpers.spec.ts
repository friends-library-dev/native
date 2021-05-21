import { beforeEach, it, describe, expect } from '@jest/globals';
import { readScreenProps } from '../read-helpers';
import { SyncProps, Props } from '../Read';
import Service from '../../lib/service';
import { EbookData } from 'types';

jest.mock(`../../lib/service`);

let fsData: EbookData | null = null;
let syncProps: SyncProps;
const dispatch: any = () => {};

describe(readScreenProps.name, () => {
  beforeEach(() => {
    (<jest.Mock>Service.fsEbookCss).mockResolvedValue(`fs_css`);
    syncProps = {
      networkConnected: true,
      position: 0,
      fontSize: 5,
      colorScheme: `white`,
      resource: {
        id: `edition-id`,
        revision: `latest-sha`,
        url: `/edition-id.html`,
      },
      setNavigationHeaderShown: () => {},
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

      const props = await readScreenProps(syncProps, dispatch);

      expect(props).toMatchObject({
        state: `ready`,
        html: `html`,
        css: `<style>fs_css</style>`,
      });
    });

    it(`should use network css link if no fs css found`, async () => {
      syncProps.networkConnected = true;
      (<jest.Mock>Service.fsEbookData).mockResolvedValue(fsData);
      (<jest.Mock>Service.fsEbookCss).mockResolvedValue(null); // <-- NO CSS!!!

      const props = await readScreenProps(syncProps, dispatch);

      expect(props).toMatchObject({
        state: `ready`,
        html: `html`,
        css: `<link rel="stylesheet" href="${Service.EBOOK_CSS_NETWORK_URL}">`,
      });
      expect(<jest.Mock>Service.downloadLatestEbookCss).toHaveBeenCalled();
    });

    it(`should return STALE fs data when network not connected`, async () => {
      syncProps.networkConnected = false;
      fsData!.sha = `old-sha`;
      fsData!.innerHtml = `stale`;
      (<jest.Mock>Service.fsEbookData).mockResolvedValue(fsData);

      const props = await readScreenProps(syncProps, dispatch);

      expect(props).toMatchObject({
        state: `ready`,
        html: `stale`,
        css: `<style>fs_css</style>`,
      });
    });

    it(`should return STALE fs data when fresh download request fails`, async () => {
      syncProps.networkConnected = true;
      fsData!.sha = `old-sha`;
      fsData!.innerHtml = `stale`;
      (<jest.Mock>Service.fsEbookData).mockResolvedValue(fsData);
      (<jest.Mock>Service.downloadLatestEbookHtml).mockResolvedValue(null); // <- network FAIL

      const props = await readScreenProps(syncProps, dispatch);

      expect(props).toMatchObject({
        state: `ready`,
        html: `stale`,
        css: `<style>fs_css</style>`,
      });
      expect(<jest.Mock>Service.downloadLatestEbookHtml).toHaveBeenCalledWith(
        syncProps.resource,
      );
    });
  });

  describe(`when filesystem cached data NOT FOUND`, () => {
    beforeEach(() => {
      (<jest.Mock>Service.fsEbookData).mockResolvedValue(null);
    });

    it(`should return no_internet error if no connection`, async () => {
      syncProps.networkConnected = false;

      const props = await readScreenProps(syncProps, dispatch);

      expect(props).toMatchObject({ state: `error`, reason: `no_internet` });
    });

    it(`should return unknown error if connected but download request fails`, async () => {
      syncProps.networkConnected = true;
      (<jest.Mock>Service.downloadLatestEbookHtml).mockResolvedValue(null); // <- network FAIL

      const expected: Props = { state: `error`, reason: `unknown` };

      const props = await readScreenProps(syncProps, dispatch);

      expect(props).toMatchObject(expected);
      expect(<jest.Mock>Service.downloadLatestEbookHtml).toHaveBeenCalledWith(
        syncProps.resource,
      );
    });

    it(`should return fresh html if download request succeeds`, async () => {
      syncProps.networkConnected = true;
      (<jest.Mock>Service.downloadLatestEbookHtml).mockResolvedValue(`fresh_html`);

      const props = await readScreenProps(syncProps, dispatch);

      expect(props).toMatchObject({
        state: `ready`,
        html: `fresh_html`,
        css: `<style>fs_css</style>`,
      });
      expect(<jest.Mock>Service.downloadLatestEbookHtml).toHaveBeenCalledWith(
        syncProps.resource,
      );
    });
  });
});
