import React from 'react';
import { storiesOf } from '@storybook/react-native';
import Audio from '../../screens/Audio';

storiesOf(`AudioScreen`, module)
  .add(`single-part`, () => (
    // @ts-ignore
    <Audio route={{ params: { audioId: `webb` } }} />
  ))
  .add(`multi-part`, () => (
    // @ts-ignore
    <Audio route={{ params: { audioId: `penington` } }} />
  ));
