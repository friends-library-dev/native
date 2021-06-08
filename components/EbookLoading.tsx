import React, { useEffect, useState, useRef } from 'react';
import { View, Image } from 'react-native';
import { EbookColorScheme } from '../types';
import { Serif } from './Text';
import tw from '../lib/tailwind';

const EbookLoading: React.FC<{ colorScheme: EbookColorScheme }> = ({ colorScheme }) => {
  const [opacity, setOpacity] = useState(`0`);
  const timer = useRef<any>(0);

  useEffect(() => {
    timer.current = setTimeout(() => setOpacity(`100`), 100);
    return () => {
      clearTimeout(timer.current);
    };
  }, [setOpacity]);

  let iconOpacity: number;
  let icon: any;
  if (colorScheme === `black`) {
    iconOpacity = 0.5;
    icon = require(`./icon-white.png`);
  } else if (colorScheme === `sepia`) {
    iconOpacity = 0.8;
    icon = require(`./icon-gold.png`);
  } else {
    iconOpacity = 0.7;
    icon = require(`./icon-black.png`);
  }
  const IMAGE_SIZE = 70;
  return (
    <View
      style={tw`bg-ebook-colorscheme-${colorScheme}-bg flex-grow items-center justify-center`}
    >
      <View style={tw`items-center justify-center opacity-${opacity}`}>
        <Image
          source={icon}
          style={tw.style({
            opacity: iconOpacity,
            width: IMAGE_SIZE * 0.9,
            height: IMAGE_SIZE,
          })}
        />
        <Serif
          style={tw`text-ebook-colorscheme-${colorScheme}-fg mt-4 opacity-75`}
          size={18}
        >
          Loading...
        </Serif>
      </View>
    </View>
  );
};

export default EbookLoading;
