import React from 'react';
import { Platform, View, TextInput, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { t } from '@friends-library/locale';
import { Sans } from './Text';
import tw from '../lib/tailwind';

interface Props {
  query: string;
  setQuery: (query: string) => unknown;
}

const Search: React.FC<Props> = ({ query, setQuery }) => (
  <View
    style={tw(
      `rounded-md pl-2 flex flex-row items-center`,
      `py-${Platform.OS === `android` ? `1` : `2`}`,
      { backgroundColor: `#ddd` },
    )}
  >
    <Icon name="search" size={18} color="#bbb" style={tw(`ml-1`)} />
    <TextInput
      clearButtonMode="always"
      style={tw(`pl-2 text-xl flex-grow`, `py-${Platform.OS === `android` ? `px` : `0`}`)}
      value={query}
      placeholder={t`Search`}
      onChangeText={(text) => setQuery(text)}
    />
    {Platform.OS !== `ios` && (
      <TouchableOpacity
        style={tw(`px-2 self-stretch justify-center`, { hidden: query === `` })}
        onPress={() => setQuery(``)}
      >
        <View style={tw(`rounded-full w-4 h-4 bg-gray-700 items-center justify-center`)}>
          <Sans size={15} style={tw(`-mt-1 pt-px text-white`)}>
            &times;
          </Sans>
        </View>
      </TouchableOpacity>
    )}
  </View>
);

export default Search;