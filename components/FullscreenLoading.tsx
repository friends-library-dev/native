import React, { useEffect, useState, useRef } from 'react';
import { View, Image } from 'react-native';
import { t } from '@friends-library/locale';
import { EbookColorScheme } from '../types';
import { Serif } from './Text';
import tw from '../lib/tailwind';

const FullscreenLoading: React.FC<{ colorScheme?: EbookColorScheme | 'transparent' }> = ({
  colorScheme = `transparent`,
}) => {
  const [opacity, setOpacity] = useState(`0`);
  const timer = useRef<any>(0);

  // this prevents the loading screen from flashing on for just a few ms
  // but will allow it to show for longer first-time loads and network delays
  useEffect(() => {
    timer.current = setTimeout(() => setOpacity(`100`), 500);
    return () => {
      clearTimeout(timer.current);
    };
  }, [setOpacity]);

  let iconOpacity: number;
  let icon: any;
  let bgClass = `ebook-colorscheme-${colorScheme}-bg`;
  let textClass = `ebook-colorscheme-${colorScheme}-fg`;
  if (colorScheme === `black`) {
    iconOpacity = 0.5;
    icon = require(`./icon-white.png`);
  } else if (colorScheme === `sepia`) {
    iconOpacity = 0.8;
    icon = require(`./icon-gold.png`);
  } else if (colorScheme === `transparent`) {
    bgClass = `transparent`;
    iconOpacity = 0.7;
    textClass = `ebook-colorscheme-white-fg`;
    icon = require(`./icon-black.png`);
  } else {
    iconOpacity = 0.7;
    icon = require(`./icon-black.png`);
  }

  return (
    <View style={tw`bg-${bgClass} flex-grow items-center justify-center`}>
      <View style={tw`items-center justify-center opacity-${opacity}`}>
        <Image
          source={icon}
          style={tw.style({
            opacity: iconOpacity,
            width: IMAGE_SIZE * 0.9,
            height: IMAGE_SIZE,
          })}
        />
        <Serif style={tw`text-${textClass} mt-4 opacity-75`} size={18}>
          {t`Loading`}...
        </Serif>
      </View>
    </View>
  );
};

export default FullscreenLoading;

const IMAGE_SIZE = 70;
