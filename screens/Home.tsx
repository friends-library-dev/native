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
import { LANG } from '../env';

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
      <FullscreenError
        errorMsg={
          LANG === `en`
            ? `Unable to download book data, no internet connection`
            : `No es posible descargar el contenido del libro, no hay conexión de internet.`
        }
      />
    );
  }

  return (
    <SafeAreaView style={tw`flex-grow items-center justify-between`}>
      <View style={tw`self-stretch h-[${lastEbook && lastAudio ? 15 : 25}%]`}>
        <TouchableOpacity
          style={tw`flex-row items-center justify-center pt-6 mt-1`}
          onPress={() => navigation.navigate(`Settings`)}
        >
          <Icon name="gear" style={tw`pr-2 text-gray-500 mt-px text-sm`} />
          <Sans size={16} style={tw`text-gray-500`}>
            {t`Settings`}
          </Sans>
        </TouchableOpacity>
      </View>
      <View style={tw`self-stretch flex items-center`}>
        <HomeButton
          title={t`Listen`}
          onPress={() => navigation.navigate(`AudioBookList`, { listType: `audio` })}
          backgroundColor={LANG === `en` ? `flmaroon` : `flgold`}
          numEditions={Editions.numAudios()}
        />
        <HomeButton
          title={t`Read`}
          onPress={() => navigation.navigate(`EBookList`, { listType: `ebook` })}
          numEditions={Editions.numDocuments()}
          backgroundColor={`flblue`}
        />
        {!connected && (
          <Sans style={tw`text-center mt-2 text-[rgb(163,7,7)]`}>
            {t`No internet connection`}.
          </Sans>
        )}
      </View>
      <View style={tw`self-stretch justify-end pb-6 px-6 items-center h-[25%]`}>
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
  numEditions: number;
}> = ({ onPress, title, backgroundColor, numEditions }) => (
  <TouchableOpacity
    style={tw.style(
      `flex-row justify-center self-stretch ipad:self-center`,
      `mx-12 my-2 ipad:my-3 px-8 py-3 rounded-2xl`,
      `ipad:w-[400px]`,
      `bg-${backgroundColor}`,
    )}
    onPress={onPress}
  >
    <Sans size={20} style={tw`text-white text-center ml-4 py-1 tracking-[1px]`}>
      {title}
    </Sans>
    <View
      style={tw.style(`text-white self-start pt-px ml-1 rounded-full px-[5px] pb-[2px]`, {
        backgroundColor: tw.color(LANG === `en` ? `v1green-550` : `flmaroon-500`) || ``,
      })}
    >
      <Sans size={12} style={tw`text-white`}>
        {numEditions}
      </Sans>
    </View>
  </TouchableOpacity>
);

export default Home;
