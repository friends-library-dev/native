import React from 'react';
import { Text, View, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { t } from '@friends-library/locale';
import { EbookColorScheme, SearchResult } from '../types';
import { SEARCH_OVERLAY_MAX_WIDTH } from '../screens/constants';
import { Sans } from './Text';
import tw from '../lib/tailwind';
import Search from './Search';

interface Props {
  query: string;
  setQuery(query: string): unknown;
  colorScheme: EbookColorScheme;
  results: null | SearchResult[];
  onQuerySubmit(): unknown;
  onSelectResult(result: SearchResult): unknown;
}

const SearchOverlay: React.FC<Props> = ({
  colorScheme,
  results,
  query,
  setQuery,
  onQuerySubmit,
  onSelectResult,
}) => {
  const c = COLORS[colorScheme];
  return (
    <View
      style={tw`rounded-md overflow-hidden bg-${c.bgColorFragment} max-h-[70vh] self-stretch max-w-[${SEARCH_OVERLAY_MAX_WIDTH}px] mx-8 border ${c.borderColorClass}`}
    >
      <View
        style={tw.style(
          `p-2 flex-row items-center ${c.borderColorClass}`,
          results !== null && `border-b`,
        )}
      >
        <Search
          bgColor={c.searchBgColor}
          searchIconColor={c.searchIconColor}
          query={query}
          className=""
          setQuery={setQuery}
          onQuerySubmit={() => {
            if (query.trim() !== ``) {
              onQuerySubmit();
            }
          }}
          returnKeyType="search"
          autoFocus
        />
      </View>
      {results?.length === 0 && (
        <View style={tw`items-center py-4`}>
          <Sans size={14} style={tw`italic ${c.fallbackTextClass}`}>
            {t`No Results`}
          </Sans>
        </View>
      )}
      {results && results.length > 0 && (
        <ScrollView style={tw``}>
          <View style={tw`py-3 items-center border-b ${c.borderColorClass}`}>
            <Sans size={13} style={tw`uppercase text-${c.fg}`}>
              {results.length > 50
                ? t`First ${50} Results`
                : results.length === 1
                ? t`1 Result`
                : t`${results.length} Results`}
              :
            </Sans>
          </View>
          {results.map((result, index) => (
            <View
              style={tw.style(
                (index !== results.length - 1 || results.length < 5) && `border-b`,
                `px-1.5 py-2.5 flex-row ${c.borderColorClass} min-h-19 items-center`,
              )}
              key={`${result.elementId}-${index}`}
            >
              <Text style={tw`pl-1 leading-[20px] w-[72%] pr-2 text-${c.fg}`}>
                <Sans size={14} style={tw``}>
                  {result.before}
                </Sans>
                <Sans size={14} style={tw`text-${c.accent}`}>
                  {!result.before.match(/(-|“|‘|–)$/) && ` `}
                  {result.match}
                  {!result.after.match(/^(-|,|;|\.|”|’|–)/) && ` `}
                </Sans>
                <Sans size={14} style={tw``}>
                  {result.after}
                </Sans>
              </Text>
              <View style={tw`w-[14%] opacity-50 items-center justify-center`}>
                <Sans style={tw`text-${c.fg}`}>{result.percentage}%</Sans>
              </View>
              <TouchableOpacity
                style={tw`w-[14%] items-center justify-center`}
                onPress={() => onSelectResult(result)}
              >
                <View
                  style={tw`bg-${c.accent}${
                    colorScheme === `white` ? `/60` : ``
                  } w-6 h-6 items-center justify-center rounded-full`}
                >
                  <Icon name="chevron-right" style={tw`ml-[3px] text-${c.bg}`} />
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default SearchOverlay;

const COLORS = {
  black: {
    searchBgColor: `#bbb`,
    searchIconColor: `#888`,
    bgColorFragment: `[rgb(30,30,30)]`,
    borderColorClass: `border-gray-700`,
    fallbackTextClass: `text-gray-300`,
    accent: `ebookcolorscheme-blackaccent`,
    fg: `ebookcolorscheme-blackfg`,
    bg: `ebookcolorscheme-blackbg`,
  },
  white: {
    searchBgColor: `#eee`,
    searchIconColor: undefined,
    bgColorFragment: `ebookcolorscheme-whitebg`,
    borderColorClass: `border-gray-200`,
    fallbackTextClass: `text-gray-500`,
    accent: `ebookcolorscheme-whiteaccent`,
    fg: `ebookcolorscheme-whitefg`,
    bg: `ebookcolorscheme-whitebg`,
  },
  sepia: {
    searchBgColor: `#d9cfc3`,
    searchIconColor: `#aaa`,
    bgColorFragment: `ebookcolorscheme-sepiabg`,
    borderColorClass: `border-gray-200`,
    fallbackTextClass: `text-gray-500`,
    accent: `ebookcolorscheme-sepiaaccent`,
    fg: `ebookcolorscheme-sepiafg`,
    bg: `ebookcolorscheme-sepiabg`,
  },
};
