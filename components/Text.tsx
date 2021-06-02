import React from 'react';
import { Text, Platform, TextStyle } from 'react-native';
import tw from '../lib/tailwind';

interface TextProps {
  size?: number;
  style?: TextStyle;
  numberOfLines?: number;
}

export const Serif: React.FC<TextProps> = ({
  size = 12,
  style = {},
  numberOfLines,
  children,
}) => (
  <Text
    numberOfLines={numberOfLines}
    style={{
      ...style,
      fontSize: size,
      ...Platform.select({
        ios: { fontFamily: `Baskerville` },
        android: { fontFamily: `serif`, fontSize: size - 3 },
      }),
    }}
  >
    {children}
  </Text>
);

export const Sans: React.FC<TextProps> = ({
  size = 12,
  style = {},
  numberOfLines,
  children,
}) => (
  <Text
    numberOfLines={numberOfLines}
    style={{
      ...style,
      fontSize: size,
      ...Platform.select({
        ios: { fontFamily: `HelveticaNeue-Light` },
        android: { fontFamily: `sans-serif` },
      }),
    }}
  >
    {children}
  </Text>
);

interface ProseProps {
  size?: number;
  tailwindClasses?: string;
  variant?: 'italic' | 'bold';
}

export const Prose: React.FC<ProseProps> = ({
  children,
  variant,
  size = 20,
  tailwindClasses,
}) => (
  <Serif
    size={size}
    style={tw.style(
      tailwindClasses,
      `text-gray-700`,
      {
        italic: variant === `italic`,
        'font-bold': variant === `bold`,
      },
      { lineHeight: size * 1.5 },
    )}
  >
    {children}
  </Serif>
);
