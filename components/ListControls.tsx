import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { PropSelector, useDispatch, useSelector } from '../state';
import tw from '../lib/tailwind';
import { Sans } from './Text';
import Search from './Search';
import { LANG } from '../env';
import { BookSortMethod, ResourceType } from '../types';
import {
  setAudioSearchQuery,
  setSortAudiosBy,
  setAudioSortHeaderHeight,
  setEditionSearchQuery,
  setEditionSortHeaderHeight,
  setSortEditionsBy,
} from '../state/preferences';

interface Props {
  query: string;
  setQuery: (query: string) => unknown;
  sort: BookSortMethod;
  setSort: (criteria: BookSortMethod) => unknown;
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
        label={LANG === `en` ? `Newest` : `Nuevo`}
      />
      <SortButton
        active={sort === `duration`}
        onPress={() => setSort(`duration`)}
        label={LANG === `en` ? `Length` : `Duración`}
      />
      <SortButton
        active={sort === `title`}
        onPress={() => setSort(`title`)}
        label={LANG === `en` ? `Title` : `Título`}
      />
      <SortButton
        active={sort === `author`}
        onPress={() => setSort(`author`)}
        label={LANG === `en` ? `Author` : `Autor`}
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
    if (ownProps.resourceType === `audio`) {
      return {
        query: state.preferences.audioSearchQuery,
        sort: state.preferences.sortAudiosBy,
        setQuery: (query) => dispatch(setAudioSearchQuery(query)),
        setSort: (criteria) => dispatch(setSortAudiosBy(criteria)),
        setHeight: (height) => dispatch(setAudioSortHeaderHeight(height)),
      };
    }
    return {
      query: state.preferences.editionSearchQuery,
      sort: state.preferences.sortEditionsBy,
      setQuery: (query) => dispatch(setEditionSearchQuery(query)),
      setSort: (criteria) => dispatch(setSortEditionsBy(criteria)),
      setHeight: (height) => dispatch(setEditionSortHeaderHeight(height)),
    };
  };
};

type OwnProps = {
  resourceType: ResourceType;
};

const ListControlsContainer: React.FC<OwnProps> = (ownProps) => {
  const dispatch = useDispatch();
  const props = useSelector(propSelector(ownProps, dispatch));
  if (!props) return null;
  return <ListControls {...props} />;
};

export default ListControlsContainer;
