import React from 'react';
import { FlatList, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { isDefined } from 'x-ts-utils';
import { StackParamList, AudioResource } from '../types';
import AudioListItem from '../components/AudioListItem';
import { useSelector } from '../state';
import * as select from '../state/selectors';
import { Audio } from '@friends-library/friends';
import { LANG } from '../env';

interface Props {
  navigation: StackNavigationProp<StackParamList, 'Audiobooks'>;
  route: RouteProp<StackParamList, 'Audiobooks'>;
}

const AllAudio: React.FC<Props> = ({ navigation }) => {
  const audios = useSelector((state) =>
    Object.values(state.audioResources)
      .filter(isDefined)
      .map((audio) => {
        const progress = select.progress(audio.id, state);
        return {
          ...audio,
          duration: Audio.humanDuration(
            audio.parts.map((p) => p.duration),
            `abbrev`,
            LANG,
          ),
          progress,
          isNew: isNew(audio, progress),
        };
      }),
  );

  const renderItem: (props: {
    item: AudioResource & { isNew: boolean; progress: number; duration: string };
  }) => JSX.Element = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate(`Listen`, { audioId: item.id })}>
      <AudioListItem
        id={item.id}
        title={item.title}
        friend={item.friend}
        duration={item.duration}
        progress={item.progress}
        isNew={item.isNew}
      />
    </TouchableOpacity>
  );

  return (
    <FlatList data={audios} renderItem={renderItem} keyExtractor={(item) => item.id} />
  );
};

export default AllAudio;

function isNew(audio: AudioResource, progress: number): boolean {
  if (progress > 4) {
    return false;
  }
  return Date.now() - Number(new Date(audio.date)) < NEW_MS;
}

// 60 days
const NEW_MS = 1000 * 60 * 60 * 24 * 60;
