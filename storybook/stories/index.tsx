import React from 'react';
import { View } from 'react-native';
import { storiesOf } from '@storybook/react-native';
import BookListItem from '../../components/BookListItem';
import EbookLoading from '../../components/EbookLoading';
import EbookError from '../../components/EbookError';
import { AudioControls } from '../../components/AudioControls';
import tw from '../../lib/tailwind';

// prettier-ignore
storiesOf(`EbookError`, module)
  .add(`black (unknown)`, () => <EbookError colorScheme="black" reason="unknown" />)
  .add(`sepia (unknown)`, () => <EbookError colorScheme="sepia" reason="unknown" />)
  .add(`white (unknown)`, () => <EbookError colorScheme="white" reason="unknown" />)
  .add(`black (no internet)`, () => <EbookError colorScheme="black" reason="no_internet" />)
  .add(`sepia (no internet)`, () => <EbookError colorScheme="sepia" reason="no_internet" />)
  .add(`white (no internet)`, () => <EbookError colorScheme="white" reason="no_internet" />);

storiesOf(`EbookLoading`, module)
  .add(`black`, () => <EbookLoading colorScheme="black" />)
  .add(`sepia`, () => <EbookLoading colorScheme="sepia" />)
  .add(`white`, () => <EbookLoading colorScheme="white" />);

storiesOf(`BookListItem`, module).add(`default`, () => (
  <View style={{ backgroundColor: `#f2f2f2` }}>
    <BookListItem
      editionId="a52eb875-8a1a-4f2f-b1b4-650eb3af1126--updated"
      title="A Letter of Elizabeth Webb"
      upperLeft="Elizabeth Webb"
      progress={0}
      upperRight="41 min"
    />
    <BookListItem
      editionId="a52eb875-8a1a-4f2f-b1b4-650eb3af1126--updated"
      title="A Letter of Elizabeth Webb"
      upperLeft="Elizabeth Webb"
      progress={33}
      upperRight="41 min"
      badgeText="New"
    />
    <BookListItem
      editionId="a52eb875-8a1a-4f2f-b1b4-650eb3af1126--updated"
      title="A Letter of Elizabeth Webb"
      upperLeft="Elizabeth Webb"
      progress={98}
      upperRight="41 min"
    />
    <BookListItem
      editionId="c248c2e7-947b-4629-8296-0cdff67a6d99--updated"
      title="The Writings of Isaac Penington — Vol. I"
      upperLeft="Isaac Penington"
      progress={0}
      upperRight="12 hr 13 min"
    />
    <BookListItem
      editionId="c248c2e7-947b-4629-8296-0cdff67a6d99--updated"
      title="The Writings of Isaac Penington — Vol. I"
      upperLeft="Isaac Penington"
      progress={0}
      upperRight="12 hr 13 min"
      badgeText="New"
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
