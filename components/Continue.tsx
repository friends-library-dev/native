import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { EditionId } from '../types';
import { Sans, Serif } from './Text';
import CoverImage from './CoverImage';
import tw from '../lib/tailwind';
import Editions from '../lib/Editions';
import { useSelector } from '../state';
import { progress } from '../state/selectors/audio-selectors';

interface Props {
  type: 'audio' | 'ebook';
  editionId: EditionId;
  onPress: () => unknown;
  title: string;
  percentComplete: number;
}

export const Continue: React.FC<Props> = ({
  type,
  editionId,
  onPress,
  title,
  percentComplete,
}) => (
  <TouchableOpacity style={tw`flex-row mt-3 mr-2 justify-start`} onPress={onPress}>
    <View style={tw.style({ 'pt-1 pb-3': type === `audio`, 'pr-px': type === `ebook` })}>
      <CoverImage
        key={editionId}
        type={type === `audio` ? `square` : `threeD`}
        layoutWidth={type === `audio` ? 45 : 55}
        editionId={editionId}
      />
    </View>
    <View
      style={tw.style(`flex-shrink`, {
        'pl-3': type === `audio`,
        'pt-2': type === `ebook`,
      })}
    >
      <Sans size={10} style={tw`uppercase text-gray-500`}>
        Continue {type === `audio` ? `listening` : `reading`}:
      </Sans>
      <Serif size={17} style={tw`pt-1 text-gray-600`} numberOfLines={1}>
        {title}
      </Serif>
      <View
        style={tw.style(
          `bg-flblue rounded-full opacity-75 mt-1 self-start items-center justify-center`,
          { height: 14, width: 30 },
        )}
      >
        <Sans size={10} style={tw`uppercase text-white px-1`}>
          {percentComplete}%
        </Sans>
      </View>
    </View>
    <View style={tw.style(`justify-center pl-3 flex-grow items-end`)}>
      <Icon name="chevron-right" style={tw`text-flblue pb-2`} />
    </View>
  </TouchableOpacity>
);

interface OwnProps {
  type: 'audio' | 'ebook';
  editionId: EditionId;
  onPress: () => unknown;
}

const ContinueContainer: React.FC<OwnProps> = ({ type, editionId, onPress }) => {
  const resource = Editions.get(editionId);
  if (!resource) {
    return null;
  }
  const percentComplete = useSelector((state) => {
    if (type === `ebook`) {
      return Math.round((state.ebook.position[editionId] ?? 0) * 100);
    }
    return progress(editionId, state);
  });

  if (percentComplete >= 99) {
    return null;
  }

  return (
    <Continue
      title={resource.document.utf8ShortTitle}
      editionId={editionId}
      type={type}
      onPress={onPress}
      percentComplete={percentComplete}
    />
  );
};

export default ContinueContainer;
