import { test, it, expect, describe } from '@jest/globals';
import Service from '../service';
import FS from '../fs';
import { EbookEntity, EbookRevisionEntity } from '../../lib/models';

jest.mock(`../fs`);

describe(`Service`, () => {
  describe(`fsEbookData()`, () => {
    it(`returns null when no fs file found for edition id`, async () => {
      (<jest.Mock>FS.filesWithPrefix).mockReturnValue([
        {
          filename: `fake-id--updated--9e86049.html`,
          path: { fsPath: `ebooks/fake-id--updated--9e86049.html` },
        },
      ]);
      const data = await Service.fsEbookData(new EbookEntity(`doc-id--updated`));
      expect(data).toBeNull();
    });

    it(`returns fs data when fs file found for edition id`, async () => {
      (<jest.Mock>FS.filesWithPrefix).mockReturnValue([
        {
          filename: `doc-id--updated--9e86049.html`,
          path: { fsPath: `ebooks/doc-id--updated--9e86049.html` },
        },
      ]);
      (<jest.Mock>FS.readFile).mockResolvedValue(`<p>the book</p>`);

      const data = await Service.fsEbookData(new EbookEntity(`doc-id--updated`));

      expect(data).toMatchObject({ sha: `9e86049`, innerHtml: `<p>the book</p>` });
    });
  });

  describe(Service.downloadLatestEbookHtml.name, () => {
    it(`returns null when the download returns null`, async () => {
      const entity = new EbookRevisionEntity(`555fff--updated`, `123abc`);
      (<jest.Mock>FS.download).mockResolvedValue(null);
      expect(await Service.downloadLatestEbookHtml(entity, `/`)).toBeNull();
    });

    it(`returns html when the download succeeds`, async () => {
      const entity = new EbookRevisionEntity(`555fff--updated`, `123abc`);
      (<jest.Mock>FS.download).mockResolvedValue(3555);
      (<jest.Mock>FS.readFile).mockResolvedValue(`<p>from network</p>`);
      expect(await Service.downloadLatestEbookHtml(entity, `/`)).toBe(
        `<p>from network</p>`,
      );
    });

    it(`returns cleans out old files after successful download`, async () => {
      const entity = new EbookRevisionEntity(`555fff--updated`, `123abc`);
      (<jest.Mock>FS.download).mockResolvedValue(3555);
      (<jest.Mock>FS.readFile).mockResolvedValue(`<p>new</p>`);
      (<jest.Mock>FS.filesWithPrefix).mockReturnValue([
        {
          filename: `doc-id--updated--OLDSHA1.html`,
          path: { fsPath: `ebooks/doc-id--updated--OLDSHA1.html` },
        },
        {
          filename: `doc-id--updated--OLDSHA2.html`,
          path: { fsPath: `ebooks/doc-id--updated--OLDSHA2.html` },
        },
      ]);
      expect(await Service.downloadLatestEbookHtml(entity, `/`)).toBe(`<p>new</p>`);
      expect(<jest.Mock>FS.deleteMany).toHaveBeenCalledWith([
        { fsPath: `ebooks/doc-id--updated--OLDSHA1.html` },
        { fsPath: `ebooks/doc-id--updated--OLDSHA2.html` },
      ]);
    });
  });
});
