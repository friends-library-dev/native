import React from 'react';
import { View } from 'react-native';
import { storiesOf } from '@storybook/react-native';
import SearchOverlay from '../../components/SearchOverlay';
import tw from '../../lib/tailwind';
import { SearchResult } from 'types';

storiesOf(`SearchOverlay`, module).add(`white (null results)`, () => (
  <View style={tw`h-full items-center justify-center`}>
    <SearchOverlay
      query="light"
      setQuery={() => {}}
      colorScheme="sepia"
      results={keys([RES_1, RES_1, RES_1, RES_1, RES_1, RES_1, RES_1, RES_1, RES_1])}
      onQuerySubmit={() => {}}
      onSelectResult={() => {}}
    />
  </View>
));

function keys(results: SearchResult[]): SearchResult[] {
  return results.map((r) => ({ ...r, elementId: `${Math.random()}` }));
}

const COMMON = {
  startIndex: 0,
  endIndex: 0,
  elementId: ``,
};

const RES_1: SearchResult = {
  before: `beneficial account, by throwing`,
  match: `light`,
  after: `upon the history of that remarkable religious experience, for which some of them in form`,
  percentage: 0.2,
  ...COMMON,
};
