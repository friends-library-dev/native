import React from 'react';
import { FlatList, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Audio } from '@friends-library/friends';
import { isDefined } from 'x-ts-utils';
import tw from '../lib/tailwind';
import { StackParamList, AudioResource } from '../types';
import AudioListItem from '../components/AudioListItem';
import { useSelector } from '../state';
import * as select from '../state/selectors';
import { LANG } from '../env';
import ListControls from '../components/ListControls';
import { Sans } from '../components/Text';

interface Props {
  navigation: StackNavigationProp<StackParamList, 'Audiobooks'>;
  route: RouteProp<StackParamList, 'Audiobooks'>;
}

const AllAudio: React.FC<Props> = ({ navigation }) => {
  const audios = useSelector((state) => {
    const query = state.preferences.searchQuery.toLowerCase().trim();
    return Object.values(state.audioResources)
      .filter(isDefined)
      .filter((audio) => {
        if (query.length < 1) {
          return true;
        }
        return (
          audio.friend.toLowerCase().includes(query) ||
          audio.title.toLowerCase().includes(query)
        );
      })
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
      });
  });

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
    <FlatList
      contentOffset={{ x: 0, y: 60 }}
      data={audios}
      ListEmptyComponent={() => (
        <Sans size={16} style={tw(`text-center p-4 italic`)}>
          No audiobooks matched your search term.
        </Sans>
      )}
      ListHeaderComponent={ListControls}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
    />
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
