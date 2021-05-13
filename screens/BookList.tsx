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
  const type = route.params.resourceType;
  const { resources, headerHeight } = useSelector(
    type === `audio` ? selectAudiobooks : selectEditions,
  );

  const renderItem: (props: { item: BookListItemInterface }) => JSX.Element = ({
    item,
  }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate(item.navigateTo, { resourceId: item.resourceId })
      }
    >
      <BookListItem
        artworkId={item.artworkId}
        title={item.title}
        friend={item.nameDisplay}
        duration={item.duration}
        progress={item.progress}
        isNew={item.isNew}
      />
    </TouchableOpacity>
  );

  return (
    <FlatList
      contentOffset={{ x: 0, y: headerHeight }}
      data={resources}
      ListEmptyComponent={() => (
        <Sans size={16} style={tw`text-center p-4 italic`}>
          {LANG === `en`
            ? `No audiobooks matched your search.` // @TODO - alter for resource type
            : `Ningún audiolibro corresponde a tu búsqueda.`}
        </Sans>
      )}
      ListHeaderComponent={<ListControls resourceType={type} />}
      renderItem={renderItem}
      keyExtractor={(item) => item.resourceId}
    />
  );
};

export default BookList;
