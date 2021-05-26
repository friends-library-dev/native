import React from 'react';
import { View } from 'react-native';
import { EbookColorScheme } from '../types';
import { Serif } from './Text';
import tw from '../lib/tailwind';

const EbookLoading: React.FC<{
  colorScheme: EbookColorScheme;
  reason: 'no_internet' | 'unknown';
}> = ({ reason, colorScheme }) => (
  <View
    style={tw`bg-ebook-colorscheme-${colorScheme}-bg flex-grow items-center justify-center`}
  >
    <Serif
      style={tw.style(
        `text-ebook-colorscheme-${colorScheme}-fg mt-4 opacity-75 px-12 text-center`,
        { lineHeight: 29 },
      )}
      size={19}
    >
      {reason === `no_internet`
        ? `Unable to download, no internet connection.`
        : `Unexpected error. Please try again.`}
    </Serif>
  </View>
);

export default EbookLoading;
