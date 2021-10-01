import React from 'react';
import { FlatList, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import tw from '../lib/tailwind';
import { StackParamList, BookListItem as BookListItemInterface } from '../types';
import BookListItem from '../components/BookListItem';
import { useSelector } from '../state';
import selectAudiobooks from '../state/selectors/audio-booklist';
import selectEditions from '../state/selectors/edition-booklist';
import ListControls from '../components/ListControls';
import { Sans } from '../components/Text';
import { LANG } from '../env';

interface Props {
  navigation: StackNavigationProp<StackParamList, 'EBookList' | 'AudioBookList'>;
  route: RouteProp<StackParamList, 'EBookList' | 'AudioBookList'>;
}

const BookList: React.FC<Props> = ({ navigation, route }) => {
  const numColumns = tw.prefixMatch(`ipad`) ? 2 : 1;
  const type = route.params.listType;
  const { resources, headerHeight } = useSelector(
    type === `audio` ? selectAudiobooks : selectEditions,
  );

  const renderItem: (props: {
    item: BookListItemInterface;
    index: number;
  }) => JSX.Element = ({ item, index }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate(item.navigateTo, { editionId: item.editionId })}
    >
      <BookListItem
        className="ipad:w-[50vw]"
        editionId={item.editionId}
        title={item.title}
        upperLeft={item.nameDisplay}
        upperRight={item.duration}
        progress={item.progress}
        badgeText={item.isNew ? (LANG === `es` ? `Nuevo` : `New`) : undefined}
        orphan={numColumns === 2 && index === resources.length - 1 && index % 2 === 0}
      />
    </TouchableOpacity>
  );

  // if you're trying to optimize the perf of this list
  // check out ideas here: https://github.com/necolas/react-native-web/issues/1337#issuecomment-720675528
  // but be careful, React.useMemo() kills re-render on ipad orientationchange
  return (
    <FlatList
      numColumns={numColumns}
      initialNumToRender={tw.prefixMatch(`ipad`) ? 26 : 10}
      contentOffset={{ x: 0, y: headerHeight }}
      data={resources}
      ListEmptyComponent={() => (
        <Sans size={16} style={tw`text-center p-4 italic`}>
          {emptyMsg(type)}
        </Sans>
      )}
      ListHeaderComponent={<ListControls listType={type} />}
      renderItem={renderItem}
      keyExtractor={(item) => item.editionId}
    />
  );
};

export default BookList;

function emptyMsg(type: 'audio' | 'ebook'): string {
  if (LANG === `en`) {
    return `No ${type === `audio` ? `audio` : ``}books matched your search.`;
  }

  return type === `audio`
    ? `Ningún audiolibro corresponde a tu búsqueda.`
    : `Tu búsqueda no tiene coincidencias.`;
}
