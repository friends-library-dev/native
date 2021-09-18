import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { PropSelector, useDispatch, useSelector } from '../state';
import tw from '../lib/tailwind';
import { Sans } from './Text';
import Search from './Search';
import { LANG } from '../env';
import { BookSortMethod } from '../types';
import { setAudioSortHeaderHeight, setEbookSortHeaderHeight } from '../state/dimensions';
import {
  setAudioSearchQuery,
  setSortAudiosBy,
  setEbookSearchQuery,
  setSortEbooksBy,
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
      style={tw`flex-row justify-center mt-4 -mb-1 pb-2 flex-wrap border-b border-v1gray-300`}
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
      `py-1 px-4 flex-grow justify-center rounded-md mb-2 max-w-[150px]`,
      !last && `mr-2`,
      active ? `bg-flblue` : `bg-[#ddd]`,
    )}
  >
    <Sans
      style={tw.style(`text-center uppercase`, {
        'text-v1gray-700': !active,
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
    if (ownProps.listType === `audio`) {
      return {
        query: state.preferences.audioSearchQuery,
        sort: state.preferences.sortAudiosBy,
        setQuery: (query) => dispatch(setAudioSearchQuery(query)),
        setSort: (criteria) => dispatch(setSortAudiosBy(criteria)),
        setHeight: (height) => dispatch(setAudioSortHeaderHeight(height)),
      };
    }
    return {
      query: state.preferences.ebookSearchQuery,
      sort: state.preferences.sortEbooksBy,
      setQuery: (query) => dispatch(setEbookSearchQuery(query)),
      setSort: (criteria) => dispatch(setSortEbooksBy(criteria)),
      setHeight: (height) => dispatch(setEbookSortHeaderHeight(height)),
    };
  };
};

type OwnProps = {
  listType: 'ebook' | 'audio';
};

const ListControlsContainer: React.FC<OwnProps> = (ownProps) => {
  const dispatch = useDispatch();
  const props = useSelector(propSelector(ownProps, dispatch));
  if (!props) return null;
  return <ListControls {...props} />;
};

export default ListControlsContainer;
