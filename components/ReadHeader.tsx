import React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Dimensions, View } from 'react-native';
import { Sans } from './Text';
import tw from '../lib/tailwind';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { StackHeaderProps } from '@react-navigation/stack';
import { useDispatch, useSelector } from '../state';
import { toggleShowingEbookSettings } from '../state/ephemeral';
import { setEbookHeaderHeight } from '../state/dimensions';
import { colorSchemeSubtleDropshadowStyle } from '../lib/utils';
import Editions from '../lib/Editions';

const ReadHeader: React.FC<StackHeaderProps> = ({ insets, navigation, scene }) => {
  const dispatch = useDispatch();
  const { colorScheme, title } = useSelector((state) => {
    const params = scene.route.params as { editionId?: string } | null;
    const editionId = params?.editionId ?? ``;
    const edition = Editions.get(editionId);
    let title = edition?.document.utf8ShortTitle ?? ``;
    const shouldShorten = title.length > MAX_CHARS;
    if (shouldShorten) {
      title = edition?.document.trimmedUtf8ShortTitle ?? title;
    }
    return {
      title,
      colorScheme: state.preferences.ebookColorScheme,
    };
  });

  const padTop = `pt-[${insets.top + 5}px]`;
  const btnPad = `${padTop} pb-[5px]`;

  return (
    <View
      onLayout={(e) => dispatch(setEbookHeaderHeight(e.nativeEvent.layout.height))}
      style={tw.style(
        `bg-ebookcolorscheme-${colorScheme}bg`,
        `flex-row justify-between items-center`,
        colorSchemeSubtleDropshadowStyle(`below`, colorScheme),
      )}
    >
      <View style={tw.style(`flex-row justify-between flex-grow max-w-full`)}>
        <TouchableWithoutFeedback
          style={tw`pl-3 pr-2 items-center justify-center flex-grow ${btnPad}`}
          onPress={() =>
            navigation.canGoBack() ? navigation.goBack() : navigation.navigate(`Ebooks`)
          }
        >
          <Icon
            style={tw`ios:text-xl android:text-lg font-thin text-ebookcolorscheme-${colorScheme}fg`}
            name="chevron-left"
          />
        </TouchableWithoutFeedback>
        <View style={tw`items-center justify-center flex-shrink`}>
          <Sans
            style={tw`font-bold text-ebookcolorscheme-${colorScheme}fg px-6 ${padTop}`}
            size={15}
            numberOfLines={1}
          >
            {title}
          </Sans>
        </View>
        <TouchableWithoutFeedback
          style={tw`pr-3 pl-2 items-center justify-center flex-grow ${btnPad}`}
          onPress={() => dispatch(toggleShowingEbookSettings())}
        >
          <Icon style={tw`text-2xl text-ebookcolorscheme-${colorScheme}fg`} name="gear" />
        </TouchableWithoutFeedback>
      </View>
    </View>
  );
};

export default ReadHeader;

// from testing on only two devices, normal font size, but good enough to be useful
const CHAR_WIDTH = 0.106666666;
const BTNS_WIDTH = 75;
const MAX_CHARS = Math.floor((Dimensions.get(`window`).width - BTNS_WIDTH) * CHAR_WIDTH);
