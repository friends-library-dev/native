import React, { PureComponent, useEffect, useState } from 'react';
import { View, StatusBar } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { EditionResource, StackParamList, EbookColorScheme } from '../types';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Sans } from '../components/Text';
import tw from '../lib/tailwind';
import { useSelector, PropSelector, useDispatch, Dispatch } from '../state';
import * as select from '../state/selectors/edition';
import { readScreenProps } from './read-helpers';
import { wrapHtml, Message } from '../lib/ebook-code';
import { setEbookPosition } from '../state/editions/ebook-position';
import { Html } from '@friends-library/types';
import { setEbookColorScheme } from '../state/preferences';

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
    };

class Read extends PureComponent<Props> {
  private htmlRef: React.MutableRefObject<Html | null>;
  private webViewRef: React.RefObject<WebView>;

  public constructor(props: Props) {
    super(props);
    this.webViewRef = React.createRef();
    this.htmlRef = React.createRef();
  }

  public componentDidUpdate(prevProps: Props) {
    // TODO - forward font-size, color-scheme changes into webview js
  }

  public handleWebViewMessage = (event: WebViewMessageEvent) => {
    if (this.props.state !== `ready`) {
      return;
    }

    const { dispatch, editionId } = this.props;
    const message: Message = JSON.parse(event.nativeEvent.data);

    switch (message.type) {
      case `update_position`:
        return dispatch(
          setEbookPosition({ editionId: editionId, position: message.position }),
        );
      case `click`:
        // TODO, hide/show but check out webView `onTap`...
        break;
    }
  };

  render() {
    if (this.props.state === `loading`) {
      return (
        <View>
          <Sans>Loading</Sans>
        </View>
      );
    }

    if (this.props.state === `error`) {
      return (
        <View>
          <Sans>Error: {this.props.reason}</Sans>
        </View>
      );
    }

    const { html, css, colorScheme, fontSize, position } = this.props;
    if (this.htmlRef.current === null) {
      this.htmlRef.current = wrapHtml(html, css, colorScheme, fontSize, position);
    }
    return (
      <View style={tw`flex-grow`}>
        <WebView
          showsVerticalScrollIndicator={false}
          ref={this.webViewRef}
          decelerationRate="normal"
          onMessage={this.handleWebViewMessage}
          source={{ html: this.htmlRef.current }}
        />
      </View>
    );
  }
}

/**
 * The `html` and `css` props (for rendering the ebook)
 * we have to get _asynchronously_ from the filesystem or network.
 * This type models the rest of the props we can get immediately from state.
 */
export interface SyncProps {
  resource: Pick<EditionResource, 'url' | 'revision' | 'id'>;
  networkConnected: boolean;
  position: number;
  fontSize: number;
  colorScheme: EbookColorScheme;
}

interface OwnProps {
  navigation: StackNavigationProp<StackParamList, 'Read'>;
  route: RouteProp<StackParamList, 'Read'>;
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
    networkConnected: state.network.connected,
  };
};

type ContainerState =
  | { state: `loading` }
  | { state: `error`; reason: 'no_internet' | 'unknown' }
  | { state: `ready`; html: string; css: string; initialPosition: number };

const ReadContainer: React.FC<OwnProps> = (ownProps) => {
  const [containerState, setContainerState] = useState<ContainerState>({
    state: `loading`,
  });
  const dispatch = useDispatch();
  const props = useSelector(propSelector(ownProps, dispatch));

  useEffect(() => {
    if (!props) {
      setContainerState({ state: `error`, reason: `unknown` });
      return;
    }

    const shouldNetworkRetry =
      containerState.state === `error` &&
      containerState.reason === `no_internet` &&
      props.networkConnected === true;

    if (containerState.state === `loading` || shouldNetworkRetry) {
      (async () => {
        const result = await readScreenProps(props.resource, props.networkConnected);
        if (result.success) {
          setContainerState({
            state: `ready`,
            initialPosition: props.position,
            ...result.value,
          });
        } else {
          setContainerState({ state: `error`, reason: result.error });
        }
      })();
    }
  }, [
    containerState.state,
    containerState.state === `error` ? containerState.reason : null,
    props?.networkConnected,
    setContainerState,
    props?.resource.id,
    props?.resource.url,
    props?.resource.revision,
  ]);

  if (containerState.state !== `ready`) {
    return <Read {...containerState} />;
  }

  return (
    <Read
      {...containerState}
      editionId={props!.resource.id}
      position={containerState.initialPosition}
      colorScheme={props!.colorScheme}
      fontSize={props!.fontSize}
      dispatch={dispatch}
    />
  );
};

export default ReadContainer;
