import { it, describe, expect } from '@jest/globals';
import { EbookData, EditionResource } from '../../../types';
import { INITIAL_STATE, State } from '../../';
import { editionResource, ebookData, ebookPosition } from '../ebook';
import Service from '../../../lib/service';

jest.mock(`../../../lib/service`);

let state: State;
let resource: EditionResource;

describe(`edition selectors`, () => {
  beforeEach(() => {
    resource = {
      id: `123abc--updated`,
      documentId: `08b94a0b-b96f-4525-bd46-79b0d60c4302`,
      type: `modernized`,
      publishedDate: `2018-09-03T20:49:44.000Z`,
      documentTitle: `Letter to a Backslidden Brother`,
      friendName: `Catherine Payton`,
      friendNameSort: `Payton, Catherine`,
      url: `/`,
      squareCoverImageUrl: `/Letter_to_Backslidden_Brother--modernized--audio.png`,
      documentDescription: `doc desc`,
      documentShortDescription: `short desc`,
      numTotalPaperbackPages: 12,
      isMostModernized: true,
      chapters: [{ shortTitle: `Letter to a Backslidden Brother` }],
      revision: `9a460a2`,
    };
    state = JSON.parse(JSON.stringify(INITIAL_STATE));
    state.editions.resources = { '123abc--updated': resource };
  });

  describe(ebookPosition.name, () => {
    it(`returns 0 when no data in state`, () => {
      expect(ebookPosition(`not-in-state--updated`, state)).toBe(0);
    });

    it(`returns saved number when exists in state`, () => {
      state.editions.ebookPosition[`some-id--updated`] = 33;
      expect(ebookPosition(`some-id--updated`, state)).toBe(33);
    });
  });

  describe(editionResource.name, () => {
    it(`returns null for unknown resource`, () => {
      expect(editionResource(`unknown`, state)).toBeNull();
    });

    it(`returns resource for found resource`, () => {
      expect(editionResource(`123abc--updated`, state)).toMatchObject({ ...resource });
    });
  });

  describe(ebookData.name, () => {
    it(`returns null for missing resource`, async () => {
      expect(await ebookData(`unknown`, state)).toBeNull();
    });

    it(`returns fs data when sha current`, async () => {
      const data: EbookData = {
        sha: resource.revision,
        innerHtml: `<p>test</p>`,
      };
      (<jest.Mock>Service.fsEbookData).mockResolvedValue(data);
      expect(await ebookData(`123abc--updated`, state)).toMatchObject({ ...data });
    });

    it(`returns stale fs data when sha old, but no internet`, async () => {
      const staleData: EbookData = {
        sha: `old-sha`,
        innerHtml: `<p>test</p>`,
      };

      state.network.connected = false;
      (<jest.Mock>Service.fsEbookData).mockResolvedValue(staleData);

      expect(await ebookData(`123abc--updated`, state)).toMatchObject({ ...staleData });
    });

    it(`returns fetched fs data when sha old, and able to re-fetch`, async () => {
      const staleData: EbookData = {
        sha: `old-sha`,
        innerHtml: `<p>old</p>`,
      };

      state.network.connected = true;
      (<jest.Mock>Service.fsEbookData).mockResolvedValue(staleData);
      (<jest.Mock>Service.downloadLatestEbookHtml).mockResolvedValue(`<p>new</p>`);

      expect(await ebookData(`123abc--updated`, state)).toMatchObject({
        sha: resource.revision,
        innerHtml: `<p>new</p>`,
      });
    });

    it(`returns stale fs data when sha old, but network fetch fails`, async () => {
      const staleData: EbookData = {
        sha: `old-sha`,
        innerHtml: `<p>test</p>`,
      };

      state.network.connected = false;
      (<jest.Mock>Service.fsEbookData).mockResolvedValue(staleData);
      (<jest.Mock>Service.downloadLatestEbookHtml).mockResolvedValue(null);

      expect(await ebookData(`123abc--updated`, state)).toMatchObject({ ...staleData });
    });

    it(`returns null if no FS data, and network fetch fails`, async () => {
      state.network.connected = true;
      (<jest.Mock>Service.fsEbookData).mockResolvedValue(null);
      (<jest.Mock>Service.downloadLatestEbookHtml).mockResolvedValue(null);

      expect(await ebookData(`123abc--updated`, state)).toBeNull();
    });
  });
});
