import React from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { StackParamList } from '../types';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Sans } from '../components/Text';
import tw from '../lib/tailwind';

interface Props {
  navigation: StackNavigationProp<StackParamList, 'Read'>;
  route: RouteProp<StackParamList, 'Read'>;
}

const Read: React.FC<Props> = ({ route }) => {
  const editionId = route.params.editionId;

  return (
    <View style={tw`bg-red-100 flex-grow`}>
      <View style={tw`p-3 bg-blue-100 border-b`}>
        <Sans size={13}>{editionId}</Sans>
      </View>
      <View style={tw`bg-green-100 flex-grow`}>
        <WebView source={{ uri: `https://github.com` }} />
      </View>
    </View>
  );
};

export default Read;
