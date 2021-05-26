import React from 'react';
import { View } from 'react-native';
import { storiesOf } from '@storybook/react-native';
import BookListItem from '../../components/BookListItem';
import EbookLoading from '../../components/EbookLoading';
import EbookError from '../../components/EbookError';
import { AudioControls } from '../../components/AudioControls';
import tw from '../../lib/tailwind';

// prettier-ignore
storiesOf(EbookError.name, module)
  .add(`black (unknown)`, () => <EbookError colorScheme="black" reason="unknown" />)
  .add(`sepia (unknown)`, () => <EbookError colorScheme="sepia" reason="unknown" />)
  .add(`white (unknown)`, () => <EbookError colorScheme="white" reason="unknown" />)
  .add(`black (no internet)`, () => <EbookError colorScheme="black" reason="no_internet" />)
  .add(`sepia (no internet)`, () => <EbookError colorScheme="sepia" reason="no_internet" />)
  .add(`white (no internet)`, () => <EbookError colorScheme="white" reason="no_internet" />);

storiesOf(EbookLoading.name, module)
  .add(`black`, () => <EbookLoading colorScheme="black" />)
  .add(`sepia`, () => <EbookLoading colorScheme="sepia" />)
  .add(`white`, () => <EbookLoading colorScheme="white" />);

storiesOf(BookListItem.name, module).add(`default`, () => (
  <View style={{ backgroundColor: `#f2f2f2` }}>
    <BookListItem
      artworkId="webb"
      title="A Letter of Elizabeth Webb"
      friend="Elizabeth Webb"
      progress={0}
      duration="41 min"
    />
    <BookListItem
      artworkId="webb"
      title="A Letter of Elizabeth Webb"
      friend="Elizabeth Webb"
      progress={33}
      duration="41 min"
      isNew
    />
    <BookListItem
      artworkId="webb"
      title="A Letter of Elizabeth Webb"
      friend="Elizabeth Webb"
      progress={98}
      duration="41 min"
    />
    <BookListItem
      artworkId="penington"
      title="The Writings of Isaac Penington — Vol. I"
      friend="Isaac Penington"
      progress={0}
      duration="12 hr 13 min"
    />
    <BookListItem
      artworkId="penington"
      title="The Writings of Isaac Penington — Vol. I"
      friend="Isaac Penington"
      progress={0}
      duration="12 hr 13 min"
      isNew
    />
  </View>
));

storiesOf(AudioControls.name, module)
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
