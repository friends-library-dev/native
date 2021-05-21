import React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sans } from './Text';
import tw from '../lib/tailwind';
import { TouchableOpacity, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { HeaderBackButton, StackHeaderProps } from '@react-navigation/stack';
import Popover, { PopoverMode } from 'react-native-popover-view';
import { useSelector } from '../state';

const ReadHeader: React.FC<StackHeaderProps> = ({ insets, navigation, previous }) => {
  const { colorScheme } = useSelector((state) => {
    return { colorScheme: state.preferences.ebookColorScheme };
  });
  return (
    <View
      style={tw.style(
        `bg-ebook-colorscheme-${colorScheme}-bg`,
        `flex-row justify-between items-center`,
        { paddingTop: insets.top + 5, paddingBottom: 5 },
      )}
    >
      <View style={tw.style(`flex-row justify-between flex-grow max-w-full`)}>
        <TouchableWithoutFeedback
          style={tw`pl-3 items-center justify-center flex-grow`}
          onPress={() => navigation.goBack()}
        >
          <Icon
            style={tw`ios:text-xl android:text-lg font-thin text-ebook-colorscheme-${colorScheme}-fg`}
            name="chevron-left"
          />
        </TouchableWithoutFeedback>
        <View style={tw.style(`items-center justify-center flex-shrink`)}>
          <Sans
            style={tw`font-bold text-ebook-colorscheme-${colorScheme}-fg`}
            size={15}
            numberOfLines={1}
          >
            The Diary of Alexandar Jaffray
          </Sans>
        </View>
        <Popover
          animationConfig={{ duration: 0, delay: 0 }}
          popoverStyle={tw`p-4`}
          backgroundStyle={{ opacity: 0 }}
          from={(_, showPopover) => (
            <TouchableWithoutFeedback
              style={tw`pr-3 items-center justify-center flex-grow`}
              onPress={showPopover}
            >
              <Icon
                style={tw`text-2xl text-ebook-colorscheme-${colorScheme}-fg`}
                name="gear"
              />
            </TouchableWithoutFeedback>
          )}
        >
          <Sans>Inside the popover</Sans>
        </Popover>
      </View>
    </View>
  );
};

export default ReadHeader;
