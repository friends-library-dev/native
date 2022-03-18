import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import RNScrubber from 'react-native-scrubber';
import Icon from 'react-native-vector-icons/FontAwesome';
import { colorSchemeSubtleDropshadowStyle } from '../lib/utils';
import { Sans } from './Text';
import tw from '../lib/tailwind';
import { EbookColorScheme } from '../types';

interface Props {
  colorScheme: EbookColorScheme;
  onScrub(value: number): unknown;
  onSearchClick(): unknown;
  safeAreaBottomOffset: number;
  percentComplete: number;
}

const ReadFooter: React.FC<Props> = ({
  colorScheme,
  safeAreaBottomOffset,
  percentComplete,
  onScrub,
  onSearchClick,
}) => (
  <View
    style={tw.style(
      `absolute bottom-0 right-0 left-0 w-full z-10`,
      `pt-[24px] pb-[${safeAreaBottomOffset * 1.2 || 24}px]`,
      `bg-ebookcolorscheme-${colorScheme}bg`,
      colorSchemeSubtleDropshadowStyle(`above`, colorScheme),
    )}
  >
    <View style={tw`px-1 mb-1 relative flex-row items-center`}>
      <TouchableOpacity style={tw`px-4`} onPress={onSearchClick}>
        <Icon
          style={tw`ios:text-xl android:text-lg opacity-65 top-[-1px] font-thin text-ebookcolorscheme-${colorScheme}fg`}
          name="search"
        />
      </TouchableOpacity>
      <View style={tw`flex-grow px-1 overflow-hidden`}>
        {/* inner view necessary to allow for overflow-hidden above */}
        {/* which is necessary to make search icon clickable at 0% progress */}
        <View style={tw`pl-[2px]`}>
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
        </View>
      </View>
      <Sans
        size={11}
        style={tw`px-4 opacity-75 -top-[1px] text-ebookcolorscheme-${colorScheme}fg`}
      >
        {percentComplete}%
      </Sans>
    </View>
  </View>
);

export default ReadFooter;
