import React from 'react';
import { View } from 'react-native';
import RNScrubber from 'react-native-scrubber';
import { t } from '@friends-library/locale';
import tw from '../lib/tailwind';
import { Sans } from './Text';

interface Props {
  playing: boolean;
  downloading: boolean;
  downloadingProgress: number;
  partDuration: number;
  position: number | null;
  seekTo: (newPosition: number) => any;
}

const AudioScrubber: React.FC<Props> = ({
  partDuration,
  position,
  playing,
  downloading,
  downloadingProgress,
  seekTo,
}) => {
  return (
    <View style={{ opacity: playing || downloading ? 1 : 0.6 }}>
      {!downloading && (
        <RNScrubber
          value={position || 0}
          bufferedValue={0}
          scrubbedColor={tw.color(`flmaroon`)}
          totalDuration={partDuration}
          onSlidingComplete={(newPosition) => seekTo(newPosition)}
        />
      )}
      {downloading && (
        <>
          <View style={tw`mt-3 h-2`}>
            <View style={tw`w-full border-b border-2 border-v1gray-300 absolute`} />
            <View
              style={tw.style(`border-b border-2 border-v1gray-500 absolute`, {
                width: `${downloadingProgress}%`,
              })}
            />
          </View>
          <View style={tw`flex-row justify-center`}>
            <Sans size={13}>{`${t`Downloading`}...`}</Sans>
          </View>
        </>
      )}
    </View>
  );
};

export function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / (60 * 60));
  const minutes = Math.floor((totalSeconds - hours * 60 * 60) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return [hours, minutes, seconds]
    .map(String)
    .map((part) => part.padStart(2, `0`))
    .join(`:`)
    .replace(/^00:(\d\d:\d\d)/, `$1`)
    .replace(/^0(\d:\d\d)/, `$1`);
}

export default AudioScrubber;
