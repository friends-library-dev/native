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
      setPosition: typeof setEbookPosition;
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

    const { dispatch, setPosition, editionId } = this.props;
    const message: Message = JSON.parse(event.nativeEvent.data);

    switch (message.type) {
      case `update_position`:
        return dispatch(
          setPosition({ editionId: editionId, position: message.position }),
        );
      case `click`:
        // TODO, hide/show but check out webView `onTap`...
        break;
    }
  };

  render() {
    console.log(`pure component render`);

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
 * This type models the props we can get immediately from state.
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
  const [ebook, setEbook] = useState<ContainerState>({ state: `loading` });
  const dispatch = useDispatch();
  const selected = useSelector(propSelector(ownProps, dispatch));
  if (!selected) {
    return <Read state="error" reason="unknown" />;
  }

  const { networkConnected, position, fontSize, colorScheme, resource } = selected;

  useEffect(() => {
    if (
      ebook.state === `loading` ||
      (ebook.state === `error` && ebook.reason === `no_internet` && networkConnected)
    ) {
      (async () => {
        const result = await readScreenProps(resource, networkConnected);
        if (result.success) {
          setEbook({ state: `ready`, ...result.value, initialPosition: position });
        } else {
          setEbook({ state: `error`, reason: result.error });
        }
      })();
    }
  }, [
    ebook.state,
    ebook.state === `error` ? ebook.reason : null,
    networkConnected,
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
      position={ebook.initialPosition}
      colorScheme={colorScheme}
      fontSize={fontSize}
      setPosition={setEbookPosition}
      dispatch={dispatch}
    />
  );
};

export default ReadContainer;
