import React from 'react';
import { View } from 'react-native';
import RNScrubber from 'react-native-scrubber';
import { colorSchemeSubtleDropshadowStyle } from '../lib/utils';
import { Sans } from './Text';
import tw from '../lib/tailwind';
import { EbookColorScheme } from '../types';

interface Props {
  colorScheme: EbookColorScheme;
  onScrub(value: number): unknown;
  safeAreaBottomOffset: number;
  percentComplete: number;
}

const ReadFooter: React.FC<Props> = ({
  colorScheme,
  safeAreaBottomOffset,
  percentComplete,
  onScrub,
}) => (
  <View
    style={tw.style(
      `absolute bottom-0 right-0 w-full z-10 px-10`,
      `pt-[24px] pb-[${safeAreaBottomOffset * 1.2 || 24}px]`,
      `bg-ebookcolorscheme-${colorScheme}bg`,
      colorSchemeSubtleDropshadowStyle(`above`, colorScheme),
    )}
  >
    <View style={tw`pr-6 mb-1 relative`}>
      <RNScrubber
        onSlidingComplete={onScrub}
        onSlide={onScrub}
        // necessary to prevent error ¯\_(ツ)_/¯
        onSlidingStart={() => {}}
        trackBackgroundColor={colorScheme === `black` ? `#222` : `#ddd`}
        value={percentComplete}
        totalDuration={100}
        displayValues={false}
        scrubbedColor={
          colorScheme === `white`
            ? tw.color(`flmaroon`)
            : colorScheme === `sepia`
            ? tw.color(`ebookcolorscheme-sepiaaccent`)
            : tw.color(`ebookcolorscheme-blackaccent`)
        }
      />
      <Sans
        size={11}
        style={tw`opacity-75 absolute right-[-16px] top-[4px] text-ebookcolorscheme-${colorScheme}fg`}
      >
        {percentComplete}%
      </Sans>
    </View>
  </View>
);

export default ReadFooter;
