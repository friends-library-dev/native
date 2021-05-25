import React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import { View } from 'react-native';
import { Sans } from './Text';
import tw from '../lib/tailwind';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { StackHeaderProps } from '@react-navigation/stack';
import { useDispatch, useSelector } from '../state';
import { toggleShowingEbookSettings } from '../state/ephemeral';
import { setEbookHeaderHeight } from '../state/dimensions';

const ReadHeader: React.FC<StackHeaderProps> = ({ insets, navigation }) => {
  console.log(`[render] <ReadHeader />`);
  const dispatch = useDispatch();
  const { colorScheme } = useSelector((state) => {
    return { colorScheme: state.preferences.ebookColorScheme };
  });
  return (
    <View
      onLayout={(e) => dispatch(setEbookHeaderHeight(e.nativeEvent.layout.height))}
      style={tw.style(
        `bg-ebook-colorscheme-${colorScheme}-bg`,
        `flex-row justify-between items-center`,
        { paddingTop: insets.top + 5, paddingBottom: 5 },
      )}
    >
      <View style={tw.style(`flex-row justify-between flex-grow max-w-full`)}>
        <TouchableWithoutFeedback
          style={tw`pl-3 items-center justify-center flex-grow`}
          onPress={() =>
            navigation.canGoBack() ? navigation.goBack() : navigation.navigate(`Ebooks`)
          }
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
        <TouchableWithoutFeedback
          style={tw`pr-3 items-center justify-center flex-grow`}
          onPress={() => dispatch(toggleShowingEbookSettings())}
        >
          <Icon
            style={tw`text-2xl text-ebook-colorscheme-${colorScheme}-fg`}
            name="gear"
          />
        </TouchableWithoutFeedback>
      </View>
    </View>
  );
};

export default ReadHeader;
