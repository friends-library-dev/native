import React from 'react';
import { Text, View, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { EbookColorScheme, SearchResult } from '../types';
import { Sans } from './Text';
import tw from '../lib/tailwind';
import Search from './Search';

interface Props {
  query: string;
  colorScheme: EbookColorScheme;
  results: null | SearchResult[];
}

const SearchOverlay: React.FC<Props> = ({ colorScheme, results, query }) => {
  const c = COLORS[colorScheme];
  return (
    <View
      style={tw`rounded-md overflow-hidden bg-${c.bgColorFragment} max-h-[80%] flex-grow shadow-lg self-stretch max-w-[600px] mx-8 border ${c.borderColorClass}`}
    >
      <View style={tw`p-2 flex-row items-center border-b ${c.borderColorClass}`}>
        <Search
          bgColor={c.searchBgColor}
          searchIconColor={c.searchIconColor}
          query={query}
          className=""
          setQuery={() => {}}
          autoFocus
        />
      </View>
      {results?.length === 0 && (
        <View style={tw`items-center py-4`}>
          <Sans size={14} style={tw`italic ${c.fallbackTextClass}`}>
            No Results
          </Sans>
        </View>
      )}
      {results && results.length > 0 && (
        <ScrollView style={tw``}>
          <View style={tw`py-3 items-center border-b ${c.borderColorClass}`}>
            <Sans size={13} style={tw`uppercase text-${c.fg}`}>
              {results.length > 50
                ? `First 50 Results`
                : `${results.length} Result${results.length === 1 ? `` : `s`}`}
              :
            </Sans>
          </View>
          {results.map((result) => (
            <View
              style={tw`p-1.5 flex-row border-b ${c.borderColorClass}`}
              key={result.elementId}
            >
              <Text style={tw`pl-1 leading-[18px] w-[70%] text-${c.fg}`}>
                <Sans size={13} style={tw``}>
                  {result.before}
                </Sans>
                <Sans size={13} style={tw`text-${c.accent}`}>
                  {` `}
                  {result.match}
                  {` `}
                </Sans>
                <Sans size={13} style={tw``}>
                  {result.after}
                </Sans>
              </Text>
              <View style={tw`w-[15%] opacity-50 items-center justify-center`}>
                <Sans style={tw`text-${c.fg}`}>{result.percentage}%</Sans>
              </View>
              <TouchableOpacity style={tw`w-[15%] items-center justify-center`}>
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
