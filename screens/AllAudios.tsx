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
    const sort = state.preferences.sortAudiosBy;
    return Object.values(state.audioResources)
      .slice() /* make a copy for sorting */
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
      .sort((a, b) => {
        switch (sort) {
          case `author`: {
            const aName = a.friendSort ?? a.friend;
            const bName = b.friendSort ?? b.friend;
            if (aName === bName) return 0;
            return aName > bName ? 1 : -1;
          }
          case `title`:
            return sortable(a.title) < sortable(b.title) ? -1 : 1;
          case `duration`:
            return totalDuration(a) < totalDuration(b) ? -1 : 1;
          default:
            return Number(new Date(a.date)) > Number(new Date(b.date)) ? -1 : 1;
        }
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
          nameDisplay:
            sort === `author`
              ? (audio.friendSort ?? audio.friend).replace(/, *$/, ``)
              : audio.friend,
        };
      });
  });

  const renderItem: (props: {
    item: AudioResource & {
      isNew: boolean;
      progress: number;
      duration: string;
      nameDisplay: string;
    };
  }) => JSX.Element = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate(`Listen`, { audioId: item.id })}>
      <AudioListItem
        id={item.id}
        title={item.title}
        friend={item.nameDisplay}
        duration={item.duration}
        progress={item.progress}
        isNew={item.isNew}
      />
    </TouchableOpacity>
  );

  return (
    <FlatList
      // contentOffset={{ x: 0, y: 107 }}
      data={audios}
      ListEmptyComponent={() => (
        <Sans size={16} style={tw`text-center p-4 italic`}>
          No audiobooks matched your search.
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

function sortable(str: string): string {
  return str.replace(/^(A|The) /, ``);
}

function totalDuration(audio: AudioResource): number {
  return audio.parts.reduce((acc, part) => acc + part.duration, 0);
}
