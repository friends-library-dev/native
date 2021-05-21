import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sans } from './Text';
import tw from '../lib/tailwind';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { HeaderBackButton, StackHeaderProps } from '@react-navigation/stack';
import Popover, { PopoverMode } from 'react-native-popover-view';

const ReadHeader: React.FC<StackHeaderProps> = ({ insets, navigation, previous }) => {
  return (
    <View
      style={tw.style(`flex-row bg-white justify-between items-center`, `border-b`, {
        paddingTop: insets.top,
      })}
    >
      <View style={tw.style(`flex-row justify-between flex-grow max-w-full`)}>
        <HeaderBackButton
          onPress={() => {
            navigation.goBack();
          }}
          labelVisible={false}
        />
        <View style={tw.style(`items-center justify-center flex-shrink`)}>
          <Sans style={tw`bg-white font-bold`} size={15} numberOfLines={1}>
            The Diary of Alexandar Jaffray
          </Sans>
        </View>
        <Popover
          popoverStyle={tw`p-4`}
          // mode={PopoverMode.TOOLTIP}
          backgroundStyle={{ opacity: 0.2 }}
          from={(sourceRef, showPopover) => (
            <TouchableOpacity onPress={showPopover}>
              <Sans>Settings</Sans>
            </TouchableOpacity>
          )}
        >
          <Sans>Inside the popover</Sans>
        </Popover>
        {/* <View style={{ opacity: 0 }}>
          <HeaderBackButton disabled labelVisible={false} />
        </View> */}
      </View>
    </View>
  );
};

export default ReadHeader;
