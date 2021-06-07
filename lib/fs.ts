import RNFS from 'react-native-fs';
import { Platform } from 'react-native';
import { ValuesOf } from 'x-ts-utils';
import { FsPath } from './models';

export class FileSystem {
  private manifest: Record<string, number | undefined> = {};
  private downloads: Record<string, Promise<number | null>> = {};

  public static readonly paths = {
    state: `data/state.json`,
    editions: `data/editions.json`,
  } as const;

  public static readonly dirs = {
    images: `images`,
    audio: `audio`,
    ebooks: `ebooks`,
    data: `data`,
  } as const;

  public async init(): Promise<void> {
    const BACKUP_EXCLUDE = { NSURLIsExcludedFromBackupKey: true };

    await Promise.all([
      RNFS.mkdir(this.abspath()),
      RNFS.mkdir(this.abspath(`${FileSystem.dirs.images}/`), BACKUP_EXCLUDE),
      RNFS.mkdir(this.abspath(`${FileSystem.dirs.audio}/`), BACKUP_EXCLUDE),
      RNFS.mkdir(this.abspath(`${FileSystem.dirs.ebooks}/`), BACKUP_EXCLUDE),
      RNFS.mkdir(this.abspath(`${FileSystem.dirs.data}/`)),
    ]);

    for (const dir of Object.values(FileSystem.dirs)) {
      const files = await RNFS.readDir(this.abspath(`${dir}/`));
      files
        .filter((f) => f.isFile())
        .forEach((f) => {
          this.manifest[`${dir}/${basename(f.path)}`] = Number(f.size);
        });
    }

    if (!this.hasFile(V1_MIGRATED_FLAG_FILE)) {
      await this.removeLegacyV1Artwork();
    }
  }

  public bytesOnDisk({ fsPath: relPath }: FsPath): number {
    return this.manifest[relPath] ?? 0;
  }

  public download(relPath: string, networkUrl: string): Promise<number | null> {
    if (this.downloads[relPath]) {
      return this.downloads[relPath]!;
    }

    try {
      const { promise } = RNFS.downloadFile({
        fromUrl: networkUrl,
        toFile: this.abspath(relPath),
        progressInterval: 100000,
        progressDivider: 100,
      });

      this.downloads[relPath] = promise
        .then(({ bytesWritten }) => {
          this.manifest[relPath] = bytesWritten;
          delete this.downloads[relPath];
          return bytesWritten;
        })
        .catch(() => null);

      return this.downloads[relPath] || Promise.resolve(null);
    } catch {
      return Promise.resolve(null);
    }
  }

  public hasFile(relPath: string): boolean {
    return relPath in this.manifest;
  }

  public filesWithPrefix(
    prefix: string,
  ): Array<{ abspath: string; filename: string; relPath: string }> {
    return Object.keys(this.manifest)
      .filter((relPath) => relPath.startsWith(prefix))
      .map((relPath) => ({
        abspath: this.abspath(relPath),
        filename: basename(relPath),
        relPath,
      }));
  }

  public async eventedDownload(
    { fsPath: relPath }: FsPath,
    networkUrl: string,
    onStart: (totalBytes: number) => any = () => {},
    onProgress: (bytesWritten: number, totalBytes: number) => any = () => {},
    onComplete: (result: boolean) => any = () => {},
  ): Promise<void> {
    if (this.downloads[relPath]) {
      return;
    }

    try {
      const { promise } = RNFS.downloadFile({
        fromUrl: networkUrl,
        toFile: this.abspath(relPath),
        begin: ({ contentLength }) => onStart(contentLength),
        progressInterval: 300,
        progress: ({ contentLength, bytesWritten }) =>
          onProgress(bytesWritten, contentLength),
      });
      this.downloads[relPath] = promise.then(({ bytesWritten }) => bytesWritten);
      const { bytesWritten } = await promise;
      this.manifest[relPath] = bytesWritten;
      onComplete(true);
    } catch {
      onComplete(false);
    }
    delete this.downloads[relPath];
  }

  public async deleteAll(): Promise<void> {
    const promises = Object.keys(this.manifest).map((path) => {
      return RNFS.unlink(this.abspath(path)).then(() => delete this.manifest[path]);
    });
    await Promise.all(promises);
  }

  public async batchDelete(paths: string[]): Promise<void> {
    await Promise.all(
      paths.filter((path) => this.manifest[path]).map((path) => this.delete(path)),
    );
  }

  public async deleteAllAudios(): Promise<void> {
    const promises = Object.keys(this.manifest).map((path) => {
      return path.endsWith(`.mp3`) ? this.delete(path) : Promise.resolve(true);
    });
    await Promise.all(promises);
  }

  public async delete(path: string): Promise<boolean> {
    delete this.manifest[path];
    try {
      await RNFS.unlink(this.abspath(path));
      return true;
    } catch {
      return false;
    }
  }

  public async deleteMany(paths: string[]): Promise<boolean> {
    return Promise.all(paths.map((p) => this.delete(p))).then((results) =>
      results.every((res) => res === true),
    );
  }

  public async readFile(
    path: string,
    encoding: 'utf8' | 'ascii' | 'binary' | 'base64' = `utf8`,
  ): Promise<string | null> {
    try {
      return await RNFS.readFile(
        this.abspath(path),
        encoding === `binary` ? `base64` : encoding,
      );
    } catch {
      return Promise.resolve(null);
    }
  }

  public async writeFile(
    path: string,
    contents: string,
    encoding: 'utf8' | 'ascii' | 'binary' | 'base64' = `utf8`,
  ): Promise<void> {
    // android 10 doesn't truncate the file on re-write, causing JSON parse issues
    // when the file is re-written with shorter content
    // @see https://github.com/itinance/react-native-fs/issues/869
    // @see https://github.com/itinance/react-native-fs/pull/890
    // @see https://issuetracker.google.com/issues/180526528?pli=1
    if (Platform.OS === `android` && this.manifest[path]) {
      await this.delete(path);
    }

    const writePromise = RNFS.writeFile(
      this.abspath(path),
      contents,
      encoding === `binary` ? `base64` : encoding,
    );
    writePromise.then(() => (this.manifest[path] = contents.length));
    return writePromise;
  }

  public async readJson(path: ValuesOf<typeof FileSystem.paths>): Promise<any> {
    const json = await this.readFile(path);
    if (json === null) {
      return null;
    }
    try {
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  public async writeJson(
    path: ValuesOf<typeof FileSystem.paths>,
    data: any,
  ): Promise<void> {
    try {
      const string = JSON.stringify(data);
      return this.writeFile(path, string);
    } catch {
      return;
    }
  }

  public async moveFile(srcRelPath: string, destRelPath: string): Promise<boolean> {
    try {
      await RNFS.moveFile(this.abspath(srcRelPath), this.abspath(destRelPath), {});
      return true;
    } catch (err) {
      console.error(err.message);
      return false;
    }
  }

  public abspath(path?: string): string {
    return `${RNFS.DocumentDirectoryPath}/__FLP_APP_FILES__${
      path ? `/${path.replace(/^\//, ``)}` : ``
    }`;
  }

  public async removeLegacyV1Artwork() {
    if (await RNFS.exists(this.abspath(`artwork/`))) {
      console.log(`migrating v1 artwork by deleting all the things`);
      const legacyArtworkFiles = await RNFS.readDir(this.abspath(`artwork/`));
      legacyArtworkFiles
        .filter((file) => file.isFile())
        .forEach((file) => RNFS.unlink(file.path));
    } else {
      console.log(`no v1 artwork to migrate`);
    }
    console.log(`add migrated flag file`);
    await this.writeFile(V1_MIGRATED_FLAG_FILE, `true`);
  }
}

export default new FileSystem();

function basename(path: string): string {
  return path.split(`/`).pop() || ``;
}

const V1_MIGRATED_FLAG_FILE = `data/v1-artwork-migrated.txt`;
