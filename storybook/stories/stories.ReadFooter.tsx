import React from 'react';
import { View } from 'react-native';
import { storiesOf } from '@storybook/react-native';
import ReadFooter from '../../components/ReadFooter';
import tw from '../../lib/tailwind';

storiesOf(`ReadFooter`, module).add(`default`, () => (
  <View style={tw`flex-grow justify-center py-12 bg-blue-100`}>
    <View style={tw`h-[100px]`}>
      <ReadFooter
        colorScheme="white"
        onScrub={() => {}}
        onSearchClick={() => {}}
        safeAreaBottomOffset={0}
        percentComplete={33}
      />
    </View>
    <View style={tw`h-[100px]`}>
      <ReadFooter
        colorScheme="black"
        onSearchClick={() => {}}
        onScrub={() => {}}
        safeAreaBottomOffset={0}
        percentComplete={0}
      />
    </View>
    <View style={tw`h-[100px]`}>
      <ReadFooter
        colorScheme="sepia"
        onScrub={() => {}}
        onSearchClick={() => {}}
        safeAreaBottomOffset={0}
        percentComplete={100}
      />
    </View>
  </View>
));
