import React from 'react';
import { View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { utf8ShortTitle } from '@friends-library/adoc-utils';
import tw from '../lib/tailwind';
import { Sans, Serif } from './Text';
import Artwork from './Artwork';
import { LANG } from '../env';

interface Props {
  id: string;
  title: string;
  friend: string;
  progress: number;
  duration: string;
  isNew?: boolean;
}

const AudioListItem: React.FC<Props> = ({
  id,
  title,
  friend,
  progress,
  isNew,
  duration,
}) => {
  return (
    <View style={tw`flex-row p-2 border-b border-v1-gray-400`}>
      <View style={tw.style({ width: 90, height: 90 })}>
        <Artwork id={id} size={90} />
        {progress > 4 && progress < 96 && <ProgressBar progress={progress} />}
        {progress >= 96 && <Complete />}
      </View>
      <View style={tw`flex-col m-2 mb-0 w-full mt-0 mr-0 flex-shrink`}>
        <View style={tw`flex-row justify-between mb-px`}>
          <Sans
            size={11}
            style={tw.style(`uppercase text-v1-gray-700 mb-1`, { letterSpacing: 0.75 })}
          >
            {friend}
          </Sans>
          <Sans
            size={11}
            style={tw.style(`text-v1-gray-600 mb-1`, { letterSpacing: 0.5 })}
          >
            {duration}
          </Sans>
        </View>
        <Serif size={22} style={tw`pb-1`} numberOfLines={2}>
          {utf8ShortTitle(title)}
        </Serif>
        {isNew && (
          <View
            style={tw.style(
              LANG === `es` ? `w-12` : `w-10`,
              `mt-px mb-0 h-4 rounded-full bg-v1-green-500 text-center items-center justify-center`,
            )}
          >
            <Sans
              style={tw`uppercase text-white text-center font-bold android:-mt-px`}
              size={9.5}
            >
              {LANG === `es` ? `Nuevo` : `New`}
            </Sans>
          </View>
        )}
      </View>
    </View>
  );
};

export default AudioListItem;

const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
  <View style={tw.style(`absolute bottom-0 rounded-full m-2`, { width: 75, height: 4 })}>
    <View
      style={tw.style(`absolute bg-white bottom-0 rounded-full w-full h-full`, {
        opacity: 0.4,
      })}
    />
    <View
      style={tw.style(`absolute bg-white bottom-0 rounded-full h-full`, {
        width: (progress / 100) * 75,
        opacity: 0.8,
      })}
    />
  </View>
);

const Complete: React.FC = () => (
  <View style={tw.style(`absolute right-0 top-0 m-1`, { opacity: 85 })}>
    <Icon name="check-circle" color="white" size={15} />
  </View>
);
