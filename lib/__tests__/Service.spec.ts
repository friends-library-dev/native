import { it, expect, describe } from '@jest/globals';
import Service from '../service';
import FS from '../fs';
import { EbookEntity } from '../../lib/models';

jest.mock(`../fs`);

describe(`Service`, () => {
  describe(Service.downloadLatestEbookHtml.name, () => {
    it(`returns null when the download returns null`, async () => {
      const entity = new EbookEntity(`555fff--updated`);
      (<jest.Mock>FS.download).mockResolvedValue(null);
      expect(await Service.downloadLatestEbookHtml(entity, `/`)).toBeNull();
    });

    it(`returns html when the download succeeds`, async () => {
      const entity = new EbookEntity(`555fff--updated`);
      (<jest.Mock>FS.download).mockResolvedValue(3555);
      (<jest.Mock>FS.readFile).mockResolvedValue(`<p>from network</p>`);
      expect(await Service.downloadLatestEbookHtml(entity, `/`)).toBe(
        `<p>from network</p>`,
      );
    });
  });
});
