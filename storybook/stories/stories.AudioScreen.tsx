import React from 'react';
import { storiesOf } from '@storybook/react-native';
import Audio from '../../screens/Audio';

storiesOf(`AudioScreen`, module)
  .add(`single-part`, () => (
    <Audio
      // @ts-ignore
      route={{ params: { editionId: `a52eb875-8a1a-4f2f-b1b4-650eb3af1126--updated` } }}
    />
  ))
  .add(`multi-part`, () => (
    <Audio
      // @ts-ignore
      route={{ params: { editionId: `c248c2e7-947b-4629-8296-0cdff67a6d99--updated` } }}
    />
  ));
