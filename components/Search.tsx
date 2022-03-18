import React from 'react';
import { View, TextInput, TouchableOpacity, ReturnKeyTypeOptions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { t } from '@friends-library/locale';
import { Sans } from './Text';
import tw from '../lib/tailwind';

interface Props {
  query: string;
  setQuery: (query: string) => unknown;
  returnKeyType?: ReturnKeyTypeOptions;
  className?: string;
  bgColor?: string;
  searchIconColor?: string;
  autoFocus?: boolean;
}

const Search: React.FC<Props> = ({
  query,
  setQuery,
  className,
  bgColor = `#ddd`,
  searchIconColor = `#bbb`,
  returnKeyType = `done`,
  autoFocus = false,
}) => (
  <View
    style={tw.style(
      className,
      `rounded-md pl-2 flex flex-row items-center android:py-1 ios:py-2 bg-[${bgColor}]`,
    )}
  >
    <Icon name="search" size={18} color={searchIconColor} style={tw`ml-1`} />
    <TextInput
      clearButtonMode="always"
      style={tw`pl-2 text-xl flex-grow android:py-px ios:py-0 leading-tight`}
      value={query}
      placeholder={t`Search`}
      onChangeText={(text) => setQuery(text)}
      returnKeyType={returnKeyType}
      autoFocus={autoFocus}
      // onSubmitEditing={}
      // onKeyPress={}
    />
    <TouchableOpacity
      style={tw.style(`ios:hidden px-2 self-stretch justify-center`, {
        hidden: query === ``,
      })}
      onPress={() => setQuery(``)}
    >
      <View style={tw`rounded-full w-4 h-4 bg-v1gray-700 items-center justify-center`}>
        <Sans size={15} style={tw`pt-px text-white mt-[-3px]`}>
          &times;
        </Sans>
      </View>
    </TouchableOpacity>
  </View>
);

export default Search;
