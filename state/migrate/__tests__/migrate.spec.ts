import { expect, it, describe, test } from '@jest/globals';
import migrate from '../migrate';
import { State } from '../../';
import { getV1State } from './v1.state';

describe(`migrate()`, () => {
  it(`should return an object`, () => {
    const migrated = migrate(getV1State());
    expect(typeof migrated).toBe(`object`);
  });
});
