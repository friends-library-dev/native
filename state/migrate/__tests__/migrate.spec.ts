import { expect, it, describe, test } from '@jest/globals';
import migrate from '../migrate';
import { INITIAL_STATE } from '../../';
import { getV1State } from './v1.state';

describe(`migrate()`, () => {
  it(`should remove audioResources`, () => {
    const migrated: any = migrate(getV1State());
    expect(migrated.audioResources).toBeUndefined();
  });

  const cases = [false, null, `whoops`, [`whoops`], 33];
  test.each(cases)(`unexpected non-object %s get replaced by initial state`, (input) => {
    expect(migrate(input)).toEqual(INITIAL_STATE);
  });

  it(`moves .trackPosition into .audio sub-object`, () => {
    const v1 = getV1State();
    const migrated = migrate(v1);
    expect(migrated.audio.trackPosition).toMatchObject(v1.trackPosition);
  });

  it(`moves .playback into .audio sub-object`, () => {
    const v1 = getV1State();
    const migrated = migrate(v1);
    expect(migrated.audio.playback).toMatchObject(v1.playback);
  });

  it(`moves .activePart into .audio sub-object`, () => {
    const v1 = getV1State();
    const migrated = migrate(v1);
    expect(migrated.audio.activePart).toMatchObject(v1.activePart);
  });

  it(`creates empty audio.filesystem state`, () => {
    const v1 = getV1State();
    const migrated = migrate(v1);
    expect(migrated.audio.filesystem).toMatchObject({});
  });

  it(`renames preferences.searchQuery -> .audioSearchQuery`, () => {
    const v1 = getV1State();
    v1.preferences.searchQuery = `foo bar`;
    const migrated: any = migrate(v1);
    expect(migrated.preferences.audioSearchQuery).toBe(`foo bar`);
    expect(migrated.preferences.searchQuery).toBeUndefined();
  });

  it(`deletes top-level resources moved into .audio sub-object`, () => {
    const v1 = getV1State();
    const migrated: any = migrate(v1);
    expect(migrated.audioResources).toBeUndefined();
    expect(migrated.playback).toBeUndefined();
    expect(migrated.activePart).toBeUndefined();
    expect(migrated.trackPosition).toBeUndefined();
  });

  it(`deletes old top-level .filesystem sub-object`, () => {
    const v1 = getV1State();
    const migrated: any = migrate(v1);
    expect(migrated.filesystem).toBeUndefined();
  });

  it(`adds new .ebook state slice`, () => {
    const v1 = getV1State();
    const migrated = migrate(v1);
    expect(migrated.ebook).toEqual(INITIAL_STATE.ebook);
  });

  it(`adds new .resume state slice`, () => {
    const v1 = getV1State();
    const migrated = migrate(v1);
    expect(migrated.resume).toMatchObject({ ...INITIAL_STATE.resume });
  });

  it(`adds new .ephemeral state slice`, () => {
    const v1 = getV1State();
    const migrated = migrate(v1);
    expect(migrated.ephemeral).toMatchObject({ ...INITIAL_STATE.ephemeral });
  });

  it(`adds new edition* prefs`, () => {
    const v1 = getV1State();
    const migrated = migrate(v1);
    expect(migrated.preferences.sortEbooksBy).toBe(
      INITIAL_STATE.preferences.sortEbooksBy,
    );
    expect(migrated.preferences.ebookSearchQuery).toBe(
      INITIAL_STATE.preferences.ebookSearchQuery,
    );
    expect(migrated.preferences.ebookColorScheme).toBe(
      INITIAL_STATE.preferences.ebookColorScheme,
    );
    expect(migrated.preferences.ebookFontSize).toBe(
      INITIAL_STATE.preferences.ebookFontSize,
    );
  });

  it(`adds new dimensions state, migrating old prefs`, () => {
    const v1 = getV1State();
    v1.preferences.audioSortHeaderHeight = 999;
    const migrated: any = migrate(v1);
    expect(migrated.dimensions.audioSortHeaderHeight).toBe(999);
    expect(migrated.dimensions.editionSortHeaderHeight).toBe(
      INITIAL_STATE.dimensions.editionSortHeaderHeight,
    );
    expect(migrated.dimensions.ebookHeaderHeight).toBe(
      INITIAL_STATE.dimensions.ebookHeaderHeight,
    );
  });

  it(`migrates v2 to v3`, () => {
    const v2 = JSON.parse(JSON.stringify(INITIAL_STATE));
    v2.version = 2;
    v2.preferences.ebookJustify = true;
    const migrated: any = migrate(v2);
    expect(migrated.version).toBe(3);
    expect(migrated.preferences.ebookJustify).toBe(false);
  });
});
