import React, { PureComponent, useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';
import { EditionResource, StackParamList, EbookColorScheme } from '../types';
import { StackNavigationProp, useHeaderHeight } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Sans } from '../components/Text';
import tw from '../lib/tailwind';
import { useSelector, PropSelector, useDispatch, Dispatch } from '../state';
import * as select from '../state/selectors/edition';
import { readScreenProps } from './read-helpers';
import { wrapHtml, Message } from '../lib/ebook-code';
import { setEbookPosition } from '../state/editions/ebook-position';
import { setEbookColorScheme, setEbookFontSize } from '../state/preferences';

export type Props =
  | { state: `loading` }
  | { state: `error`; reason: 'no_internet' | 'unknown' }
  | {
      state: `ready`;
      position: number;
      editionId: string;
      html: string;
      css: string;
      colorScheme: EbookColorScheme;
      fontSize: number;
      dispatch: Dispatch;
      // setNavigationHeaderShown: (shouldShow: boolean) => unknown;
      // setEbookFontsize: typeof setEbookFontSize;
      // setColorScheme: typeof setEbookColorScheme;
      setPosition: typeof setEbookPosition;
    };

const Read: React.FC<Props> = (props) => {
  // @ts-ignore
  console.log(`render`, props.position);

  const [headerShown, setHeaderShown] = useState(true);
  const webViewRef = useRef<{ injectJavaScript: (js: string) => void }>(null);
  const [localColorScheme, setLocalColorScheme] = useState<EbookColorScheme>(
    props.state === `ready` ? props.colorScheme : `white`,
  );

  useEffect(() => {
    if (props.state === `ready`) {
      // props.setNavigationHeaderShown(headerShown);
    }
  }, [headerShown, props.state]);

  if (props.state === `loading`) {
    return (
      <View>
        <Sans>Loading</Sans>
      </View>
    );
  }

  if (props.state === `error`) {
    return (
      <View>
        <Sans>Error: {props.reason}</Sans>
      </View>
    );
  }

  const {
    css,
    html,
    colorScheme,
    fontSize,
    position,
    editionId,
    dispatch,
    // incrementFontSize,
    // decrementFontSize,
    // setColorScheme,
    setPosition,
    // setNavigationHeaderShown,
  } = props;

  return (
    <View style={tw`bg-red-100 flex-grow`}>
      <StatusBar hidden={!headerShown} />
      {/* <TouchableOpacity
        style={tw`p-3 bg-blue-100 border-b`}
        onPress={() => {
          const nextColorScheme: EbookColorScheme = ({
            white: `black`,
            black: `sepia`,
            sepia: `white`,
          } as const)[localColorScheme];
          setColorScheme(nextColorScheme);
          setLocalColorScheme(nextColorScheme);
          // PICK UP HERE 👍
          // setNavigationHeaderShown(false);
          webViewRef.current?.injectJavaScript(`
            document.body.classList = "theme--${nextColorScheme} font-size--${fontSize}";
            true;
          `);
        }}
      >
        <Sans size={11}>HEIGHT: {headerHeight}</Sans>
      </TouchableOpacity> */}
      <View style={tw`bg-green-100 flex-grow`}>
        <WebView
          /* @ts-ignore */
          ref={webViewRef}
          decelerationRate="normal"
          on
          onMessage={(e) => {
            const message: Message = JSON.parse(e.nativeEvent.data);
            console.log(`received a message`, message);
            switch (message.type) {
              case `update_position`:
                return dispatch(
                  setPosition({ editionId: editionId, position: message.position }),
                );
              case `click`:
              // setHeaderShown(!headerShown);
              // setNavigationHeaderShown(!headerShown);
            }
          }}
          source={{ html: wrapHtml(html, css, colorScheme, fontSize, position) }}
        />
      </View>
    </View>
  );
};

interface OwnProps {
  navigation: StackNavigationProp<StackParamList, 'Read'>;
  route: RouteProp<StackParamList, 'Read'>;
}

export interface SyncProps {
  resource: Pick<EditionResource, 'url' | 'revision' | 'id'>;
  isNetworkConnected: boolean;
  position: number;
  fontSize: number;
  colorScheme: EbookColorScheme;
  setNavigationHeaderShown: (shouldShow: boolean) => unknown;
}

const propSelector: PropSelector<OwnProps, SyncProps> = (ownProps, dispatch) => (
  state,
) => {
  const editionId = ownProps.route.params.resourceId;
  const resource = select.editionResource(editionId, state);
  if (!resource) return null;
  return {
    resource,
    colorScheme: state.preferences.ebookColorScheme,
    fontSize: state.preferences.ebookFontSize,
    position: select.ebookPosition(editionId, state),
    isNetworkConnected: state.network.connected,
    setNavigationHeaderShown: (shouldShow) =>
      ownProps.navigation.setOptions({ headerShown: shouldShow }),
  };
};

const ReadContainer: React.FC<OwnProps> = (ownProps) => {
  type EbookState =
    | { state: `loading` }
    | { state: `error`; reason: 'no_internet' | 'unknown' }
    | { state: `ready`; html: string; css: string };

  const [ebook, setEbook] = useState<EbookState>({ state: `loading` });
  const [memoPosition, setMemoPosition] = useState<number | null>(null);
  const dispatch = useDispatch();
  const selected = useSelector(propSelector(ownProps, dispatch));
  if (!selected) {
    return <Read state="error" reason="unknown" />;
  }

  // ownProps.navigation.setOptions({ headerShown: true });

  const {
    isNetworkConnected,
    position,
    fontSize,
    colorScheme,
    setNavigationHeaderShown,
    resource,
  } = selected;

  useEffect(() => {
    if (
      ebook.state === `loading` ||
      (ebook.state === `error` && ebook.reason === `no_internet` && isNetworkConnected)
    ) {
      (async () => {
        const result = await readScreenProps(resource, isNetworkConnected);
        if (result.success) {
          setMemoPosition(position);
          setEbook({ state: `ready`, ...result.value });
        } else {
          setEbook({ state: `error`, reason: result.error });
        }
      })();
    }
  }, [
    ebook.state,
    ebook.state === `error` ? ebook.reason : null,
    isNetworkConnected,
    setEbook,
    resource.id,
    resource.url,
    resource.revision,
  ]);

  if (ebook.state !== `ready`) {
    return <Read {...ebook} />;
  }

  return (
    <Read
      {...ebook}
      editionId={resource.id}
      position={memoPosition ?? position}
      colorScheme={colorScheme}
      fontSize={fontSize}
      setPosition={setEbookPosition}
      dispatch={dispatch}
    />
  );
};

export default ReadContainer;
