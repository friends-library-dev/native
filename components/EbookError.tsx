import React from 'react';
import { EbookColorScheme } from '../types';
import tw from '../lib/tailwind';
import FullscreenError from './FullscreenError';

const EbookError: React.FC<{
  colorScheme: EbookColorScheme;
  reason: 'no_internet' | 'unknown';
}> = ({ reason, colorScheme }) => (
  <FullscreenError
    errorMsg={
      reason === `no_internet`
        ? `Unable to download, no internet connection.`
        : `Unexpected error. Please try again.`
    }
    bgColor={tw.color(`ebook-colorscheme-${colorScheme}-bg`) ?? ``}
    textColor={tw.color(`ebook-colorscheme-${colorScheme}-fg`) ?? ``}
  />
);

export default EbookError;
