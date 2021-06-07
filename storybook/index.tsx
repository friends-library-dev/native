import React from 'react';
import { AppRegistry } from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import { getStorybookUI, configure, addDecorator } from '@storybook/react-native';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { State, INITIAL_STATE } from '../state';
import Editions from '../lib/Editions';
import resources from './edition-resources';
import './rn-addons';

const store = createStore(() => {
  const state: State = { ...INITIAL_STATE };
  return state;
}, applyMiddleware(thunk));

Editions.setResources(resources);
SplashScreen.hide();

addDecorator((Story: any) => (
  <Provider store={store}>
    <Story />
  </Provider>
));

// import stories
configure(() => {
  require(`./stories`);
  require(`./stories/stories.ebook-settings`);
  require(`./stories/stories.audio-screen`);
  require(`./stories/stories.scrubber`);
  require(`./stories/stories.downloadable-part`);
}, module);

// Refer to https://github.com/storybookjs/storybook/tree/master/app/react-native#start-command-parameters
// To find allowed options for getStorybookUI
const StorybookUIRoot = getStorybookUI({ asyncStorage: null });

// If you are using React Native vanilla and after installation you don't see your app name here, write it manually.
// If you use Expo you can safely remove this line.
AppRegistry.registerComponent(`%APP_NAME%`, () => StorybookUIRoot);

export default StorybookUIRoot;
