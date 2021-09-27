import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { t } from '@friends-library/locale';
import { EbookColorScheme } from '../types';
import { Sans } from './Text';
import tw from '../lib/tailwind';
import { useSelector, useDispatch } from '../state';
import {
  setEbookColorScheme,
  setEbookFontSize,
  setEbookJustify,
} from '../state/preferences';
import { toggleShowingEbookSettings } from '../state/ephemeral';

interface Props {
  fontSize: number;
  colorScheme: EbookColorScheme;
  justify: boolean;
  onPressClose(): unknown;
  setFontSize(fontSize: number): unknown;
  setJustify(justified: boolean): unknown;
  setColorScheme(colorScheme: EbookColorScheme): unknown;
}

export const EbookSettings: React.FC<Props> = ({
  fontSize,
  colorScheme,
  setFontSize,
  setColorScheme,
  onPressClose,
  justify,
  setJustify,
}) => {
  const { width } = useWindowDimensions();
  const borderColor = `border-gray-${colorScheme === `black` ? `700` : `200`}`;
  const fgColor = colorScheme === `black` ? `white` : `ebookcolorscheme-${colorScheme}fg`;
  const bgColor =
    colorScheme === `black` ? `[rgb(30,30,30)]` : `ebookcolorscheme-${colorScheme}bg`;
  return (
    <View
      style={tw.style(
        `rounded-md bg-${bgColor} shadow-lg max-w-[220px]`,
        colorScheme === `black` && `shadow-opacity-100`,
      )}
    >
      <View style={tw`flex-row py-1 border-b items-center ${borderColor}`}>
        <TouchableOpacity style={tw`px-2 opacity-0`}>
          <Icon name="times" style={tw`text-lg`} />
        </TouchableOpacity>
        <Sans style={tw`flex-grow text-center text-${fgColor}`} size={14}>
          {t`Preferences`}
        </Sans>
        <TouchableOpacity onPress={onPressClose} style={tw`px-2`}>
          <Icon name="times" style={tw`text-lg text-gray-400`} />
        </TouchableOpacity>
      </View>
      <View style={tw`flex-row`}>
        <FontSizeButton
          colorScheme={colorScheme}
          letterSize={17}
          isRight
          disabled={fontSize === 1}
          onPress={() => fontSize > 1 && setFontSize(fontSize - 1)}
        />
        <FontSizeButton
          colorScheme={colorScheme}
          letterSize={29}
          disabled={fontSize === 10}
          onPress={() => fontSize < 10 && setFontSize(fontSize + 1)}
        />
      </View>
      <View style={tw`flex-row border-t ${borderColor}`}>
        <JustificationButton
          selected={justify === false}
          colorScheme={colorScheme}
          type="left"
          onPress={() => setJustify(false)}
        />
        <JustificationButton
          selected={justify === true}
          colorScheme={colorScheme}
          type={`justify`}
          disabled={
            // corresponds to disabling-css in doc-css/src/css/app-ebook.css.ts
            (width < 767 && fontSize > 6) || (width < 819 && fontSize > 7) || false
          }
          onPress={() => setJustify(true)}
        />
      </View>
      <View style={tw`flex-row justify-around pt-2 pb-1 px-8 border-t ${borderColor}`}>
        <ColorButton
          colorScheme="white"
          active={colorScheme}
          onPress={() => setColorScheme(`white`)}
        />
        <ColorButton
          colorScheme="black"
          active={colorScheme}
          onPress={() => setColorScheme(`black`)}
        />
        <ColorButton
          colorScheme="sepia"
          active={colorScheme}
          onPress={() => setColorScheme(`sepia`)}
        />
      </View>
    </View>
  );
};

const EbookSettingsContainer: React.FC = () => {
  const dispatch = useDispatch();
  const { colorScheme, fontSize, justify } = useSelector((state) => ({
    colorScheme: state.preferences.ebookColorScheme,
    fontSize: state.preferences.ebookFontSize,
    justify: state.preferences.ebookJustify,
  }));
  return (
    <EbookSettings
      onPressClose={() => dispatch(toggleShowingEbookSettings())}
      colorScheme={colorScheme}
      fontSize={fontSize}
      justify={justify}
      setJustify={(justify) => dispatch(setEbookJustify(justify))}
      setFontSize={(fontSize) => dispatch(setEbookFontSize(fontSize))}
      setColorScheme={(colorScheme) => dispatch(setEbookColorScheme(colorScheme))}
    />
  );
};

export default EbookSettingsContainer;

const ColorButton: React.FC<{
  colorScheme: EbookColorScheme;
  active: EbookColorScheme;
  onPress: () => unknown;
}> = ({ colorScheme, active, onPress }) => {
  const isSelected = colorScheme === active;
  const bg = colorScheme === `sepia` ? `sepiaaccent` : `${colorScheme}bg`;
  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={tw.style(`bg-ebookcolorscheme-${bg} w-8 h-8 rounded-full`, {
          'border border-gray-400': colorScheme === `white` && active !== `black`,
          'border border-ebookcolorscheme-blackfg':
            colorScheme === `black` && active === `black`,
        })}
      />
      <View
        style={tw.style(
          `rounded-full h-[2px] m-[3px] mt-[5px]`,
          `bg-${colorScheme === `black` ? `gray-300` : `gray-600`}`,
          { 'opacity-0': !isSelected },
        )}
      />
    </TouchableOpacity>
  );
};

interface FontSizeButtonProps {
  colorScheme: EbookColorScheme;
  letterSize: number;
  isRight?: boolean;
  disabled: boolean;
  onPress: () => unknown;
}

const FontSizeButton: React.FC<FontSizeButtonProps> = ({
  letterSize,
  isRight,
  colorScheme,
  disabled,
  onPress,
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={tw.style(
      `items-center justify-center h-[44px] min-w-1/2`,
      isRight && `border-r`,
      `border-gray-${colorScheme === `black` ? `700` : `200`}`,
    )}
  >
    <Sans
      style={tw.style(`font-bold`, {
        [`text-ebookcolorscheme-${colorScheme}fg`]: colorScheme !== `black`,
        'text-gray-200': colorScheme === `black`,
        opacity: disabled ? (colorScheme === `black` ? 0.3 : 0.1) : 0.85,
      })}
      size={letterSize}
    >
      A
    </Sans>
  </TouchableOpacity>
);

interface JustificationButtonProps {
  colorScheme: EbookColorScheme;
  type: 'left' | 'justify';
  isRight?: boolean;
  disabled?: boolean;
  onPress: () => unknown;
  selected: boolean;
}

const JustificationButton: React.FC<JustificationButtonProps> = ({
  type,
  colorScheme,
  disabled,
  onPress,
  selected,
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={tw.style(
      `items-center justify-center h-[48px] min-w-1/2`,
      type === `left` && `border-r`,
      `border-gray-${colorScheme === `black` ? `700` : `200`}`,
    )}
  >
    {/* thanks Dale (age 10) for idea of the border for selected state */}
    <View
      style={tw.style(`p-1.5 border-gray-700/50 rounded-md`, {
        border: selected,
        'border-gray-700/40': colorScheme !== `black`,
        'border-gray-600': colorScheme === `black`,
        'opacity-35': disabled === true,
      })}
    >
      <Icon
        name={`align-${type}`}
        size={20}
        color={tw.color(
          colorScheme !== `black`
            ? `ebookcolorscheme-${colorScheme}fg/60`
            : `gray-400/90`,
        )}
      />
    </View>
  </TouchableOpacity>
);
