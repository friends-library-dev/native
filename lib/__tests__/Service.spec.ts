import { test, it, expect, describe } from '@jest/globals';
import Service from '../service';
import FS from '../fs';

jest.mock(`../fs`);

// editions/d9964dc1-bfcb-4bcf-b094-4051b10d251e--modernized--9e86049.html
// (<jest.Mock>Service.fsEbookData).mockResolvedValue(data);

describe(`Service`, () => {
  describe(`fsEbookData()`, () => {
    it(`returns null when no fs file found for edition id`, async () => {
      (<jest.Mock>FS.filesWithPrefix).mockReturnValue([
        {
          abspath: `/some/path/to/editions/fake-id--updated--9e86049.html`,
          relPath: `editions/fake-id--updated--9e86049.html`,
          filename: `fake-id--updated--9e86049.html`,
        },
      ]);
      const data = await Service.fsEbookData(`doc-id--updated`);
      expect(data).toBeNull();
    });

    it(`returns fs data when fs file found for edition id`, async () => {
      (<jest.Mock>FS.filesWithPrefix).mockReturnValue([
        {
          abspath: `/some/path/to/editions/doc-id--updated--9e86049.html`,
          relPath: `editions/doc-id--updated--9e86049.html`,
          filename: `doc-id--updated--9e86049.html`,
        },
      ]);
      (<jest.Mock>FS.readFile).mockResolvedValue(`<p>the book</p>`);

      const data = await Service.fsEbookData(`doc-id--updated`);

      expect(data).toMatchObject({ sha: `9e86049`, innerHtml: `<p>the book</p>` });
    });
  });

  describe(`networkFetchEbookHtml()`, () => {
    it(`returns null when the download returns null`, async () => {
      const edition = { url: `/`, revision: `123abc`, id: `some-id` };
      (<jest.Mock>FS.download).mockResolvedValue(null);
      expect(await Service.downloadLatestEbookHtml(edition)).toBeNull();
    });

    it(`returns html when the download succeeds`, async () => {
      const edition = { url: `/`, revision: `123abc`, id: `some-id` };
      (<jest.Mock>FS.download).mockResolvedValue(3555);
      (<jest.Mock>FS.readFile).mockResolvedValue(`<p>from network</p>`);
      expect(await Service.downloadLatestEbookHtml(edition)).toBe(`<p>from network</p>`);
    });

    it(`returns cleans out old files after successful download`, async () => {
      const edition = { url: `/`, revision: `123abc`, id: `some-id` };
      (<jest.Mock>FS.download).mockResolvedValue(3555);
      (<jest.Mock>FS.readFile).mockResolvedValue(`<p>new</p>`);
      (<jest.Mock>FS.filesWithPrefix).mockReturnValue([
        {
          abspath: `/some/path/to/editions/doc-id--updated--OLDSHA1.html`,
          relPath: `editions/doc-id--updated--OLDSHA1.html`,
          filename: `doc-id--updated--OLDSHA1.html`,
        },
        {
          abspath: `/some/path/to/editions/doc-id--updated--OLDSHA2.html`,
          relPath: `editions/doc-id--updated--OLDSHA2.html`,
          filename: `doc-id--updated--OLDSHA2.html`,
        },
      ]);
      expect(await Service.downloadLatestEbookHtml(edition)).toBe(`<p>new</p>`);
      expect(<jest.Mock>FS.deleteMany).toHaveBeenCalledWith([
        `editions/doc-id--updated--OLDSHA1.html`,
        `editions/doc-id--updated--OLDSHA2.html`,
      ]);
    });
  });
});
