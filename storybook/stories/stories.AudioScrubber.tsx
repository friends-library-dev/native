import React, { useState } from 'react';
import { View } from 'react-native';
import { storiesOf } from '@storybook/react-native';
import AudioScrubber from '../../components/AudioScrubber';
import tw from '../../lib/tailwind';

storiesOf(`AudioScrubber`, module)
  .add(`paused midway`, () => <TestScrubber />)
  .add(`downloading`, () => (
    <TestScrubber playing={false} downloading={true} downloadingProgress={33} />
  ));

const TestScrubber: React.FC<Partial<React.ComponentProps<typeof AudioScrubber>>> = (
  props,
) => {
  const [pos, setPos] = useState(1111);
  return (
    <View style={tw`p-6`}>
      <AudioScrubber
        playing
        downloading={false}
        downloadingProgress={0}
        partDuration={3333}
        position={pos}
        seekTo={setPos}
        {...props}
      />
    </View>
  );
};
