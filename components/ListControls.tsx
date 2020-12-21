import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { PropSelector, useDispatch, useSelector } from '../state';
import {
  setSearchQuery,
  setSortAudiosBy,
  AudioSortCriteria,
  setAudioSortHeaderHeight,
} from '../state/preferences';
import tw from '../lib/tailwind';
import { Sans } from './Text';
import Search from './Search';

interface Props {
  query: string;
  setQuery: (query: string) => unknown;
  sort: AudioSortCriteria;
  setSort: (criteria: AudioSortCriteria) => unknown;
  setHeight: (height: number) => unknown;
}

export const ListControls: React.FC<Props> = ({
  query,
  setQuery,
  sort,
  setSort,
  setHeight,
}) => (
  <View style={tw`p-2 pt-4`} onLayout={(e) => setHeight(e.nativeEvent.layout.height)}>
    <Search query={query} setQuery={setQuery} />
    <View
      style={tw`flex-row justify-center mt-4 -mb-1 pb-2 flex-wrap border-b border-v1-gray-300`}
    >
      <SortButton
        active={sort === `published`}
        onPress={() => setSort(`published`)}
        label="Newest"
      />
      <SortButton
        active={sort === `duration`}
        onPress={() => setSort(`duration`)}
        label="Length"
      />
      <SortButton
        active={sort === `title`}
        onPress={() => setSort(`title`)}
        label="Title"
      />
      <SortButton
        active={sort === `author`}
        onPress={() => setSort(`author`)}
        label="Author"
        last
      />
    </View>
  </View>
);

const SortButton: React.FC<{
  label: string;
  onPress: () => unknown;
  active: boolean;
  last?: boolean;
}> = ({ label, last, active, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={tw.style(
      `py-1 px-4 flex-grow justify-center rounded-md mb-2`,
      !last && `mr-2`,
      { maxWidth: 150 },
      !active && { backgroundColor: `#ddd` },
      active && { backgroundColor: tw.color(`flblue`) || `` },
    )}
  >
    <Sans
      style={tw.style(`text-center uppercase`, {
        'text-v1-gray-700': !active,
        'text-white font-bold': active,
      })}
      size={10}
    >
      {label}
    </Sans>
  </TouchableOpacity>
);

export const propSelector: PropSelector<OwnProps, Props> = (ownProps, dispatch) => {
  return (state) => {
    return {
      query: state.preferences.searchQuery,
      sort: state.preferences.sortAudiosBy,
      setQuery: (query) => dispatch(setSearchQuery(query)),
      setSort: (criteria) => dispatch(setSortAudiosBy(criteria)),
      setHeight: (height) => dispatch(setAudioSortHeaderHeight(height)),
    };
  };
};

type OwnProps = Record<string, never>;

const ListControlsContainer: React.FC<OwnProps> = () => {
  const dispatch = useDispatch();
  const props = useSelector(propSelector({}, dispatch));
  if (!props) return null;
  return <ListControls {...props} />;
};

export default ListControlsContainer;
