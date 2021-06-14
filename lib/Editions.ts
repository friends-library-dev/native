import { AudioQuality } from '@friends-library/types';
import { isNotNull } from 'x-ts-utils';
import { EditionId, EditionResource, Audio, AudioPart } from '../types';
import { DocumentEntityInterface } from './models';

type EditionMap = Record<EditionId, EditionResource>;

class Editions {
  private resources: EditionMap = {};
  private changeListeners: Array<() => unknown> = [];

  public get(editionId: EditionId): EditionResource | null {
    return this.resources[editionId] ?? null;
  }

  public getAudio(editionId: EditionId): Audio | null {
    return this.resources[editionId]?.audio ?? null;
  }

  public getDocumentEditions(document: DocumentEntityInterface): EditionResource[] {
    return this.getEditions().filter((ed) => ed.document.id === document.documentId);
  }

  public getAllAudios(): Array<[Audio, EditionResource]> {
    return this.getEditions()
      .map<[Audio, EditionResource] | null>((resource) => {
        if (resource.audio) {
          return [resource.audio, resource];
        } else {
          return null;
        }
      })
      .filter(isNotNull);
  }

  public getAudioPart(
    editionId: EditionId,
    partIndex: number,
  ): null | [AudioPart, EditionResource, Audio] {
    const resource = this.get(editionId);
    if (!resource || !resource.audio) {
      return null;
    }

    const part = resource.audio.parts[partIndex];
    return part ? [part, resource, resource.audio] : null;
  }

  public getAudioPartFilesize(
    editionId: EditionId,
    partIndex: number,
    quality: AudioQuality,
  ): null | number {
    const part = this.getAudioPart(editionId, partIndex)?.[0];
    return part?.[quality === `HQ` ? `size` : `sizeLq`] || null;
  }

  public numDocuments(): number {
    return Object.values(this.resources).filter((e) => e.isMostModernized).length;
  }

  public numAudios(): number {
    return Object.values(this.resources).filter((e) => e.audio !== null).length;
  }

  public getEditions(): EditionResource[] {
    return Object.values(this.resources);
  }

  public setResources(resources: EditionResource[]): void {
    this.resources = resources.reduce<EditionMap>((data, resource) => {
      data[resource.id] = resource;
      return data;
    }, {});
    this.changeListeners.forEach((listener) => listener());
  }

  public setResourcesIfValid(resources: any): boolean {
    if (editionResourcesValid(resources)) {
      this.setResources(resources);
      return true;
    }
    return false;
  }

  public addChangeListener(listener: () => unknown): void {
    this.changeListeners.push(listener);
  }

  public removeAllChangeListeners(): void {
    this.changeListeners = [];
  }
}

export default new Editions();

export { Editions as EditionsClass };

function editionResourcesValid(resources: any): resources is EditionResource[] {
  return Array.isArray(resources) && resources.every(resourceValid);
}

function resourceValid(resource: any): resource is EditionResource {
  return (
    resource &&
    typeof resource === `object` &&
    `images` in resource &&
    `chapters` in resource &&
    Array.isArray(resource.images.square) &&
    resource.images.square.every((image: any) => typeof image?.url === `string`) &&
    Array.isArray(resource.chapters) &&
    resource.chapters.every((ch: any) => typeof ch?.shortHeading === `string`)
  );
}
