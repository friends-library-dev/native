import React from 'react';
import { EbookColorScheme } from '../types';
import tw from '../lib/tailwind';
import { LANG } from '../env';
import FullscreenError from './FullscreenError';

const EbookError: React.FC<{
  colorScheme: EbookColorScheme;
  reason: 'no_internet' | 'unknown';
}> = ({ reason, colorScheme }) => (
  <FullscreenError
    errorMsg={message(reason)}
    bgColor={tw.color(`ebook-colorscheme-${colorScheme}-bg`) ?? ``}
    textColor={tw.color(`ebook-colorscheme-${colorScheme}-fg`) ?? ``}
  />
);

export default EbookError;

function message(reason: 'no_internet' | 'unknown'): string {
  if (LANG === `en`) {
    return reason === `no_internet`
      ? `Unable to download, no internet connection.`
      : `Unexpected error. Please try again.`;
  }
  return reason === `no_internet`
    ? `No es posible descargar, no hay conexión de internet.`
    : `Hubo un error inesperado. Por favor intenta nuevamente.`;
}
