import React, { useRef, useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
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

type Theme = 'white' | 'black' | 'sepia';

const TEST = 3026; // contraries

const initJs = `
  // window.scrollTo(0, ${TEST});
  let lastScroll = 0;
  setInterval(() => {
    const newScroll = window.scrollY;
    if (newScroll !== lastScroll) {
      window.ReactNativeWebView.postMessage(String(window.scrollY));
    }
    lastScroll = newScroll;
  }, 1000);
`;

const Read: React.FC<Props> = ({ route }) => {
  const [theme, setTheme] = useState<Theme>(`white`);
  const [scroll, setScroll] = useState(0);
  const [counter, setCounter] = useState(0);
  const editionId = route.params.resourceId;
  const webViewRef = useRef<{ injectJavaScript: (js: string) => void }>(null);

  return (
    <View style={tw`bg-red-100 flex-grow`}>
      <TouchableOpacity
        style={tw`p-3 bg-blue-100 border-b`}
        onPress={() => {
          const nextTheme: Theme = ({
            white: `black`,
            black: `sepia`,
            sepia: `white`,
          } as const)[theme];
          setTheme(nextTheme);
          webViewRef.current?.injectJavaScript(`true;`);
        }}
      >
        <Sans size={13}>
          {editionId} {scroll} {counter}
        </Sans>
      </TouchableOpacity>
      <View style={tw`bg-green-100 flex-grow`}>
        <WebView
          /* @ts-ignore */
          ref={webViewRef}
          decelerationRate="normal"
          // injectedJavaScript="document.body.classList.add('theme--sepia'); true;"
          // injectedJavaScriptBeforeContentLoaded="document.body.classList.remove('theme--white');document.body.classList.add('theme--sepia');"
          onMessage={(e) => {
            setScroll(Number(e.nativeEvent.data));
            setCounter(counter + 1);
          }}
          injectedJavaScript={initJs}
          source={{
            uri: `https://flp-assets.nyc3.digitaloceanspaces.com/en/catherine-payton/letter-to-brother/modernized/web/chapter-1.html#fn-call__2`,
          }}
        />
      </View>
    </View>
  );
};

export default Read;
