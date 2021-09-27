import React from 'react';
import { View } from 'react-native';
import { storiesOf } from '@storybook/react-native';
import { EbookSettings } from '../../components/EbookSettings';
import tw from '../../lib/tailwind';

storiesOf(`EbookSettings`, module).add(`default`, () => (
  <>
    <View style={tw`justify-center items-center py-6 bg-blue-200`}>
      <EbookSettings colorScheme="white" {...common} />
    </View>
    <View style={tw`justify-center items-center py-6 bg-blue-200`}>
      <EbookSettings colorScheme="black" {...common} />
    </View>
    <View style={tw`justify-center items-center py-6 bg-blue-200`}>
      <EbookSettings colorScheme="sepia" {...common} />
    </View>
  </>
));

const common = {
  fontSize: 5,
  justify: false,
  setFontSize: () => {},
  setColorScheme: () => {},
  onPressClose: () => {},
  setJustify: () => {},
};
