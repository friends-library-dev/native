import { expect, it, describe, test } from '@jest/globals';
import migrate from '../migrate';
import { INITIAL_STATE } from '../../';
import { getV1State } from './v1.state';

describe(`migrate()`, () => {
  it(`should put audio resources into sub field`, () => {
    const migrated = migrate(getV1State());
    expect(migrated.audio.resources).toMatchObject({});
  });

  const cases = [false, null, `whoops`, [`whoops`], 33];
  test.each(cases)(`unexpected non-object %s get replaced by initial state`, (input) => {
    expect(migrate(input)).toMatchObject(INITIAL_STATE);
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

  it(`moves .activePart into .audio sub-object`, () => {
    const v1 = getV1State();
    const migrated = migrate(v1);
    expect(migrated.audio.activePart).toMatchObject(v1.activePart);
  });

  it(`adds new .editions state slice`, () => {
    const v1 = getV1State();
    const migrated = migrate(v1);
    expect(migrated.editions).toMatchObject(INITIAL_STATE.editions);
  });

  it(`adds new edition* prefs`, () => {
    const v1 = getV1State();
    const migrated = migrate(v1);
    expect(migrated.preferences.sortEditionsBy).toBe(
      INITIAL_STATE.preferences.sortEditionsBy,
    );
    expect(migrated.preferences.editionSearchQuery).toBe(
      INITIAL_STATE.preferences.editionSearchQuery,
    );
    expect(migrated.preferences.editionSortHeaderHeight).toBe(
      INITIAL_STATE.preferences.editionSortHeaderHeight,
    );
  });
});
