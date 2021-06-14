import React from 'react';
import { View } from 'react-native';
import { Serif } from './Text';
import tw from '../lib/tailwind';

const FullscreenError: React.FC<{
  bgColor?: string;
  textColor?: string;
  errorMsg: string;
}> = ({ bgColor = `rgba(0, 0, 0, 0)`, textColor = `rgb(3, 3, 3)`, errorMsg }) => (
  <View
    style={tw.style(`flex-grow items-center justify-center`, {
      backgroundColor: bgColor,
    })}
  >
    <Serif
      style={tw.style(`mt-4 opacity-75 px-12 text-center`, {
        lineHeight: 29,
        color: textColor,
      })}
      size={19}
    >
      {errorMsg}
    </Serif>
  </View>
);

export default FullscreenError;
