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
import { useDispatch, useSelector, State } from '../state';
import { setConnected } from '../state/network';
import { fetchAudios } from '../state/audio/resources';
import { fetchEditions } from '../state/editions/resources';
import { batchSet as batchSetFilesystem } from '../state/filesystem';
import Service from '../lib/service';
import FS from '../lib/fs';
import ReadHeader from './ReadHeader';

const Stack = createStackNavigator<StackParamList>();

const App: React.FC = () => {
  const [fetchedResources, setFetchedResources] = useState(false);
  const dispatch = useDispatch();
  const { networkConnected, showingEbookHeader } = useSelector((state) => ({
    networkConnected: state.network.connected,
    showingEbookHeader: state.ephemeral.showingEbookHeader,
  }));

  // set up filesystem state one time
  useEffect(() => {
    dispatch(
      batchSetFilesystem(
        Object.keys(FS.manifest).reduce<State['filesystem']>((acc, path) => {
          const storedBytes = FS.manifest[path];
          if (typeof storedBytes === `number`) {
            acc[path] = {
              totalBytes: storedBytes,
              bytesOnDisk: storedBytes,
            };
          }
          return acc;
        }, {}),
      ),
    );
  }, [dispatch]);

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
      dispatch(fetchAudios());
      dispatch(fetchEditions());
      Service.downloadLatestEbookCss();
    }
  }, [dispatch, networkConnected, fetchedResources, setFetchedResources]);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator headerMode="screen" initialRouteName="Home">
          <Stack.Screen name="Home" options={{ title: t`Home` }} component={Home} />
          <Stack.Screen
            name="EBookList"
            options={{ title: t`Ebooks` }}
            component={BookList}
            initialParams={{ resourceType: `edition` }}
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
            options={{ title: t`Audiobooks` }}
            component={BookList}
            initialParams={{ resourceType: `audio` }}
          />
          <Stack.Screen name="Listen" options={{ title: t`Listen` }} component={Audio} />
          <Stack.Screen name="Ebook" options={{ title: `Read` }} component={Ebook} />
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
