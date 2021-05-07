import React, { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { t } from '@friends-library/locale';
import { StackParamList } from '../types';
import Home from '../screens/Home';
import AllAudios from '../screens/AllAudios';
import Audio from '../screens/Audio';
import Settings from '../screens/Settings';
import Ebooks from '../screens/Ebooks';
import Read from '../screens/Read';
import { useDispatch } from '../state';
import { setConnected } from '../state/network';

const Stack = createStackNavigator<StackParamList>();

const App: React.FC = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    return NetInfo.addEventListener((state) => {
      dispatch(setConnected(state.isConnected));
    });
  }, [dispatch]);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" options={{ title: t`Home` }} component={Home} />
        <Stack.Screen name="Ebooks" options={{ title: `Ebooks` }} component={Ebooks} />
        <Stack.Screen name="Read" options={{ title: `Read` }} component={Read} />
        <Stack.Screen
          name="Audiobooks"
          options={{ title: t`Audiobooks` }}
          component={AllAudios}
        />
        <Stack.Screen name="Listen" options={{ title: t`Listen` }} component={Audio} />
        <Stack.Screen
          name="Settings"
          options={{ title: t`Settings` }}
          component={Settings}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
