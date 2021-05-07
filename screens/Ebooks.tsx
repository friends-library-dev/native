import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { StackParamList } from '../types';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import EbookListItem from '../components/EbookListItem';

interface Props {
  navigation: StackNavigationProp<StackParamList, 'Audiobooks'>;
  route: RouteProp<StackParamList, 'Audiobooks'>;
}

const editions = [
  `en/catherine-payton/letter-to-brother/modernized`,
  `en/samuel-rundell/vital-religion/updated`,
  `en/daniel-wheeler/journal/modernized`,
];

const Ebooks: React.FC<Props> = ({ navigation }) => {
  return (
    <View>
      {editions.map((editionId) => (
        <TouchableOpacity
          onPress={() => navigation.navigate(`Read`, { editionId })}
          key={editionId}
        >
          <EbookListItem editionId={editionId} />
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default Ebooks;
