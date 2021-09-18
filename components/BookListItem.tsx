import React from 'react';
import { View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { utf8ShortTitle } from '@friends-library/adoc-utils';
import { EditionId } from '../types';
import tw from '../lib/tailwind';
import { Sans, Serif } from './Text';
import CoverImage from './CoverImage';

interface Props {
  editionId: EditionId;
  title: string | (() => JSX.Element);
  upperLeft: string;
  upperRight: string;
  progress: number;
  badgeText?: string;
}

const BookListItem: React.FC<Props> = ({
  editionId,
  title,
  upperLeft,
  upperRight,
  progress,
  badgeText,
}) => {
  return (
    <View style={tw`flex-row p-2 border-b border-v1gray-400`}>
      <View style={tw`w-[90px] h-[90px]`}>
        <CoverImage editionId={editionId} layoutWidth={90} type="square" />
        {progress > 4 && progress < 96 && <ProgressBar progress={progress} />}
        {progress >= 96 && <Complete />}
      </View>
      <View style={tw`flex-col m-2 mb-0 w-full mt-0 mr-0 flex-shrink`}>
        <View style={tw`flex-row justify-between mb-px`}>
          <Sans size={11} style={tw`uppercase text-v1gray-700 mb-1 tracking-[0.75px]`}>
            {upperLeft}
          </Sans>
          <Sans size={11} style={tw`text-v1gray-600 mb-1 tracking-[0.5px]`}>
            {upperRight}
          </Sans>
        </View>
        <Serif size={22} style={tw`pb-1`} numberOfLines={2}>
          {typeof title === `function` ? title() : utf8ShortTitle(title)}
        </Serif>
        {badgeText && (
          <View
            style={tw.style(
              `mt-px mb-0 h-4 rounded-full bg-v1green-500 text-center items-center justify-center`,
              {
                'w-10': badgeText.length < 5,
                'w-12': badgeText.length === 5,
                'w-24': badgeText.length > 5,
              },
            )}
          >
            <Sans
              style={tw`uppercase text-white text-center font-bold android:-mt-px`}
              size={9.5}
            >
              {badgeText}
            </Sans>
          </View>
        )}
      </View>
    </View>
  );
};

export default React.memo(BookListItem);

const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
  <View style={tw`absolute bottom-0 rounded-full m-2 w-[75px] h-[4px]`}>
    <View style={tw`absolute bg-white bottom-0 rounded-full w-full h-full opacity-40`} />
    <View
      style={tw.style(`absolute bg-white bottom-0 rounded-full h-full opacity-80`, {
        width: (progress / 100) * 75,
      })}
    />
  </View>
);

const Complete: React.FC = () => (
  <View style={tw`absolute right-0 top-0 m-1 opacity-85`}>
    <Icon name="check-circle" color="white" size={15} />
  </View>
);
