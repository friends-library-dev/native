import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { t } from '@friends-library/locale';
import { StackParamList } from '../types';
import { Sans } from '../components/Text';
import tw from '../lib/tailwind';
import Editions from '../lib/Editions';
import { useSelector } from '../state';
import { PRIMARY_COLOR_HEX } from '../env';

interface Props {
  navigation: StackNavigationProp<StackParamList, 'Home'>;
  route: RouteProp<StackParamList, 'Home'>;
}

const Home: React.FC<Props> = ({ navigation }) => {
  // watch for (and re-render) on changes to Editions singleton
  // from app boot initial filesystem re-hydrate && network refresh
  const [editionChanges, setEditionChanges] = useState(0);
  useEffect(() => {
    Editions.addChangeListener(() => setEditionChanges(editionChanges + 1));
    return () => Editions.removeAllChangeListeners();
  }, [Editions, setEditionChanges, editionChanges]);

  const { connected, lastAudio, lastEbook } = useSelector((s) => ({
    connected: s.network.connected,
    lastAudio: s.resume.lastAudiobookEditionId,
    lastEbook: s.resume.lastEbookEditionId,
  }));

  return (
    <View style={tw`flex-grow items-center justify-center`}>
      <Sans>Last Audio: {lastAudio ?? `<none>`}</Sans>
      <Sans>Last Ebook: {lastEbook ?? `<none>`}</Sans>
      <Sans>{process.env.NODE_ENV}</Sans>
      <HomeButton
        title={`LOL Ebooks (${Editions.numDocuments()})`}
        onPress={() => navigation.navigate(`EBookList`, { listType: `ebook` })}
        backgroundColor={PRIMARY_COLOR_HEX}
      />
      <HomeButton
        title={`${t`Audiobooks`} (${Editions.numAudios()})`}
        onPress={() => navigation.navigate(`AudioBookList`, { listType: `audio` })}
        backgroundColor={PRIMARY_COLOR_HEX}
      />
      <HomeButton
        title={t`Settings`}
        onPress={() => navigation.navigate(`Settings`)}
        backgroundColor="#999"
      />
      {!connected && <Sans>{t`No internet connection`}.</Sans>}
    </View>
  );
};

const HomeButton: React.FC<{
  onPress: () => any;
  title: string;
  backgroundColor: string;
}> = ({ onPress, title, backgroundColor }) => (
  <TouchableOpacity
    style={tw.style(`self-stretch mx-12 mb-5 px-8 py-4 rounded-full`, {
      backgroundColor,
    })}
    onPress={onPress}
  >
    <Sans size={20} style={tw`text-white text-center`}>
      {title}
    </Sans>
  </TouchableOpacity>
);

export default Home;
