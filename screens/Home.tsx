import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, SafeAreaView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/FontAwesome';
import { RouteProp } from '@react-navigation/native';
import { t } from '@friends-library/locale';
import { StackParamList } from '../types';
import { Sans } from '../components/Text';
import Continue from '../components/Continue';
import tw from '../lib/tailwind';
import Editions from '../lib/Editions';
import { useSelector } from '../state';
import FullscreenError from '../components/FullscreenError';
import FullscreenLoading from '../components/FullscreenLoading';

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
  }, [setEditionChanges, editionChanges]);

  const { connected, lastAudio, lastEbook } = useSelector((s) => {
    return {
      connected: s.network.connected,
      lastAudio: s.resume.lastAudiobookEditionId,
      lastEbook: s.resume.lastEbookEditionId,
    };
  });

  if (Editions.getEditions().length === 0) {
    return connected ? (
      <FullscreenLoading />
    ) : (
      <FullscreenError errorMsg="Unable to download book data, no internet connection" />
    );
  }

  return (
    <SafeAreaView
      style={tw.style(`flex-grow items-center justify-between`, {
        background: `#efefef`,
      })}
    >
      <View
        style={tw.style(`self-stretch`, {
          height: lastEbook && lastAudio ? `15%` : `25%`,
        })}
      >
        <TouchableOpacity
          style={tw`flex-row items-center justify-center pt-6 mt-1`}
          onPress={() => navigation.navigate(`Settings`)}
        >
          <Icon name="gear" style={tw`pr-2 text-gray-500 mt-px text-sm`} />
          <Sans size={16} style={tw`text-gray-500`}>
            Settings
          </Sans>
        </TouchableOpacity>
      </View>
      <View style={tw`self-stretch`}>
        <HomeButton
          title={`${t`Listen`} (${Editions.numAudios()})`}
          onPress={() => navigation.navigate(`AudioBookList`, { listType: `audio` })}
          backgroundColor={`flprimary`}
        />
        <HomeButton
          title={`Read (${Editions.numDocuments()})`}
          onPress={() => navigation.navigate(`EBookList`, { listType: `ebook` })}
          backgroundColor={`flblue`}
        />
        {!connected && (
          <Sans style={tw.style(`text-center mt-2`, { color: `rgb(163, 7, 7)` })}>
            {t`No internet connection`}.
          </Sans>
        )}
      </View>
      <View style={tw.style(`self-stretch justify-end pb-6 px-6`, { height: `25%` })}>
        {lastEbook && (
          <Continue
            type="ebook"
            editionId={lastEbook}
            onPress={() => navigation.navigate(`Read`, { editionId: lastEbook })}
          />
        )}
        {lastAudio && (
          <Continue
            type="audio"
            editionId={lastAudio}
            onPress={() => navigation.navigate(`Listen`, { editionId: lastAudio })}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const HomeButton: React.FC<{
  onPress: () => unknown;
  title: string;
  backgroundColor: string;
}> = ({ onPress, title, backgroundColor }) => (
  <TouchableOpacity
    style={tw.style(
      `self-stretch mx-12 my-2 px-8 py-4 rounded-full`,
      `bg-${backgroundColor}`,
    )}
    onPress={onPress}
  >
    <Sans size={20} style={tw`text-white text-center`}>
      {title}
    </Sans>
  </TouchableOpacity>
);

export default Home;
