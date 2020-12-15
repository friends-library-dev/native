import React from 'react';
import { View } from 'react-native';
import { PropSelector, useDispatch, useSelector } from '../state';
import { setSearchQuery } from '../state/preferences';
import tw from '../lib/tailwind';
import Search from './Search';

interface Props {
  query: string;
  setQuery: (query: string) => unknown;
}

export const ListControls: React.FC<Props> = ({ query, setQuery }) => (
  <View style={tw(`p-2 pt-4`)}>
    <Search query={query} setQuery={setQuery} />
  </View>
);

export const propSelector: PropSelector<OwnProps, Props> = (ownProps, dispatch) => {
  return (state) => {
    return {
      query: state.preferences.searchQuery,
      setQuery: (query) => dispatch(setSearchQuery(query)),
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
