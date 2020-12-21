import React from 'react';
import { View } from 'react-native';
import { storiesOf } from '@storybook/react-native';
import AudioListItem from '../../components/AudioListItem';
import { AudioControls } from '../../components/AudioControls';
import tw from '../../lib/tailwind';

storiesOf(`AudioListItem`, module).add(`default`, () => (
  <View style={{ backgroundColor: `#f2f2f2` }}>
    <AudioListItem
      id="webb"
      title="A Letter of Elizabeth Webb"
      friend="Elizabeth Webb"
      progress={0}
      duration="41 min"
    />
    <AudioListItem
      id="webb"
      title="A Letter of Elizabeth Webb"
      friend="Elizabeth Webb"
      progress={33}
      duration="41 min"
      isNew
    />
    <AudioListItem
      id="webb"
      title="A Letter of Elizabeth Webb"
      friend="Elizabeth Webb"
      progress={98}
      duration="41 min"
    />
    <AudioListItem
      id="penington"
      title="The Writings of Isaac Penington — Vol. I"
      friend="Isaac Penington"
      progress={0}
      duration="12 hr 13 min"
    />
    <AudioListItem
      id="penington"
      title="The Writings of Isaac Penington — Vol. I"
      friend="Isaac Penington"
      progress={0}
      duration="12 hr 13 min"
      isNew
    />
  </View>
));

storiesOf(`AudioControls`, module)
  .add(`default`, () => (
    <View style={tw`p-6`}>
      <AudioControls
        seekForward={() => {}}
        seekBackward={() => {}}
        togglePlayback={() => {}}
        seekTo={() => {}}
        playing={true}
        position={1111}
        duration={3333}
        downloading={false}
        progress={3}
        multipart={false}
      />
    </View>
  ))
  .add(`with skips`, () => (
    <View style={tw`p-6`}>
      <AudioControls
        skipNext={() => {}}
        skipBack={() => {}}
        seekForward={() => {}}
        seekBackward={() => {}}
        togglePlayback={() => {}}
        seekTo={() => {}}
        playing={true}
        position={1111}
        duration={3333}
        downloading={false}
        progress={3}
        multipart
      />
    </View>
  ));
