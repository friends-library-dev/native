import React from 'react';
import { View } from 'react-native';
import tw from '../lib/tailwind';
import { Sans } from './Text';

interface Props {
  editionId: string;
}

const EbookListItem: React.FC<Props> = ({ editionId }) => {
  return (
    <View style={tw`px-4 py-3`}>
      <Sans size={15}>{editionId}</Sans>
    </View>
  );
};

export default EbookListItem;
