import React, { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { t } from '@friends-library/locale';
import { StackParamList } from '../types';
import Home from '../screens/Home';
import BookList from '../screens/BookList';
import Audio from '../screens/Audio';
import Ebook from '../screens/Ebook';
import Settings from '../screens/Settings';
import Read from '../screens/Read';
import { useDispatch, useSelector } from '../state';
import { setConnected } from '../state/network';
import Service from '../lib/service';
import FS, { FileSystem } from '../lib/fs';
import ReadHeader from './ReadHeader';
import Editions from '../lib/Editions';

const Stack = createStackNavigator<StackParamList>();

const App: React.FC = () => {
  const [fetchedResources, setFetchedResources] = useState(false);
  const dispatch = useDispatch();
  const { networkConnected, showingEbookHeader } = useSelector((state) => ({
    networkConnected: state.network.connected,
    showingEbookHeader: state.ephemeral.showingEbookHeader,
  }));

  // add a listener for network connectivity events one time
  useEffect(() => {
    return NetInfo.addEventListener((state) => {
      dispatch(setConnected(state.isConnected));
    });
  }, [dispatch]);

  // as soon as we know we're connected to the internet, fetch resources
  useEffect(() => {
    if (networkConnected && !fetchedResources) {
      setFetchedResources(true);
      Service.downloadLatestEbookCss();
      Service.networkFetchEditions()
        .then((resources) => {
          if (Editions.setResourcesIfValid(resources)) {
            FS.writeJson(FileSystem.paths.editions, resources);
          }
        })
        .catch(() => {});
    }
  }, [networkConnected, fetchedResources, setFetchedResources]);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator headerMode="screen" initialRouteName="Home">
          <Stack.Screen
            options={{
              // bg color matches the "matte" of the 3d cover style for <Continue />
              cardStyle: { backgroundColor: `rgb(239, 239, 239)` },
              title: t`Home`,
            }}
            name="Home"
            component={Home}
          />
          <Stack.Screen
            name="EBookList"
            options={{ title: t`Read` }}
            component={BookList}
            initialParams={{ listType: `ebook` }}
          />
          <Stack.Screen
            name="Read"
            options={{
              header: ReadHeader,
              headerTransparent: true,
              headerShown: showingEbookHeader,
            }}
            component={Read}
          />
          <Stack.Screen
            name="AudioBookList"
            options={{ title: t`Listen` }}
            component={BookList}
            initialParams={{ listType: `audio` }}
          />
          <Stack.Screen name="Listen" options={{ title: t`Listen` }} component={Audio} />
          <Stack.Screen name="Ebook" options={{ title: t`Read` }} component={Ebook} />
          <Stack.Screen
            name="Settings"
            options={{ title: t`Settings` }}
            component={Settings}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
