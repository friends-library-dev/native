import React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import { View, TouchableOpacity } from 'react-native';
import tw from '../lib/tailwind';
import { Sans } from './Text';

interface Props {
  icon: string;
  text: string;
  secondaryText?: string;
  tailwindClass?: string;
  bgTailwindClass?: string;
  textTailwindClass?: string;
  onPress: () => any;
}

const IconButton: React.FC<Props> = ({
  tailwindClass,
  icon,
  text,
  secondaryText,
  bgTailwindClass = `bg-v1-blue-200`,
  textTailwindClass = `text-v1-blue-800`,
  onPress,
}) => (
  <View style={tw.style(`pb-2 px-4 flex-row justify-center`, tailwindClass)}>
    <TouchableOpacity
      onPress={onPress}
      style={tw.style(
        `${bgTailwindClass} justify-center flex-row px-6 py-2 rounded-full`,
        {
          minWidth: 160,
        },
      )}
    >
      <Icon name={icon} size={21} style={tw`pr-2 ${textTailwindClass}`} />
      <View style={tw`flex-row`}>
        <Sans size={15} style={tw.style(textTailwindClass)}>
          {text}
        </Sans>
        {secondaryText && (
          <Sans
            size={11}
            style={tw.style(textTailwindClass, { marginTop: 3, marginLeft: 5 })}
          >
            {secondaryText}
          </Sans>
        )}
      </View>
    </TouchableOpacity>
  </View>
);

export default IconButton;
